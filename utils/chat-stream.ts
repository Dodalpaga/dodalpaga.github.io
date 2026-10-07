export type ChatEvent = Record<string, unknown>;

// Stop on a terminal event even if a proxy leaves the connection open. A closed
// connection without a terminal event is an interrupted answer, not success.
export async function readChatStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ChatEvent) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const consume = (line: string): boolean => {
    if (!line.startsWith('data:')) return false;
    let event: ChatEvent;
    try {
      event = JSON.parse(line.slice(5).trim());
    } catch {
      return false;
    }
    onEvent(event);
    return event.type === 'done' || event.type === 'error';
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (consume(line)) return;
      }
      if (done) {
        if (buffer && consume(buffer)) return;
        throw new Error('The connection closed before the answer finished. Please retry.');
      }
    }
  } finally {
    // Do not wait indefinitely for a remote producer to acknowledge cancel.
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
