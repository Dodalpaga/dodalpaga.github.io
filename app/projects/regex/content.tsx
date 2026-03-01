// app/projects/regex/content.tsx
'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useThemeContext } from '@/context/ThemeContext';
import { projectInputSx } from '@/constants/ui';

interface Segment {
  text: string;
  highlight: boolean;
}

const EXAMPLE_PATTERNS = [
  {
    label: 'Email',
    pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
  },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+' },
  { label: '5-letter words', pattern: '\\b\\w{5}\\b' },
  { label: 'Numbers', pattern: '\\d+' },
  { label: 'Capitalized', pattern: '\\b[A-Z][a-z]+' },
];

const SAMPLE_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Contact us at info@example.com or visit https://example.com. In 2024, over 500 developers attended the conference.';

export default function RegexHighlighter() {
  const { theme } = useThemeContext();
  const [paragraph, setParagraph] = React.useState(SAMPLE_TEXT);
  const [regexInput, setRegexInput] = React.useState('\\b\\w{5}\\b');
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [matchCount, setMatchCount] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const highlightText = (text: string, regex: RegExp): Segment[] => {
    const segs: Segment[] = [];
    let lastIndex = 0,
      match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex)
        segs.push({
          text: text.slice(lastIndex, match.index),
          highlight: false,
        });
      segs.push({ text: match[0], highlight: true });
      lastIndex = match.index + match[0].length;
      if (match.index === regex.lastIndex) regex.lastIndex++;
    }
    if (lastIndex < text.length)
      segs.push({ text: text.slice(lastIndex), highlight: false });
    return segs;
  };

  React.useEffect(() => {
    try {
      const regex = new RegExp(regexInput, 'g');
      const segs = highlightText(paragraph, regex);
      setSegments(segs);
      setMatchCount(segs.filter((s) => s.highlight).length);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setSegments([{ text: paragraph, highlight: false }]);
      setMatchCount(0);
    }
  }, [paragraph, regexInput]);

  const hlColor =
    theme === 'dark' ? 'rgba(107, 142, 255, 0.35)' : 'rgba(48, 90, 214, 0.18)';
  const hlBorder =
    theme === 'dark' ? 'rgba(107, 142, 255, 0.6)' : 'rgba(48, 90, 214, 0.5)';

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        py: 3,
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <span className="section-label">Dev Tool · Utility</span>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          Regex Matcher
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Write a pattern and see matches highlighted in real time
        </Typography>
      </Box>

      {/* Pattern input */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.72rem',
              color: 'var(--foreground-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Pattern
          </Typography>
          {!error && matchCount > 0 && (
            <Box
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.68rem',
                px: 1,
                py: 0.2,
                borderRadius: '100px',
                backgroundColor: 'var(--accent-muted)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              {matchCount} match{matchCount !== 1 ? 'es' : ''}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '1.1rem',
              color: 'var(--foreground-muted)',
              px: 1,
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            /
          </Box>
          <TextField
            fullWidth
            value={regexInput}
            onChange={(e) => setRegexInput(e.target.value)}
            error={!!error}
            helperText={error ? `Invalid regex: ${error}` : undefined}
            autoFocus
            autoComplete="off"
            sx={projectInputSx}
            inputProps={{
              style: {
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
              },
            }}
          />
          <Box
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '1.1rem',
              color: 'var(--foreground-muted)',
              px: 1,
              flexShrink: 0,
            }}
          >
            /g
          </Box>
        </Box>
      </Box>

      {/* Quick patterns */}
      <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
        {EXAMPLE_PATTERNS.map((p) => (
          <Chip
            key={p.label}
            label={p.label}
            size="small"
            onClick={() => setRegexInput(p.pattern)}
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              backgroundColor:
                regexInput === p.pattern
                  ? 'var(--accent-muted)'
                  : 'var(--background-elevated)',
              border: `1px solid ${regexInput === p.pattern ? 'var(--accent)' : 'var(--card-border)'}`,
              color:
                regexInput === p.pattern
                  ? 'var(--accent)'
                  : 'var(--foreground-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          />
        ))}
      </Box>

      {/* Text editor */}
      <Box sx={{ mb: 1 }}>
        <Typography
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem',
            color: 'var(--foreground-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            mb: 1,
          }}
        >
          Input text (editable)
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 200,
          backgroundColor: 'var(--card)',
          border: `1px solid ${error ? 'rgba(255,100,100,0.4)' : 'var(--card-border)'}`,
          borderRadius: '14px',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
      >
        {/* Hidden textarea for editing */}
        <textarea
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            padding: '16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.95rem',
            lineHeight: '1.7',
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: 'var(--foreground)',
            zIndex: 2,
          }}
        />
        {/* Rendered highlight overlay */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            p: 2,
            overflow: 'auto',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.95rem',
            lineHeight: '1.7',
            color: 'var(--foreground)',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            zIndex: 1,
          }}
        >
          {segments.map((seg, i) =>
            seg.highlight ? (
              <mark
                key={i}
                style={{
                  backgroundColor: hlColor,
                  borderBottom: `2px solid ${hlBorder}`,
                  color: 'inherit',
                  borderRadius: '3px',
                  padding: '0 1px',
                }}
              >
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </Box>
      </Box>
    </Container>
  );
}
