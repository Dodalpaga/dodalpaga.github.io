const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

// Execute the production TypeScript parser without adding a test framework.
const filename = path.join(__dirname, '../utils/chat-stream.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const parser = new Module(filename, module);
parser._compile(compiled, filename);
const { readChatStream } = parser.exports;
const encoder = new TextEncoder();

function stream(chunks, close = true, cancelled = () => {}) {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      if (close) controller.close();
    },
    cancel: cancelled,
  });
}

test('interrupted connection after a tool result rejects instead of spinning', async () => {
  const events = [];
  await assert.rejects(readChatStream(stream([
    'data: {"type":"tool_result","name":"get_current_project"}\n\n',
  ]), e => events.push(e)), /connection closed/);
  assert.equal(events[0].type, 'tool_result');
});

test('done terminates and cancels an otherwise open connection', async () => {
  let cancelled = false;
  const events = [];
  await readChatStream(stream(['data: {"type":"done"}\n\n'], false, () => {
    cancelled = true;
  }), e => events.push(e));
  assert.equal(events.at(-1).type, 'done');
  assert.equal(cancelled, true);
});

test('error is terminal even without a following done', async () => {
  const events = [];
  await readChatStream(stream(['data: {"type":"error","message":"Timeout"}\n\n'], false), e => events.push(e));
  assert.equal(events[0].message, 'Timeout');
});

test('split events, heartbeat comments and CRLF keep the answer intact', async () => {
  const events = [];
  await readChatStream(stream([
    ': keep-alive\n\ndata: {"type":"text_',
    'chunk","content":"Hello"}\r\n\r\ndata:{"type":"done"}\n\n',
  ]), e => events.push(e));
  assert.deepEqual(events.map(e => e.type), ['text_chunk', 'done']);
  assert.equal(events[0].content, 'Hello');
});

test('a final terminal event without newline is consumed at EOF', async () => {
  const events = [];
  await readChatStream(stream(['data: {"type":"done"}']), e => events.push(e));
  assert.equal(events[0].type, 'done');
});

test('reader failure releases the lock and propagates the error', async () => {
  const body = new ReadableStream({ start(controller) { controller.error(new Error('Network failed')); } });
  await assert.rejects(readChatStream(body, () => {}), /Network failed/);
  assert.equal(body.locked, false);
});
