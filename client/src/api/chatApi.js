import { API_BASE_URL } from "./httpClient";

export const getChatHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load chat history");
  }

  return response.json();
};

export const streamChat = async ({ question, onEvent }) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ question }),
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
};
