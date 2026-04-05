import axios from "axios";

const MAX_HISTORY_ITEMS = 10;

const normalizeHistoryPayload = (history = []) =>
  history.slice(0, MAX_HISTORY_ITEMS).map((item) => ({
    question: item?.question || "",
    answer: item?.answer || "",
    createdAt: item?.createdAt || null,
  }));

const normalizeUserPayload = (user, userId) => ({
  id: String(user?._id || userId || ""),
  name: user?.name || "",
  role: user?.role || "user",
  sex: user?.sex || "",
  occupation: user?.occupation || "",
  currentCity: user?.currentCity || "",
  dateOfBirth: user?.dateOfBirth || null,
});

const normalizeRecommendationPayload = (recommendations = []) =>
  recommendations.map((movie) => ({
    tmdb_id: movie?.tmdb_id ?? null,
    title: movie?.title || "",
    overview: movie?.overview || "",
    genres: movie?.genres || [],
    keywords: movie?.keywords || [],
    runtime: movie?.runtime || 0,
    vote_average: movie?.vote_average || 0,
    count_rating: movie?.count_rating || 0,
    release_date: movie?.release_date || null,
    score: movie?.score ?? null,
    reason: movie?.reason || "",
    source: movie?.source || "",
  }));

const buildFallbackPrompt = ({
  question,
  user,
  userId,
  history = [],
  recommendedMovies = [],
}) => {
  const historyBlock = history.length
    ? history
        .slice(0, MAX_HISTORY_ITEMS)
        .map(
          (item, index) =>
            `Conversation ${index + 1}:\nQuestion: ${item.question}\nAnswer: ${item.answer}`,
        )
        .join("\n\n")
    : "No recent conversation history.";

  const recommendationBlock = recommendedMovies.length
    ? recommendedMovies
        .map((movie, index) => {
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "Unknown";
          const reason = movie.reason ? `\nReason: ${movie.reason}` : "";
          return [
            `Recommendation ${index + 1}: ${movie.title} (${year})`,
            `Genres: ${movie.genres?.join(", ") || "Unknown"}`,
            `Average rating: ${movie.vote_average || "N/A"}/10`,
            reason.trim(),
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n")
    : "No personalized recommendations are currently available.";

  return `
You are an intelligent movie assistant for a cinema web app.

USER PROFILE:
- User ID: ${String(user?._id || userId || "")}
- Name: ${user?.name || "Unknown"}
- Role: ${user?.role || "user"}

RECENT CHAT HISTORY:
${historyBlock}

PERSONALIZED RECOMMENDATIONS:
${recommendationBlock}

INSTRUCTIONS:
1. Answer in the same language as the user's question.
2. If AI-service retrieval is unavailable, say you are answering without the local movie knowledge base.
3. Do not invent movie facts you are unsure about.
4. Be conversational, concise, and helpful.

USER QUESTION:
${question}
  `.trim();
};

const streamExternalMovieAI = async ({
  question,
  user,
  userId,
  history,
  recommendedMovies,
  onChunk,
}) => {
  const baseUrl = process.env.AI_MOVIE_API_URL;
  if (!baseUrl) {
    return { provider: null, answer: "", metadata: {} };
  }

  const response = await axios.post(
    `${baseUrl.replace(/\/$/, "")}/conversation/chat`,
    {
      conversation_id:
        process.env.AI_CONVERSATION_ID ||
        "movie-app-conversation",
      user_id: String(userId),
      question,
      user: normalizeUserPayload(user, userId),
      history: normalizeHistoryPayload(history),
      recommendations: normalizeRecommendationPayload(recommendedMovies),
    },
    {
      headers: { "Content-Type": "application/json" },
      responseType: "stream",
      timeout: 300000,
    },
  );

  let answer = "";
  let metadata = {};
  let upstreamUserMessage = "";

  await new Promise((resolve, reject) => {
    response.data.on("data", (buffer) => {
      const chunks = buffer
        .toString("utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of chunks) {
        if (!line.startsWith("data: ")) continue;

        try {
          const payload = JSON.parse(line.slice(6));
          const message = payload?.data?.message || "";
          const messageType = payload?.data?.type || "";

          if (payload?.status === "success" && messageType === "ai" && message && message !== "[END]") {
            answer += message;
            onChunk(message);
            continue;
          }

          if (payload?.status === "success" && messageType === "done") {
            metadata = payload?.data?.metadata || {};
            continue;
          }

          if (payload?.status === "error") {
            upstreamUserMessage =
              payload?.data?.user_message ||
              payload?.data?.message ||
              upstreamUserMessage;
          }
        } catch {
          // ignore malformed SSE chunks from upstream provider
        }
      }
    });

    response.data.on("end", resolve);
    response.data.on("error", reject);
  });

  if (!answer.trim() && upstreamUserMessage.trim()) {
    onChunk(upstreamUserMessage);
    return {
      provider: "external-movie-ai",
      answer: upstreamUserMessage,
      metadata,
    };
  }

  return { provider: "external-movie-ai", answer, metadata };
};

const streamOpenAICompatible = async ({
  prompt,
  onChunk,
}) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { provider: null, answer: "", metadata: {} };
  }

  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok || !response.body) {
    let errorText = "";

    try {
      errorText = await response.text();
    } catch {
      errorText = "";
    }

    const excerpt = errorText ? ` | ${errorText.slice(0, 500)}` : "";
    throw new Error(
      `Failed to stream from OpenAI-compatible provider (status ${response.status})${excerpt}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const lines = event
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const payload = JSON.parse(data);
          const chunk = payload?.choices?.[0]?.delta?.content || "";
          if (!chunk) continue;

          answer += chunk;
          onChunk(chunk);
        } catch {
          // ignore malformed chunks
        }
      }
    }
  }

  return { provider: "openai-compatible", answer, metadata: {} };
};

const buildFallbackAnswer = ({
  question,
  recommendedMovies = [],
}) => {
  if (!recommendedMovies.length) {
    return [
      "I could not reach the AI movie service, so I am answering without the local movie knowledge base.",
      "Try asking with a movie title, genre, actor, mood, or plot keyword.",
      "To get full RAG answers, make sure AI_MOVIE_API_URL, Qdrant, and Ollama are running.",
    ].join(" ");
  }

  const recommendationLines = recommendedMovies
    .map((movie) => {
      const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "Unknown year";
      const reason = movie.reason ? ` Reason: ${movie.reason}` : "";
      return `- ${movie.title} (${year})${reason}`;
    })
    .join("\n");

  const sections = [`Here are the best matches I found for "${question}":`];

  if (recommendationLines) {
    sections.push(`Personalized recommendations:\n${recommendationLines}`);
  }

  sections.push(
    "The backend is currently using fallback mode. To get full streamed RAG responses, configure AI_MOVIE_API_URL and make sure the Python AI service is running.",
  );

  return sections.join("\n\n");
};

export const streamAnswer = async ({
  question,
  user,
  userId,
  history = [],
  recommendedMovies = [],
  onChunk,
}) => {
  try {
    const externalResult = await streamExternalMovieAI({
      question,
      user,
      userId,
      history,
      recommendedMovies,
      onChunk,
    });

    if (externalResult.provider && externalResult.answer.trim()) {
      return externalResult;
    }
  } catch (error) {
    console.error("External AI stream failed:", error.message);
  }

  try {
    const prompt = buildFallbackPrompt({
      question,
      user,
      userId,
      history,
      recommendedMovies,
    });
    const openAiResult = await streamOpenAICompatible({
      prompt,
      onChunk,
    });

    if (openAiResult.provider && openAiResult.answer.trim()) {
      return openAiResult;
    }
  } catch (error) {
    console.error("OpenAI-compatible stream failed:", error.message);
  }

  const fallbackAnswer = buildFallbackAnswer({
    question,
    recommendedMovies,
  });
  onChunk(fallbackAnswer);

  return {
    provider: "fallback",
    answer: fallbackAnswer,
    metadata: {},
  };
};
