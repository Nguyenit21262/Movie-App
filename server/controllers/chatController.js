import Chat from "../models/Chat.js";
import {
  getPersonalizedRecommendations,
} from "../service/recommendationService.js";
import { streamAnswer } from "../service/llmService.js";

const MAX_HISTORY = 20;
const MAX_RESPONSE_CHARS = 12000;

const writeSse = (res, payload) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const streamChat = async (req, res) => {
  const requestStartedAt = Date.now();
  const question = req.body?.question?.trim();

  if (!question) {
    return res
      .status(400)
      .json({ success: false, message: "Question is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  let completeAnswer = "";
  let firstChunkAt = null;

  try {
    const historyStartedAt = Date.now();
    const history = await Chat.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY)
      .lean();
    const historyMs = Date.now() - historyStartedAt;

    const recommendationsStartedAt = Date.now();
    const { recommendations } = await getPersonalizedRecommendations({
      user: req.user,
      question,
      limit: 5,
    });
    const recommendationsMs = Date.now() - recommendationsStartedAt;

    const aiStartedAt = Date.now();
    const { provider, answer, metadata } = await streamAnswer({
      question,
      user: req.user,
      userId: req.userId,
      history,
      recommendedMovies: recommendations,
      onChunk: (chunk) => {
        if (firstChunkAt === null) {
          firstChunkAt = Date.now();
        }
        completeAnswer += chunk;
        writeSse(res, { type: "chunk", content: chunk });
      },
    });
    const aiMs = Date.now() - aiStartedAt;
    const firstChunkMs = firstChunkAt === null ? null : firstChunkAt - aiStartedAt;

    const safeAnswer = (answer || completeAnswer).trim().slice(0, MAX_RESPONSE_CHARS);

    if (safeAnswer) {
      await Chat.create({
        user: req.userId,
        question,
        answer: safeAnswer,
        metadata: {
          provider,
          retrievedMovies: (metadata?.retrieved_movies || []).map((movie) => ({
            tmdb_id: movie.tmdb_id,
            title: movie.title,
            score: movie.score,
          })),
          recommendedMovies: recommendations.map((movie) => ({
            tmdb_id: movie.tmdb_id,
            title: movie.title,
            score: movie.score,
            source: movie.source,
          })),
        },
      });
    }

    writeSse(res, {
      type: "done",
      provider,
      saved: Boolean(safeAnswer),
    });

    console.info(
      "Chat timing | question='%s' | history_ms=%d | recommendations_ms=%d | ai_first_chunk_ms=%s | ai_total_ms=%d | total_ms=%d | provider=%s | recommendations=%d",
      question.slice(0, 80),
      historyMs,
      recommendationsMs,
      firstChunkMs === null ? "n/a" : String(firstChunkMs),
      aiMs,
      Date.now() - requestStartedAt,
      provider || "unknown",
      recommendations.length,
    );
  } catch (error) {
    console.error("streamChat error:", error);
    writeSse(res, {
      type: "error",
      message: error.message || "Failed to process chat request",
    });
  } finally {
    res.end();
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      history: chats.map((chat) => ({
        id: chat._id,
        question: chat.question,
        answer: chat.answer,
        createdAt: chat.createdAt,
      })),
    });
  } catch (error) {
    console.error("getChatHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load chat history",
    });
  }
};
