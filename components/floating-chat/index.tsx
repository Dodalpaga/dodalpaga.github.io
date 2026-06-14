'use client';

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import './styles.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStepType = 'thinking' | 'tool_call' | 'tool_result';

interface AgentStep {
  type: AgentStepType;
  id?: string;
  content?: string;
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  isStreaming?: boolean;
  timestamp: Date;
  steps: AgentStep[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const getUserId = (): string => {
  const KEY = 'llm_chat_user_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
};

const formatTime = (d?: Date) =>
  d
    ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

const truncate = (s: string, n = 20) =>
  s.length > n ? s.slice(0, n) + '…' : s;

const prettyJson = (v: unknown) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

// ─── Markdown renderer (shared with chatbot) ──────────────────────────────────

const renderInline = (s: string, key: string): React.ReactNode => {
  const parts = s.split(
    /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g,
  );
  return (
    <React.Fragment key={key}>
      {parts.map((p, i) => {
        if (p.startsWith('***') && p.endsWith('***'))
          return (
            <strong key={i}>
              <em>{p.slice(3, -3)}</em>
            </strong>
          );
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('*') && p.endsWith('*'))
          return <em key={i}>{p.slice(1, -1)}</em>;
        if (p.startsWith('`') && p.endsWith('`'))
          return (
            <code key={i} className="md-inline-code">
              {p.slice(1, -1)}
            </code>
          );
        const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch)
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="md-link"
            >
              {linkMatch[1]}
            </a>
          );
        return p;
      })}
    </React.Fragment>
  );
};

