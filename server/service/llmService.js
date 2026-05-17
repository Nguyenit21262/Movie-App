import axios from "axios";

const MAX_HISTORY_ITEMS = 5;
const VIETNAMESE_ACCENT_RE =
  /[\u0102\u0103\u00C2\u00E2\u00CA\u00EA\u00D4\u00F4\u01A0\u01A1\u01AF\u01B0\u0110\u0111\u1EA0-\u1EF9]/;
const VIETNAMESE_HINT_WORDS = new Set([
  "ban",
  "bo",
  "cam",
  "cho",
  "chao",
  "co",
  "cua",
  "dao",
  "de",
  "dien",
  "duoc",
  "gi",
  "goi",
  "hay",
  "hen",
  "la",
  "lai",
  "minh",
  "mot",
  "muon",
  "nao",
  "nen",
  "nay",
  "on",
  "phim",
  "the",
  "toi",
  "ve",
  "xem",
  "tam",
]);
const VIETNAMESE_HINT_PHRASES = [
  "toi muon",
  "minh muon",
  "xin chao",
  "cam on",
  "tam biet",
  "hen gap lai",
  "muon xem",
  "goi y",
  "bo phim",
  "phim nay",
  "phim do",
  "the loai",
  "dao dien",
  "dien vien",
  "noi dung",
  "tom tat",
];

const normalizeLanguageText = (text = "") =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const detectResponseLanguage = (text = "") => {
  const rawText = String(text || "");
  if (VIETNAMESE_ACCENT_RE.test(rawText)) return "vi";

  const normalized = normalizeLanguageText(rawText);
  if (!normalized) return "en";
  if (VIETNAMESE_HINT_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return "vi";
  }

  const words = normalized.split(/\s+/);
  const hits = words.filter((word) => VIETNAMESE_HINT_WORDS.has(word));
  return new Set(hits).size >= 2 ? "vi" : "en";
};

const responseLanguageLabel = (language) =>
  language === "vi" ? "Vietnamese" : "English";

const normalizeHistoryPayload = (history = []) =>
  history
    .slice(0, MAX_HISTORY_ITEMS)
    .reverse()
    .map((item) => ({
      question: item?.question || "",
      answer: item?.answer || "",
      createdAt: item?.createdAt || null,
      metadata: {
        retrievedMovies: (item?.metadata?.retrievedMovies || []).map((movie) => ({
          tmdb_id: movie?.tmdb_id ?? null,
          title: movie?.title || "",
          score: movie?.score ?? null,
        })),
        activeMovie: item?.metadata?.activeMovie || null,
      },
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

const buildFallbackPrompt = ({
  question,
  user,
  userId,
  history = [],
}) => {
  const responseLanguage = detectResponseLanguage(question);
  const responseLanguageName = responseLanguageLabel(responseLanguage);
  const historyBlock = history.length
    ? history
        .slice(0, MAX_HISTORY_ITEMS)
        .reverse()
        .map(
          (item, index) =>
            `Conversation ${index + 1}:\nQuestion: ${item.question}\nAnswer: ${item.answer}`,
        )
        .join("\n\n")
    : "No recent conversation history.";

  return `
You are an intelligent movie assistant for a cinema web app.

USER PROFILE:
- User ID: ${String(user?._id || userId || "")}
- Name: ${user?.name || "Unknown"}
- Role: ${user?.role || "user"}

RECENT CHAT HISTORY:
${historyBlock}

INSTRUCTIONS:
1. Answer only in ${responseLanguageName}. The chatbot supports only Vietnamese and English responses.
2. If AI-service retrieval is unavailable, say you are answering without the local movie knowledge base.
3. Do not invent movie facts you are unsure about.
4. Be conversational, concise, and helpful.
5. Do not mention movie ratings, scores, stars, or vote averages. Focus on the movie plot and why it fits the user's request.

USER QUESTION:
${question}
  `.trim();
};

const streamExternalMovieAI = async ({
  conversationId,
  question,
  user,
  userId,
  history,
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
        conversationId ||
        process.env.AI_CONVERSATION_ID ||
        "movie-app-conversation",
      user_id: String(userId),
      question,
      user: normalizeUserPayload(user, userId),
      history: normalizeHistoryPayload(history),
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

const buildFallbackAnswer = ({ question }) => {
  if (detectResponseLanguage(question) === "vi") {
    return [
      `Mình chưa kết nối được AI movie service cho câu hỏi "${question}", nên đang trả lời không có kho tri thức phim cục bộ.`,
      "Bạn có thể hỏi bằng tên phim, thể loại, diễn viên, tâm trạng hoặc từ khóa cốt truyện.",
      "Để có câu trả lời RAG đầy đủ, hãy kiểm tra AI_MOVIE_API_URL và Python AI service.",
    ].join(" ");
  }

  return [
    `I could not reach the AI movie service for "${question}", so I am answering without the local movie knowledge base.`,
    "Try asking with a movie title, genre, actor, mood, or plot keyword.",
    "To get full RAG answers, make sure AI_MOVIE_API_URL and the Python AI service are running.",
  ].join(" ");
};

export const streamAnswer = async ({
  conversationId,
  question,
  user,
  userId,
  history = [],
  onChunk,
}) => {
  try {
    const externalResult = await streamExternalMovieAI({
      conversationId,
      question,
      user,
      userId,
      history,
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

  const fallbackAnswer = buildFallbackAnswer({ question });
  onChunk(fallbackAnswer);

  return {
    provider: "fallback",
    answer: fallbackAnswer,
    metadata: {},
  };
};
