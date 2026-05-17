import Chat from "../models/Chat.js";
import { streamAnswer } from "../service/llmService.js";

const MAX_HISTORY = 5;
const MAX_RESPONSE_CHARS = 12000;

const normalizeConversationId = (value = "") =>
  String(value || "").trim().slice(0, 120);

const createConversationId = () =>
  `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const buildVisibleChatMatch = ({ userId, conversationId = "" }) => {
  const match = {
    user: userId,
    isHidden: { $ne: true },
  };

  if (conversationId) {
    match.conversationId = conversationId;
  }

  return match;
};

const resolveLatestConversationId = async (userId) => {
  const latestChat = await Chat.findOne({
    user: userId,
    isHidden: { $ne: true },
  })
    .sort({ createdAt: -1, _id: -1 })
    .select("conversationId")
    .lean();

  return normalizeConversationId(latestChat?.conversationId);
};

const writeSse = (res, payload) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const serializeChatMetadata = (metadata = {}) => ({
  provider: metadata?.provider || "fallback",
  retrievedMovies: (metadata?.retrieved_movies || []).map((movie) => ({
    tmdb_id: movie.tmdb_id,
    title: movie.title,
    score: movie.score,
  })),
  activeMovie: metadata?.active_movie
    ? {
        tmdb_id: metadata.active_movie.tmdb_id ?? null,
        title: metadata.active_movie.title || "",
        score: metadata.active_movie.score ?? null,
      }
    : null,
});

export const streamChat = async (req, res) => {
  const requestStartedAt = Date.now();
  const question = req.body?.question?.trim();
  const requestedConversationId = normalizeConversationId(
    req.body?.conversationId,
  );

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
    const historyConversationId =
      requestedConversationId || (await resolveLatestConversationId(req.userId));
    const activeConversationId =
      requestedConversationId || historyConversationId || createConversationId();

    const history = await Chat.find(
      buildVisibleChatMatch({
        userId: req.userId,
        conversationId: historyConversationId,
      }),
    )
      .sort({ createdAt: -1, _id: -1 })
      .limit(MAX_HISTORY)
      .lean();
    const historyMs = Date.now() - historyStartedAt;

    const aiStartedAt = Date.now();
    const { provider, answer, metadata } = await streamAnswer({
      question,
      user: req.user,
      userId: req.userId,
      conversationId: activeConversationId,
      history,
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

    const chatMetadata = serializeChatMetadata(metadata);

    if (safeAnswer) {
      await Chat.create({
        user: req.userId,
        conversationId: activeConversationId,
        question,
        answer: safeAnswer,
        metadata: chatMetadata,
      });
    }

    writeSse(res, {
      type: "done",
      provider,
      saved: Boolean(safeAnswer),
      conversationId: activeConversationId,
      metadata: chatMetadata,
    });

    console.info(
      "Chat timing | question='%s' | history_ms=%d | ai_first_chunk_ms=%s | ai_total_ms=%d | total_ms=%d | provider=%s",
      question.slice(0, 80),
      historyMs,
      firstChunkMs === null ? "n/a" : String(firstChunkMs),
      aiMs,
      Date.now() - requestStartedAt,
      provider || "unknown",
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
    const requestedConversationId = normalizeConversationId(
      req.query?.conversationId,
    );
    const activeConversationId =
      requestedConversationId || (await resolveLatestConversationId(req.userId));

    const chats = await Chat.find(
      buildVisibleChatMatch({
        userId: req.userId,
        conversationId: activeConversationId,
      }),
    )
      .sort({ createdAt: -1, _id: -1 })
      .limit(MAX_HISTORY)
      .lean();

    res.json({
      success: true,
      conversationId: activeConversationId || null,
      history: chats.map((chat) => ({
        id: chat._id,
        conversationId: chat.conversationId || null,
        question: chat.question,
        answer: chat.answer,
        createdAt: chat.createdAt,
        metadata: {
          provider: chat.metadata?.provider || "fallback",
          retrievedMovies: chat.metadata?.retrievedMovies || [],
          activeMovie: chat.metadata?.activeMovie || null,
        },
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

export const deleteChatHistory = async (req, res) => {
  try {
    await Chat.deleteMany({ user: req.userId });
    res.json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    console.error("deleteChatHistory error:", error);
    res.status(500).json({ success: false, message: "Failed to clear chat history" });
  }
};
