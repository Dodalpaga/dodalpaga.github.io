// app/projects/chatbot/content.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { projectInputSx, projectSelectSx } from '@/constants/ui';
import { readChatStream } from '@/utils/chat-stream';

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
if (!API_BASE_URL && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.error('NEXT_PUBLIC_API_URL is not set — chatbot requests will fail.');
}

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
  // 'use client' components are still pre-rendered on the server for the
  // initial HTML pass — localStorage doesn't exist there, so guard it.
  if (typeof window === 'undefined') return '';
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

const truncate = (s: string, n = 120) =>
  s.length > n ? s.slice(0, n) + '…' : s;
const prettyJson = (v: unknown) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

// ─── Lightweight Markdown Renderer ───────────────────────────────────────────

const renderInline = (s: string, key: string): React.ReactNode => {
  // Split on bold/italic/code/links — links last so [] doesn't conflict with other tokens
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
        // Markdown link: [label](url)
        const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
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
        }
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
  let last = 0,
    match: RegExpExecArray | null;
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

const animateStreamedWords = (nodes: React.ReactNode[]): React.ReactNode[] => {
  let wordIndex = 0;
  const animate = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map((part) => {
        if (!part || /^\s+$/.test(part)) return part;
        return (
          <span className="chat-stream-word" key={`word-${wordIndex++}`}>
            {part}
          </span>
        );
      });
    }
    if (Array.isArray(node)) return node.map(animate);
    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      return React.cloneElement(
        node,
        {},
        React.Children.map(node.props.children, animate),
      );
    }
    return node;
  };
  return nodes.map(animate);
};

const INPUT_MAX_LEN = 1000;
type ApiStatus = 'checking' | 'available' | 'unavailable';

// ─── Suggestions ─────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What are you working on right now? 🚀',
  "What's your AI/ML stack?",
  'Tell me about your Thales experience',
  "What's the ESA project about?",
  'How can I reach you?',
  'Tell me about your studies 🎓',
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
        <PsychologyIcon sx={{ fontSize: 14 }} />
        <span>Thinking</span>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 14, ml: 'auto' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 14, ml: 'auto' }} />
        )}
      </Box>
      <Collapse in={open} timeout={200}>
        <Box className="agent-thinking-content">{content}</Box>
      </Collapse>
    </Box>
  );
};

// Helper: extract a themed image URL from preview_image (string or {light,dark} object)
const resolvePreviewImage = (
  preview: unknown,
  theme: string | undefined,
): string | null => {
  if (!preview) return null;
  if (typeof preview === 'string') return preview;
  if (typeof preview === 'object' && preview !== null) {
    const p = preview as Record<string, string>;
    return theme === 'dark'
      ? (p.dark ?? p.light ?? null)
      : (p.light ?? p.dark ?? null);
  }
  return null;
};

const ProjectCard = ({
  project,
  tagline,
  liveUrl,
  previewUrl,
  status,
}: {
  project: string;
  tagline?: string;
  liveUrl?: string;
  previewUrl?: string;
  status?: string;
}) => (
  <Box className="project-card">
    {previewUrl && (
      <Box className="project-card-img-wrapper">
        <img
          src={previewUrl}
          alt={`${project} preview`}
          className="project-card-img"
          loading="lazy"
        />
      </Box>
    )}
    <Box className="project-card-body">
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        <Typography className="project-card-title">{project}</Typography>
        {status && (
          <Chip label={status} size="small" className="project-card-status" />
        )}
      </Box>
      {tagline && (
        <Typography className="project-card-tagline">{tagline}</Typography>
      )}
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card-link"
        >
          {liveUrl.replace(/^https?:\/\//, '')} ↗
        </a>
      )}
    </Box>
  </Box>
);

