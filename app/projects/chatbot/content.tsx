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
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [userId] = useState(getUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  // fetch models
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/llm/models`,
        );
        const data = await res.json();
        setModels(data.models || []);
        setSelectedModel(data.default || '');
      } finally {
        setModelsLoading(false);
      }
    })();
  }, []);

  const handleModelChange = async (m: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/llm/set-model?model_name=${encodeURIComponent(m)}`,
        { method: 'POST', headers: { 'user-id': userId } },
      );
      setSelectedModel(m);
    } catch (e) {
      console.error(e);
    }
  };

  // core SSE runner (operates on a known botMsgId)
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
      }
    },
    [userId],
  );

  // main send — accepts optional truncation index for retry/edit
  const handleSend = useCallback(
    async (userInput: string, truncateAt?: number) => {
      if (!userInput.trim() || isLoading) return;
      setIsLoading(true);
      setEditingId(null);

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
    [isLoading, runStream],
  );

  // suggestion chip click → auto-fire
  const handleSuggestion = (label: string) => handleSend(label);

  // retry: re-run user message at msgIndex, drop everything from that point
  const handleRetry = (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg || msg.type !== 'user' || isLoading) return;
    handleSend(msg.text, msgIndex);
  };

  // edit: restore text to input, drop that message + everything after
  const handleEdit = (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg || msg.type !== 'user' || isLoading) return;
    setMessages((prev) => prev.slice(0, msgIndex));
    setInput(msg.text);
    setEditingId(msg.id);
    setTimeout(() => textFieldRef.current?.focus(), 50);
  };

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
        padding: { xs: 2, sm: 3 },
        gap: 0,
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          pb: 2,
          borderBottom: '1px solid var(--card-border)',
        }}
      >
        <Box>
          <span className="section-label">AI · Agentic LLM</span>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: 'var(--foreground)',
            }}
          >
            Chat with me
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--foreground-muted)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Agentic AI · tools · thinking · streaming
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {messages.length > 0 && (
            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.72rem',
                color: 'var(--foreground-muted)',
                opacity: 0.55,
              }}
            >
              {messages.filter((m) => m.type === 'user').length} messages
            </Typography>
          )}
          <FormControl
            size="small"
            sx={{ minWidth: 220 }}
            disabled={modelsLoading || isLoading}
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
              sx={projectSelectSx}
            >
              {models.map((m) => (
                <MenuItem
                  key={m}
                  value={m}
                  sx={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.82rem',
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

      {/* Messages */}
      <Box
        ref={scrollBoxRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          py: 1,
          pr: 1,
          minHeight: 0,
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
              gap: 3,
              py: 6,
              textAlign: 'center',
            }}
          >
            <SmartToyIcon
              sx={{ fontSize: 48, opacity: 0.22, color: 'var(--foreground)' }}
            />
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
                  disabled={isLoading || modelsLoading}
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
            {/* Avatar */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.3,
                backgroundColor:
                  msg.type === 'user'
                    ? 'var(--accent-muted)'
                    : 'var(--background-2)',
                border: '1px solid var(--card-border)',
              }}
            >
              {msg.type === 'user' ? (
                <PersonIcon sx={{ fontSize: 15, color: 'var(--accent)' }} />
              ) : (
                <SmartToyIcon
                  sx={{ fontSize: 15, color: 'var(--foreground-muted)' }}
                />
              )}
            </Box>

            {/* Content column */}
            <Box
              sx={{
                maxWidth: '78%',
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
                    <Box className="md-content">{renderMarkdown(msg.text)}</Box>
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
                {msg.type === 'user' && !isLoading && (
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
            onClick={() => {
              setEditingId(null);
              setInput('');
            }}
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
                setEditingId(null);
                setInput('');
              }
            }}
            variant="outlined"
            placeholder={
              editingId
                ? 'Edit your message… (Enter to resend, Esc to cancel)'
                : 'Ask something… (Enter to send)'
            }
            disabled={modelsLoading}
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
                  input.length > 800
                    ? 'var(--accent)'
                    : 'var(--foreground-muted)',
                opacity: input.length > 800 ? 1 : 0.45,
                pointerEvents: 'none',
                transition: 'color .2s, opacity .2s',
              }}
            >
              {input.length > 800 ? `${input.length} / 1000` : input.length}
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
            disabled={modelsLoading || !input.trim()}
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
