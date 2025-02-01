import * as React from 'react';
import { useState } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import './styles.css'; // Import the styles

type Message = {
  text: string;
  type: 'user' | 'bot';
  isStreaming?: boolean; // Track streaming effect
};

export default function Content() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStream = async (input: string) => {
    setIsLoading(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, type: 'user' },
    ]);

    try {
      console.log('input', encodeURIComponent(input));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_LLM}` +
          `?input=${encodeURIComponent(input)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      console.log('data', data);

      // Start streaming effect
      let index = 0;
      const generatedText = data.response;
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: '', type: 'bot', isStreaming: true },
      ]);

      const interval = setInterval(() => {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];

          if (index < generatedText.length) {
            lastMessage.text += generatedText[index];
            index++;
          } else {
            lastMessage.isStreaming = false;
            clearInterval(interval);
          }

          return [...newMessages];
        });
      }, 30); // Typing speed (adjust if needed)
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Sorry, there was an error processing your request.',
          type: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    handleStream(input);
    setInput('');
  };

  return (
    <Container maxWidth={false} className="chat-container">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Chat with the AI version of me
      </Typography>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message-row ${msg.type}-row`}>
            {msg.type === 'user' && <PersonIcon className="user-icon" />}
            {msg.type === 'bot' && <SmartToyIcon className="bot-icon" />}
            <Typography
              variant="body1"
              className={`message ${msg.type}-message`}
            >
              {msg.text}
              {msg.isStreaming && (
                <span className="blinking-cursor">|</span>
              )}{' '}
              {/* Blinking cursor */}
            </Typography>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          variant="outlined"
          placeholder="Ask me something ..."
          disabled={isLoading}
          autoComplete="off"
          className="input-field"
          sx={{
            width: '85%',
            color: 'var(--foreground-2)',
            '& .MuiOutlinedInput-root': {
              color: 'var(--foreground-2)',
            },
            paddingRight: '10px',
          }}
          autoFocus
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            width: '15%',
            color: 'var(--foreground-2)',
          }}
          disabled={isLoading || input.trim() === ''}
        >
          Send
        </Button>
      </form>
    </Container>
  );
}
