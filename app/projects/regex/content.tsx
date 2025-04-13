import * as React from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

interface HighlightSegment {
  text: string;
  highlight: boolean;
}

export default function RegexHighlighter() {
  const theme = useTheme();
  const [paragraph, setParagraph] = React.useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.'
  );
  const [regexInput, setRegexInput] = React.useState('\\b\\w{5}\\b');
  const [segments, setSegments] = React.useState<HighlightSegment[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const contentEditableRef = React.useRef<HTMLDivElement>(null);

  // Highlight color based on theme mode
  const highlightColor = theme.palette.mode === 'light' ? red[500] : red[900];

  // Function to split text into segments based on regex
  const highlightText = (text: string, regex: RegExp): HighlightSegment[] => {
    const segs: HighlightSegment[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segs.push({
          text: text.slice(lastIndex, match.index),
          highlight: false,
        });
      }
      segs.push({
        text: match[0],
        highlight: true,
      });
      lastIndex = match.index + match[0].length;

      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }

    if (lastIndex < text.length) {
      segs.push({
        text: text.slice(lastIndex),
        highlight: false,
      });
    }
    return segs;
  };

  // Update segments when paragraph or regex changes
  React.useEffect(() => {
    try {
      const regex = new RegExp(regexInput, 'g');
      regex.lastIndex = 0;
      const newSegments = highlightText(paragraph, regex);
      setSegments(newSegments);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setSegments([{ text: paragraph, highlight: false }]);
    }
  }, [paragraph, regexInput]);

  // Handle input in contentEditable div
  const handleInput = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const div = e.currentTarget;
    const text = div.textContent || '';
    setParagraph(text);

    // Restore cursor position after update
    restoreCaretPosition(div);
  };

  // Save and restore caret position to prevent jumping
  const saveCaretPosition = (element: HTMLElement) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
      };
    }
    return null;
  };

  const restoreCaretPosition = (element: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection) return;

    // Focus the element
    element.focus();

    // Create a new range
    const range = document.createRange();
    let textNode: Node | null = null;
    let offset = 0;

    // Find the first text node in the contentEditable div
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    while (walker.nextNode()) {
      textNode = walker.currentNode;
      break;
    }

    if (textNode) {
      range.setStart(
        textNode,
        Math.min(offset, textNode.textContent?.length || 0)
      );
      range.setEnd(
        textNode,
        Math.min(offset, textNode.textContent?.length || 0)
      );
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Handle paste to prevent formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Initialize contentEditable with focus or content
  React.useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, []);

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Regex Highlighter
      </Typography>

      <Box sx={{ width: '100%', mb: 2 }}>
        <TextField
          fullWidth
          label="Regular Expression"
          variant="outlined"
          value={regexInput}
          autoComplete="off"
          onChange={(e) => setRegexInput(e.target.value)}
          helperText={
            error ? `Invalid regex: ${error}` : 'Enter your regex pattern'
          }
          sx={{
            color: 'var(--foreground-2)',
            '& .MuiOutlinedInput-root': {
              color: 'var(--foreground-2)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--foreground-2)',
            },
            '& .MuiFormHelperText-root': {
              color: 'var(--foreground-2)',
            },
            '& .MuiFormLabel-root': {
              color: 'var(--foreground-2)',
            },
          }}
          autoFocus
          error={Boolean(error)}
        />
      </Box>

      <Box sx={{ width: '100%', mb: 2 }}>
        <div
          ref={contentEditableRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          suppressContentEditableWarning
          style={{
            width: '100%',
            height: '200px',
            padding: '8px',
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            lineHeight: theme.typography.body1.lineHeight,
            border: `1px solid var(--foreground-2)`,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            outline: 'none',
          }}
        >
          {segments.map((seg, index) => (
            <span
              key={index}
              style={{
                backgroundColor: seg.highlight ? highlightColor : 'transparent',
              }}
            >
              {seg.text}
            </span>
          ))}
        </div>
      </Box>
    </Container>
  );
}
