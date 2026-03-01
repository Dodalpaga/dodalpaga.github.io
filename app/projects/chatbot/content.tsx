// app/projects/chatbot/content.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
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
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import { projectInputSx, projectSelectSx } from '@/constants/ui';

type Message = {
  text: string;
  type: 'user' | 'bot';
  isStreaming?: boolean;
  timestamp?: Date;
};

const getUserId = (): string => {
  const key = 'llm_chat_user_id';
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, userId);
  }
  return userId;
};

const formatTime = (date?: Date) =>
  date
    ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

export default function Content() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);
  const [userId] = useState(getUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/llm/models`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setModels(data.models || []);
        setSelectedModel(data.default || '');
      } catch {
        setModels([]);
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleModelChange = async (newModel: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/llm/set-model?model_name=${encodeURIComponent(newModel)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'user-id': userId },
        },
      );
      setSelectedModel(newModel);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStream = async (userInput: string) => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { text: userInput, type: 'user', timestamp: new Date() },
    ]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/llm/generate?input=${encodeURIComponent(userInput)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'user-id': userId },
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const text: string = data.response || '';

      let idx = 0;
      setMessages((prev) => [
        ...prev,
        { text: '', type: 'bot', isStreaming: true, timestamp: new Date() },
      ]);

      const interval = setInterval(() => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (idx < text.length) {
            last.text += text[idx++];
          } else {
            last.isStreaming = false;
            clearInterval(interval);
          }
          return next;
        });
      }, 18);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, something went wrong. Please try again.',
          type: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleStream(input.trim());
    setInput('');
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: { xs: 2, sm: 3 },
        gap: 0,
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
          <span className="section-label">AI · LLM</span>
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
            Fine-tuned on my resume, projects &amp; background.
          </Typography>
        </Box>

        {/* Model selector */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
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
            <IconButton
              onClick={() => setMessages([])}
              disabled={messages.length === 0}
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
          </Tooltip>
        </Box>
      </Box>

      {/* Messages */}
      <Box
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
        {messages.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: 'var(--foreground-muted)',
              textAlign: 'center',
              py: 8,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.85rem',
                opacity: 0.6,
              }}
            >
              Ask me anything about my background, skills or projects.
            </Typography>
          </Box>
        )}

        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 1,
              animation: 'fadeInUp 0.3s ease both',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(8px)' },
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
                backgroundColor:
                  msg.type === 'user'
                    ? 'var(--accent-muted)'
                    : 'var(--background-2)',
                border: '1px solid var(--card-border)',
              }}
            >
              {msg.type === 'user' ? (
                <PersonIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              ) : (
                <SmartToyIcon
                  sx={{ fontSize: 16, color: 'var(--foreground-muted)' }}
                />
              )}
            </Box>

            {/* Bubble */}
            <Box
              sx={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
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
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {msg.text}
                {msg.isStreaming && (
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
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0 },
                      },
                    }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.65rem',
                  color: 'var(--foreground-muted)',
                  px: 0.5,
                  textAlign: msg.type === 'user' ? 'right' : 'left',
                }}
              >
                {formatTime(msg.timestamp)}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 1,
          pt: 2,
          borderTop: '1px solid var(--card-border)',
          mt: 1,
        }}
      >
        <TextField
          inputRef={textFieldRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          variant="outlined"
          placeholder="Ask something… (Enter to send)"
          disabled={isLoading || modelsLoading}
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
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || modelsLoading || !input.trim()}
          sx={{
            minWidth: 48,
            width: 48,
            height: 48,
            borderRadius: '12px',
            padding: 0,
            flexShrink: 0,
            alignSelf: 'flex-end',
            backgroundColor: 'var(--accent)',
            '&:hover': { backgroundColor: 'var(--accent-hover)' },
            '&:disabled': { backgroundColor: 'var(--background-2)' },
          }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </Box>
    </Container>
  );
}