const renderBlock = (block: string, key: string): React.ReactNode => {
  const lines = block.split('\n');
  const result: React.ReactNode[] = [];
  let ulItems: string[] = [];
  let olItems: string[] = [];
  let listIdx = 0;

  const flushUl = () => {
    if (!ulItems.length) return;
    result.push(
      <ul key={`ul-${key}-${listIdx++}`} className="md-ul">
        {ulItems.map((it, i) => (
          <li key={i}>{renderInline(it, `li${i}`)}</li>
        ))}
      </ul>,
    );
    ulItems = [];
  };
  const flushOl = () => {
    if (!olItems.length) return;
    result.push(
      <ol key={`ol-${key}-${listIdx++}`} className="md-ol">
        {olItems.map((it, i) => (
          <li key={i}>{renderInline(it, `li${i}`)}</li>
        ))}
      </ol>,
    );
    olItems = [];
  };

  lines.forEach((line, i) => {
    if (/^#{1,3} /.test(line)) {
      flushUl();
      flushOl();
      const lvl = (line.match(/^(#+)/) ?? ['', ''])[1].length;
      const text = line.replace(/^#+\s/, '');
      const Tag = `h${Math.min(lvl + 3, 6)}` as keyof JSX.IntrinsicElements;
      result.push(
        <Tag key={`h-${key}-${i}`} className={`md-h md-h${lvl}`}>
          {renderInline(text, `hi${i}`)}
        </Tag>,
      );
    } else if (/^[-*] /.test(line)) {
      flushOl();
      ulItems.push(line.replace(/^[-*] /, ''));
    } else if (/^\d+\. /.test(line)) {
      flushUl();
      olItems.push(line.replace(/^\d+\. /, ''));
    } else if (line.trim() === '') {
      flushUl();
      flushOl();
      result.push(<br key={`br-${key}-${i}`} />);
    } else {
      flushUl();
      flushOl();
      result.push(
        <span key={`s-${key}-${i}`}>
          {renderInline(line, `il${i}`)}
          {i < lines.length - 1 ? '\n' : ''}
        </span>,
      );
    }
  });
  flushUl();
  flushOl();
  return <React.Fragment key={key}>{result}</React.Fragment>;
};

const renderMarkdown = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const codeBlockRe = /```[\w]*\n?([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > last)
      nodes.push(renderBlock(text.slice(last, match.index), `b${last}`));
    nodes.push(
      <pre key={`cb${match.index}`} className="md-code-block">
        <code>{match[1].trim()}</code>
      </pre>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(renderBlock(text.slice(last), `b${last}`));
  return nodes;
};

// ─── Suggestions ─────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What are you working on? 🚀',
  "What's your tech stack?",
  'Tell me about ESA project',
  'How can I reach you?',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ThinkingBlock = ({ content }: { content: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box className="agent-thinking-wrapper">
      <Box
        className="agent-step-header thinking-header"
        onClick={() => setOpen((o) => !o)}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <PsychologyIcon sx={{ fontSize: 13 }} />
        <span>Thinking</span>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 13, ml: 'auto' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 13, ml: 'auto' }} />
        )}
      </Box>
      <Collapse in={open} timeout={200}>
        <Box className="agent-thinking-content">{content}</Box>
      </Collapse>
    </Box>
  );
};

const ToolCallBlock = ({
  name,
  args,
  result,
}: {
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Box className="agent-tool-wrapper">
      <Box
        className="agent-step-header tool-header"
        onClick={() => setOpen((o) => !o)}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {result !== undefined ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
        ) : (
          <BuildIcon sx={{ fontSize: 13 }} />
        )}
        <code className="tool-name">{name}</code>
        {args && Object.keys(args).length > 0 && (
          <Chip
            label={Object.entries(args)
              .map(([k, v]) => `${k}: ${truncate(String(v))}`)
              .join(' · ')}
            size="small"
            className="tool-args-chip"
          />
        )}
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 13, ml: 'auto' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 13, ml: 'auto' }} />
        )}
      </Box>
      <Collapse in={open} timeout={200}>
        {args && Object.keys(args).length > 0 && (
          <Box className="tool-section">
            <span className="tool-section-label">Input</span>
            <pre className="tool-pre">{prettyJson(args)}</pre>
          </Box>
        )}
        {result !== undefined && (
          <Box className="tool-section">
            <span className="tool-section-label">Output</span>
            <pre className="tool-pre">{prettyJson(result)}</pre>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

const AgentSteps = ({ steps }: { steps: AgentStep[] }) => {
  if (!steps.length) return null;
  const thinking = steps.filter((s) => s.type === 'thinking');
  const calls = steps.filter((s) => s.type === 'tool_call');
  const results = steps.filter((s) => s.type === 'tool_result');
  const paired = calls.map((c) => ({
    ...c,
    result: results.find((r) => r.id === c.id)?.result,
  }));
  return (
    <Box className="agent-steps">
      {thinking.map((s, i) => (
        <ThinkingBlock key={`t${i}`} content={s.content || ''} />
      ))}
      {paired.map((c, i) => (
        <ToolCallBlock
          key={`tc${i}`}
          name={c.name || ''}
          args={c.args}
          result={c.result}
        />
      ))}
    </Box>
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
      <IconButton
        size="small"
        className="msg-action-btn"
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
      >
        {copied ? (
          <CheckIcon sx={{ fontSize: 12, color: 'var(--accent)' }} />
        ) : (
          <ContentCopyIcon sx={{ fontSize: 12 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

// ─── Main FloatingChat ────────────────────────────────────────────────────────

export default function FloatingChat() {
  const { resolvedTheme } = useNextTheme();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const [userId] = useState<string>(() =>
    typeof window !== 'undefined' ? getUserId() : 'ssr_user',
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input & clear badge when opening
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => textFieldRef.current?.focus(), 120);
    }
  }, [open]);

  // ── Streaming core ─────────────────────────────────────────────────────────

  const runStream = useCallback(
    async (userInput: string, botMsgId: string) => {
      abortRef.current = new AbortController();
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/llm/generate-agentic?input=${encodeURIComponent(userInput)}`,
          {
            method: 'POST',
            headers: { 'user-id': userId },
            signal: abortRef.current.signal,
          },
        );
        if (!res.ok || !res.body) throw new Error('Stream unavailable');

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            let ev: Record<string, unknown>;
            try {
              ev = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== botMsgId) return msg;
                switch (ev.type) {
                  case 'thinking':
                    return {
                      ...msg,
                      steps: [
                        ...msg.steps,
                        { type: 'thinking', content: ev.content as string },
                      ],
                    };
                  case 'tool_call':
                    return {
                      ...msg,
                      steps: [
                        ...msg.steps,
                        {
                          type: 'tool_call',
                          id: ev.id as string,
                          name: ev.name as string,
                          args: ev.args as Record<string, unknown>,
                        },
                      ],
                    };
                  case 'tool_result':
                    return {
                      ...msg,
                      steps: [
                        ...msg.steps,
                        {
                          type: 'tool_result',
                          id: ev.id as string,
                          name: ev.name as string,
                          result: ev.result,
                        },
                      ],
                    };
                  case 'text_chunk':
                    return { ...msg, text: msg.text + (ev.content as string) };
                  case 'done':
                    return { ...msg, isStreaming: false };
                  case 'error':
                    return {
                      ...msg,
                      text: (ev.message as string) || 'An error occurred.',
                      isStreaming: false,
                    };
                  default:
                    return msg;
                }
              }),
            );
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    text: 'Something went wrong. Please try again.',
                    isStreaming: false,
                  }
                : msg,
            ),
          );
        }
      } finally {
        setIsLoading(false);
        abortRef.current = null;
        // Increment unread badge if panel is closed or minimized
        if (!openRef.current) setUnread((n) => n + 1);
      }
    },
    [userId],
  );

  // ── Send ───────────────────────────────────────────────────────────────────

  const handleSend = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;
      setIsLoading(true);

      const userMsgId = `user_${Date.now()}`;
      const botMsgId = `bot_${Date.now() + 1}`;

      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          text: userInput,
          type: 'user',
          timestamp: new Date(),
          steps: [],
        },
        {
          id: botMsgId,
          text: '',
          type: 'bot',
          isStreaming: true,
          timestamp: new Date(),
          steps: [],
        },
      ]);

      await runStream(userInput, botMsgId);
    },
    [isLoading, runStream],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSend(input.trim());
    setInput('');
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isStreaming ? { ...msg, isStreaming: false } : msg,
      ),
    );
    setIsLoading(false);
  };

  const handleClear = () => {
    if (isLoading) handleStop();
    setMessages([]);
    setInput('');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <Fade in={open} timeout={{ enter: 280, exit: 220 }} unmountOnExit>
        <Box
          className={`fc-panel ${open ? 'fc-panel--open' : 'fc-panel--closed'}`}
          role="dialog"
          aria-label="Chat panel"
        >
          {/* Header */}
          <Box className="fc-header">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon sx={{ fontSize: 17, color: 'var(--accent)' }} />
              <Box>
                <Typography className="fc-title">Chat with me</Typography>
                <Typography className="fc-subtitle">
                  AI · Agentic · Streaming
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              {messages.length > 0 && (
                <Tooltip title="Clear chat" placement="top">
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    className="fc-icon-btn"
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Close" placement="top">
                <IconButton
                  size="small"
                  onClick={handleClose}
                  className="fc-icon-btn"
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Messages */}
          <Box className="fc-messages">
            {/* Empty state */}
            {messages.length === 0 && (
              <Box className="fc-empty">
                <SmartToyIcon
                  sx={{
                    fontSize: 38,
                    opacity: 0.18,
                    color: 'var(--foreground)',
                  }}
                />
                <Typography className="fc-empty-text">
                  Ask about my background, projects, or skills.
                </Typography>
                <Box className="fc-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      onClick={() => handleSend(s)}
                      disabled={isLoading}
                      className="fc-suggestion-chip"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Bubbles */}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                className={`fc-msg-row fc-msg-row--${msg.type}`}
              >
                {/* Avatar */}
                <Box className={`fc-avatar fc-avatar--${msg.type}`}>
                  {msg.type === 'user' ? (
                    <PersonIcon sx={{ fontSize: 12, color: 'var(--accent)' }} />
                  ) : (
                    <SmartToyIcon
                      sx={{ fontSize: 12, color: 'var(--foreground-muted)' }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Box className="fc-msg-content">
                  {msg.type === 'bot' && msg.steps.length > 0 && (
                    <AgentSteps steps={msg.steps} />
                  )}

                  {(msg.text || msg.isStreaming) && (
                    <Box className={`fc-bubble fc-bubble--${msg.type}`}>
                      {msg.type === 'bot' && msg.text ? (
                        <Box className="md-content">
                          {renderMarkdown(msg.text)}
                        </Box>
                      ) : (
                        msg.text
                      )}
                      {msg.isStreaming && !msg.text && (
                        <Box component="span" className="loading-dots">
                          <span />
                          <span />
                          <span />
                        </Box>
                      )}
                      {msg.isStreaming && msg.text && (
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: '2px',
                            height: '1em',
                            backgroundColor: 'currentColor',
                            ml: '2px',
                            verticalAlign: 'text-bottom',
                            animation: 'blink 1s step-end infinite',
                            '@keyframes blink': {
                              '0%,100%': { opacity: 1 },
                              '50%': { opacity: 0 },
                            },
                          }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Meta */}
                  <Box className={`fc-meta fc-meta--${msg.type}`}>
                    <Typography className="fc-time">
                      {formatTime(msg.timestamp)}
                    </Typography>
                    {msg.type === 'bot' && !msg.isStreaming && msg.text && (
                      <CopyButton text={msg.text} />
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            className="fc-input-area"
          >
            <TextField
              inputRef={textFieldRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              variant="outlined"
              placeholder="Ask something… (Enter to send)"
              multiline
              maxRows={3}
              autoComplete="off"
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.84rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--background-2)',
                  color: 'var(--foreground)',
                  '& fieldset': { borderColor: 'var(--card-border)' },
                  '&:hover fieldset': { borderColor: 'var(--accent)' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--accent)',
                    borderWidth: '1px',
                  },
                },
                '& textarea': {
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.84rem',
                },
              }}
            />
            {isLoading ? (
              <Button
                onClick={handleStop}
                variant="outlined"
                className="fc-send-btn"
                sx={{
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                  '&:hover': { backgroundColor: 'var(--accent-muted)' },
                }}
              >
                ■
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={!input.trim()}
                className="fc-send-btn"
                sx={{
                  backgroundColor: 'var(--accent)',
                  '&:hover': {
                    backgroundColor: 'var(--accent-hover, var(--accent))',
                  },
                  '&:disabled': { backgroundColor: 'var(--background-2)' },
                }}
              >
                <SendIcon sx={{ fontSize: 16 }} />
              </Button>
            )}
          </Box>
        </Box>
      </Fade>

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      <Fade in={true}>
        <Box
          component="button"
          className={`fc-fab ${open ? 'fc-fab--open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Open chat"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform .25s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            {open ? (
              <UnfoldLessIcon sx={{ fontSize: 22, color: '#fff' }} />
            ) : (
              <SmartToyIcon sx={{ fontSize: 22, color: '#fff' }} />
            )}
          </Box>
          {unread > 0 && (
            <Box className="fc-badge">{unread > 9 ? '9+' : unread}</Box>
          )}
        </Box>
      </Fade>
    </>
  );
}