const ToolCallBlock = ({
  name,
  args,
  result,
  theme,
}: {
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
  theme?: string;
}) => {
  const [open, setOpen] = useState(false);

  // Detect project result — has preview_image or live_url at minimum
  const r = result as Record<string, unknown> | undefined;
  const isProjectResult = !!(r && (r.preview_image || r.live_url));
  const previewUrl = isProjectResult
    ? (resolvePreviewImage(r.preview_image, theme) ?? undefined)
    : undefined;

  return (
    <Box className="agent-tool-wrapper">
      <Box
        className="agent-step-header tool-header"
        onClick={() => setOpen((o) => !o)}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {result !== undefined ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
        ) : (
          <BuildIcon sx={{ fontSize: 14 }} />
        )}
        <code className="tool-name">{name}</code>
        {args && Object.keys(args).length > 0 && (
          <Chip
            label={Object.entries(args)
              .map(([k, v]) => `${k}: ${truncate(String(v), 24)}`)
              .join(' · ')}
            size="small"
            className="tool-args-chip"
          />
        )}
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 14, ml: 'auto' }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 14, ml: 'auto' }} />
        )}
      </Box>

      {isProjectResult && (
        <Box sx={{ px: 1.5, pt: 1, pb: 1.5 }}>
          <ProjectCard
            project={String(r.project ?? '')}
            tagline={r.tagline ? String(r.tagline) : undefined}
            liveUrl={r.live_url ? String(r.live_url) : undefined}
            previewUrl={previewUrl}
            status={r.status ? String(r.status) : undefined}
          />
        </Box>
      )}

      {/* Raw JSON — inside the collapsible, for devs who want to inspect */}
      <Collapse in={open} timeout={200}>
        {args && Object.keys(args).length > 0 && (
          <Box className="tool-section">
            <span className="tool-section-label">Input</span>
            <pre className="tool-pre">{prettyJson(args)}</pre>
          </Box>
        )}
        {result !== undefined && (
          <Box className="tool-section">
            <span className="tool-section-label">Raw output</span>
            <pre className="tool-pre">{prettyJson(result)}</pre>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

const AgentSteps = ({
  steps,
  theme,
}: {
  steps: AgentStep[];
  theme?: string;
}) => {
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
          theme={theme}
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
          <CheckIcon sx={{ fontSize: 13, color: 'var(--accent)' }} />
        ) : (
          <ContentCopyIcon sx={{ fontSize: 13 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Content() {
  const { resolvedTheme } = useNextTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [apiError, setApiError] = useState('');
  const [apiRetryCount, setApiRetryCount] = useState(0);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTurnIndex, setEditingTurnIndex] = useState<number | null>(null);
  // Messages temporarily removed while editing, restored if the edit is
  // cancelled instead of resent.
  const removedOnEditRef = useRef<Message[]>([]);

  // getUserId() returns '' during SSR (no localStorage there); re-resolve
  // once we're mounted in the browser.
  const [userId, setUserId] = useState(getUserId);
  useEffect(() => {
    if (!userId) setUserId(getUserId());
  }, [userId]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (customElements.get('voice-orb')) return;
    if (document.querySelector('script[data-voice-orb]')) return;
    const script = document.createElement('script');
    script.src =
      'https://aqualang89.github.io/shipnotes-components/components/voice-orb/voice-orb.js';
    script.async = true;
    script.dataset.voiceOrb = 'true';
    document.head.appendChild(script);
  }, []);

  const latestBotMessage = [...messages]
    .reverse()
    .find((message) => message.type === 'bot');
  const orbState = isLoading
    ? latestBotMessage?.text
      ? 'speaking'
      : 'thinking'
    : input.trim()
      ? 'listening'
      : 'idle';
  const orbLabel = {
    idle: 'Ready',
    listening: 'Typing',
    thinking: 'Thinking',
    speaking: 'Responding',
  }[orbState];
  const voiceOrb = (size: number | string) =>
    React.createElement('voice-orb', {
      state: orbState,
      className: 'chat-voice-orb',
      style: { width: size, height: size },
      'aria-label': `Assistant ${orbState}`,
    });

  // auto-scroll only when near bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!showScrollFab) scrollToBottom();
  }, [messages, showScrollFab, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollBoxRef.current;
    if (!el) return;
    setShowScrollFab(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  // Load the model list as the initial health check for the chat API.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setModelsLoading(true);
      setApiStatus('checking');
      setApiError('');
      const healthCheck = new AbortController();
      const healthCheckTimeout = setTimeout(
        () => healthCheck.abort(),
        10_000,
      );
      try {
        if (!API_BASE_URL) throw new Error('Chat API URL is not configured.');
        const res = await fetch(`${API_BASE_URL}/llm/models`, {
          signal: healthCheck.signal,
        });
        if (!res.ok) throw new Error(`Chat API returned ${res.status}.`);
        const data = (await res.json()) as {
          models?: unknown;
          default?: unknown;
        };
        if (!Array.isArray(data.models) || data.models.length === 0) {
          throw new Error('Chat API did not return any models.');
        }
        if (cancelled) return;
        const availableModels = data.models.filter(
          (model): model is string =>
            typeof model === 'string' && model.length > 0,
        );
        if (availableModels.length === 0) {
          throw new Error('Chat API did not return any usable models.');
        }
        setModels(availableModels);
        setSelectedModel(
          typeof data.default === 'string' &&
          availableModels.includes(data.default)
            ? data.default
            : availableModels[0],
        );
        setApiStatus('available');
      } finally {
        clearTimeout(healthCheckTimeout);
        if (!cancelled) setModelsLoading(false);
      }
    })().catch((error: unknown) => {
      if (cancelled) return;
      console.error('Unable to load chatbot models:', error);
      setModels([]);
      setSelectedModel('');
      setApiStatus('unavailable');
      setApiError(
        'The chat service is unavailable. Check your connection and retry.',
      );
    });
    return () => {
      cancelled = true;
    };
  }, [apiRetryCount]);

  const retryApiConnection = () => {
    setModelsLoading(true);
    setApiRetryCount((count) => count + 1);
  };

  const handleModelChange = async (m: string) => {
    if (isLoading || apiStatus !== 'available') return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/llm/set-model?model_name=${encodeURIComponent(m)}`,
        { method: 'POST', headers: { 'user-id': userId } },
      );
      if (!res.ok) throw new Error(`Chat API returned ${res.status}.`);
      setSelectedModel(m);
      setApiError('');
      // Backend resets session history on model change — mirror that here so
      // the visible conversation never diverges from what the model can see.
      setMessages([]);
      setEditingId(null);
      setInput('');
    } catch (e) {
      console.error(e);
      setApiStatus('unavailable');
      setApiError(
        'The chat service became unavailable. Check your connection and retry.',
      );
    }
  };

  // core SSE runner (operates on a known botMsgId)
  const runStream = useCallback(
    async (userInput: string, botMsgId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 150_000);
      try {
        const res = await fetch(
          `${API_BASE_URL}/llm/generate-agentic?input=${encodeURIComponent(userInput)}`,
          {
            method: 'POST',
            headers: { 'user-id': userId },
            signal: controller.signal,
          },
        );
        if (!res.ok || !res.body) throw new Error('Chat stream unavailable.');

        await readChatStream(res.body, (ev) => {
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
        });
      } catch (err: unknown) {
        if (timedOut || (err as Error).name !== 'AbortError') {
          setApiStatus('unavailable');
          setApiError(
            'The chat service is unavailable. Check your connection and retry.',
          );
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    text: timedOut
                ? 'The chat service stopped responding. Retry when it is back.'
                      : 'The chat service is unavailable. Retry when it is back.',
                    isStreaming: false,
                  }
                : msg,
            ),
          );
        }
      } finally {
        clearTimeout(timeout);
        // EOF, abort and network failure must all clear the message spinner.
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, isStreaming: false } : msg,
          ),
        );
        if (abortRef.current === controller) {
          setIsLoading(false);
          abortRef.current = null;
        }
      }
    },
    [userId],
  );

  // Number of user turns that precede a given message index — this maps
  // 1:1 to the backend's turn_starts bookkeeping, letting us tell the
  // server exactly which turn to roll its session history back to.
  const turnIndexAt = (msgIndex: number) =>
    messages.slice(0, msgIndex).filter((m) => m.type === 'user').length;

  // Tell the backend to drop its session history back to the start of a
  // given turn, so the model's actual context matches what the UI shows
  // after an edit or retry. Without this, edit/retry only look correct —
  // the model still sees the old (pre-edit) conversation underneath.
  const resetBackendContext = async (turnIndex: number): Promise<boolean> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/llm/truncate-history?turn_index=${turnIndex}`,
        { method: 'POST', headers: { 'user-id': userId } },
      );
      if (!res.ok) throw new Error(`Chat API returned ${res.status}.`);
      return true;
    } catch (e) {
      console.error('Failed to sync backend context:', e);
      setApiStatus('unavailable');
      setApiError(
        'The chat service became unavailable. Check your connection and retry.',
      );
      return false;
    }
  };

  // main send — accepts optional truncation index for retry/edit
  const handleSend = useCallback(
    async (userInput: string, truncateAt?: number) => {
      if (!userInput.trim() || isLoading || apiStatus !== 'available') return;
      setIsLoading(true);
      setEditingId(null);
      setEditingTurnIndex(null);
      removedOnEditRef.current = [];

      const userMsgId = `user_${Date.now()}`;
      const botMsgId = `bot_${Date.now() + 1}`;

      const userMsg: Message = {
        id: userMsgId,
        text: userInput,
        type: 'user',
        timestamp: new Date(),
        steps: [],
      };
      const botMsg: Message = {
        id: botMsgId,
        text: '',
        type: 'bot',
        isStreaming: true,
        timestamp: new Date(),
        steps: [],
      };

      setMessages((prev) => {
        const base =
          truncateAt !== undefined ? prev.slice(0, truncateAt) : prev;
        return [...base, userMsg, botMsg];
      });

      await runStream(userInput, botMsgId);
    },
    [apiStatus, isLoading, runStream],
  );

  // suggestion chip click → auto-fire
  const handleSuggestion = (label: string) => handleSend(label);

  // retry: re-run user message at msgIndex, drop everything from that point
  // (frontend AND backend session history)
  const handleRetry = async (msgIndex: number) => {
    if (apiStatus !== 'available') return;
    const msg = messages[msgIndex];
    if (!msg || msg.type !== 'user' || isLoading) return;
    if (!(await resetBackendContext(turnIndexAt(msgIndex)))) return;
    handleSend(msg.text, msgIndex);
  };

  // edit: restore text to input, drop that message + everything after from
  // the UI (kept in a ref in case the user cancels), defer the backend
  // truncation until the edit is actually resent.
  const handleEdit = (msgIndex: number) => {
    if (apiStatus !== 'available') return;
    const msg = messages[msgIndex];
    if (!msg || msg.type !== 'user' || isLoading) return;
    removedOnEditRef.current = messages.slice(msgIndex);
    setMessages((prev) => prev.slice(0, msgIndex));
    setInput(msg.text);
    setEditingId(msg.id);
    setEditingTurnIndex(turnIndexAt(msgIndex));
    setTimeout(() => textFieldRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    // Restore whatever was hidden when editing started.
    if (removedOnEditRef.current.length) {
      setMessages((prev) => [...prev, ...removedOnEditRef.current]);
      removedOnEditRef.current = [];
    }
    setEditingId(null);
    setEditingTurnIndex(null);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || apiStatus !== 'available') return;
    const text = input.trim();
    if (editingId && editingTurnIndex !== null) {
      // removedOnEditRef held the messages hidden since handleEdit — they
      // won't be restored now since we're committing the edit, not cancelling.
      if (!(await resetBackendContext(editingTurnIndex))) return;
      removedOnEditRef.current = [];
    }
    setInput('');
    handleSend(text);
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
    setEditingId(null);
    setInput('');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        padding: { xs: 1, sm: 2 },
        gap: 0,
        position: 'relative',
      }}
    >
      <Box className="chat-orb-backdrop" aria-hidden="true">
        {voiceOrb('min(88vmin, 900px)')}
      </Box>
      <Box className="chat-orb-sr-status" role="status" aria-live="polite">
        Assistant {orbLabel.toLowerCase()}
      </Box>
      {/* Compact controls */}
      <Box
        className="chatbot-controls"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          flexShrink: 0,
          gap: 1,
          mb: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 0,
              width: { xs: 190, sm: 300, md: 420 },
              maxWidth: 'calc(100vw - 76px)',
            }}
            disabled={apiStatus !== 'available' || modelsLoading || isLoading}
          >
            <InputLabel
              sx={{
                color: 'var(--foreground-muted)',
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.8rem',
              }}
            >
              Model
            </InputLabel>
            <Select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              label="Model"
              displayEmpty
              renderValue={(value) =>
                value ||
                (apiStatus === 'unavailable'
                  ? 'Unavailable'
                  : modelsLoading
                    ? 'Connecting…'
                    : 'Choose a model')
              }
              MenuProps={{ PaperProps: { sx: { maxWidth: 'calc(100vw - 24px)' } } }}
              sx={[projectSelectSx, { minWidth: 0, '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' } }]}
            >
              {models.map((m) => (
                <MenuItem
                  key={m}
                  value={m}
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.82rem',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Clear conversation">
            <span>
              <IconButton
                onClick={handleClear}
                disabled={messages.length === 0 && !isLoading}
                size="small"
                sx={{
                  color: 'var(--foreground-muted)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                    backgroundColor: 'var(--accent-muted)',
                  },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {apiStatus === 'unavailable' && (
        <Box className="chat-api-unavailable" role="alert">
          <Typography>{apiError}</Typography>
          <Button
            onClick={retryApiConnection}
            size="small"
            variant="outlined"
          >
            Retry
          </Button>
        </Box>
      )}

      {/* Messages */}
      <Box
        ref={scrollBoxRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          py: 1,
          pr: 1,
          minHeight: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Empty state + suggestions */}
        {messages.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              py: 2,
              textAlign: 'center',
            }}
          >
            <Typography className="chat-orb-status">
              {orbLabel}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.82rem',
                opacity: 0.45,
                color: 'var(--foreground)',
              }}
            >
              Ask me anything about my background, skills, or projects.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: 'center',
                maxWidth: 580,
              }}
            >
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={() => handleSuggestion(s)}
                  disabled={apiStatus !== 'available' || isLoading || modelsLoading}
                  sx={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: 'var(--background-2)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--card-border)',
                    transition: 'all .15s',
                    '&:hover': {
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                      backgroundColor: 'var(--accent-muted)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Bubbles */}
        {messages.map((msg, idx) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 1,
              animation: 'fadeInUp .25s ease both',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(6px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* Content column */}
            <Box
              sx={{
                maxWidth: { xs: '92%', sm: 'min(78%, 760px)' },
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {msg.type === 'bot' && msg.steps.length > 0 && (
                <AgentSteps steps={msg.steps} theme={resolvedTheme} />
              )}

              {(msg.text || msg.isStreaming) && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius:
                      msg.type === 'user'
                        ? '14px 4px 14px 14px'
                        : '4px 14px 14px 14px',
                    backgroundColor:
                      msg.type === 'user' ? 'var(--accent)' : 'var(--card)',
                    color: msg.type === 'user' ? '#fff' : 'var(--foreground)',
                    border:
                      msg.type === 'bot'
                        ? '1px solid var(--card-border)'
                        : 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.type === 'bot' && msg.text ? (
                    <Box className="md-content" sx={{ display: 'inline' }}>
                      {msg.isStreaming
                        ? animateStreamedWords(renderMarkdown(msg.text))
                        : renderMarkdown(msg.text)}
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

              {/* Timestamp + actions */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.5,
                  flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.63rem',
                    color: 'var(--foreground-muted)',
                    opacity: 0.5,
                  }}
                >
                  {formatTime(msg.timestamp)}
                </Typography>

                {/* User actions: Edit · Retry */}
                {msg.type === 'user' && !isLoading && apiStatus === 'available' && (
                  <Box sx={{ display: 'flex', gap: 0.25 }}>
                    <Tooltip title="Edit message" placement="top">
                      <IconButton
                        size="small"
                        className="msg-action-btn"
                        onClick={() => handleEdit(idx)}
                      >
                        <EditIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Retry from here" placement="top">
                      <IconButton
                        size="small"
                        className="msg-action-btn"
                        onClick={() => handleRetry(idx)}
                      >
                        <ReplayIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {/* Bot actions: Copy */}
                {msg.type === 'bot' && !msg.isStreaming && msg.text && (
                  <CopyButton text={msg.text} />
                )}
              </Box>
            </Box>
          </Box>
        ))}

        <div ref={messagesEndRef} />
      </Box>

      {/* Scroll-to-bottom FAB */}
      <Fade in={showScrollFab}>
        <Box
          onClick={() => {
            scrollToBottom();
            setShowScrollFab(false);
          }}
          sx={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            cursor: 'pointer',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '20px',
            px: 1.5,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            transition: 'all .15s',
            '&:hover': { borderColor: 'var(--accent)' },
          }}
        >
          <KeyboardArrowDownIcon
            sx={{ fontSize: 16, color: 'var(--foreground-muted)' }}
          />
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              color: 'var(--foreground-muted)',
            }}
          >
            scroll to bottom
          </Typography>
        </Box>
      </Fade>

      {/* Edit mode indicator */}
      {editingId && (
        <Box
          sx={{
            px: 1,
            pb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <EditIcon sx={{ fontSize: 12, color: 'var(--accent)' }} />
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              color: 'var(--accent)',
            }}
          >
            Editing — press Enter to resend, Esc to cancel
          </Typography>
          <Typography
            onClick={cancelEdit}
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              color: 'var(--foreground-muted)',
              cursor: 'pointer',
              ml: 'auto',
              '&:hover': { color: 'var(--accent)' },
            }}
          >
            cancel
          </Typography>
        </Box>
      )}

      {/* Input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 1,
          pt: 2,
          borderTop: `1px solid ${editingId ? 'var(--accent)' : 'var(--card-border)'}`,
          mt: 1,
          alignItems: 'flex-end',
          transition: 'border-color .2s',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ position: 'relative', flex: 1 }}>
          <TextField
            inputRef={textFieldRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
              if (e.key === 'Escape' && editingId) {
                cancelEdit();
              }
            }}
            variant="outlined"
            placeholder={
              apiStatus === 'unavailable'
                ? 'Chat unavailable — use Retry to reconnect'
                : apiStatus === 'checking'
                  ? 'Connecting to chat service…'
                  : editingId
                    ? 'Edit your message… (Enter to resend, Esc to cancel)'
                    : 'Ask something… (Enter to send)'
            }
            disabled={apiStatus !== 'available' || modelsLoading}
            inputProps={{ maxLength: INPUT_MAX_LEN }}
            multiline
            maxRows={4}
            autoComplete="off"
            autoFocus
            fullWidth
            sx={{
              ...projectInputSx,
              '& textarea': {
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.9rem',
                paddingBottom: input.length > 0 ? '22px' : undefined,
              },
              '& fieldset': editingId
                ? { borderColor: 'var(--accent) !important' }
                : {},
            }}
          />
          {/* Char counter — only visible when there's input */}
          {input.length > 0 && (
            <Typography
              sx={{
                position: 'absolute',
                bottom: '6px',
                right: '12px',
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.62rem',
                lineHeight: 1,
                color:
                  input.length > INPUT_MAX_LEN * 0.8
                    ? 'var(--accent)'
                    : 'var(--foreground-muted)',
                opacity: input.length > INPUT_MAX_LEN * 0.8 ? 1 : 0.45,
                pointerEvents: 'none',
                transition: 'color .2s, opacity .2s',
              }}
            >
              {input.length > INPUT_MAX_LEN * 0.8
                ? `${input.length} / ${INPUT_MAX_LEN}`
                : input.length}
            </Typography>
          )}
        </Box>

        {isLoading ? (
          <Button
            onClick={handleStop}
            variant="outlined"
            sx={{
              minWidth: 48,
              width: 48,
              height: 48,
              borderRadius: '12px',
              padding: 0,
              flexShrink: 0,
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
            disabled={
              apiStatus !== 'available' || modelsLoading || !input.trim()
            }
            sx={{
              minWidth: 48,
              width: 48,
              height: 48,
              borderRadius: '12px',
              padding: 0,
              flexShrink: 0,
              backgroundColor: 'var(--accent)',
              '&:hover': { backgroundColor: 'var(--accent-hover)' },
              '&:disabled': { backgroundColor: 'var(--background-2)' },
            }}
          >
            {editingId ? (
              <EditIcon fontSize="small" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </Button>
        )}
      </Box>
    </Container>
  );
}
