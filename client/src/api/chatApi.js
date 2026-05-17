import { resolveApiUrl } from "./httpClient";

const buildChatHistoryUrl = (conversationId) => {
  const baseUrl = resolveApiUrl("/api/chat/history");
  if (!conversationId) return baseUrl;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}conversationId=${encodeURIComponent(conversationId)}`;
};

export const getChatHistory = async (conversationId) => {
  const response = await fetch(buildChatHistoryUrl(conversationId), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load chat history");
  }

  return response.json();
};

export const clearChatHistory = async () => {
  const response = await fetch(resolveApiUrl("/api/chat/history"), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to clear chat history");
  return response.json();
};

export const streamChat = async ({ question, conversationId, onEvent }) => {
  const response = await fetch(resolveApiUrl("/api/chat/stream"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ question, conversationId }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to stream chat response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const line = event
        .split("\n")
        .map((item) => item.trim())
        .find((item) => item.startsWith("data: "));

      if (!line) continue;

      try {
        onEvent(JSON.parse(line.slice(6)));
      } catch {
        // Ignore malformed event chunks
      }
    }
  }

  if (buffer.trim()) {
    const line = buffer
      .split("\n")
      .map((item) => item.trim())
      .find((item) => item.startsWith("data: "));

    if (line) {
      try {
        onEvent(JSON.parse(line.slice(6)));
      } catch {
        // Ignore malformed trailing event chunks
      }
    }
  }
};
