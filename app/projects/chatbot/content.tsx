import * as React from 'react';
import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import './styles.css'; // Import the styles

type Message = {
  text: string;
  type: 'user' | 'bot';
  isStreaming?: boolean;
};

// Generate or retrieve user ID
const getUserId = (): string => {
  const key = 'llm_chat_user_id';
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, userId);
  }
  return userId;
};

export default function Content() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);
  const [userId] = useState<string>(getUserId());

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/llm/models`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setModels(data.models || []);
        setSelectedModel(data.default || '');
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
        setSelectedModel('');
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Handle model change
  const handleModelChange = async (newModel: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/llm/set-model?model_name=${encodeURIComponent(newModel)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setSelectedModel(newModel);
    } catch (error) {
      console.error('Error setting model:', error);
    }
  };

  const handleStream = async (input: string) => {
    setIsLoading(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, type: 'user' },
    ]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/llm/generate?input=${encodeURIComponent(input)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.response || '';

      if (typeof generatedText !== 'string') {
        throw new Error('Invalid response format');
      }

      let index = 0;
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
      }, 30);
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

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <Container maxWidth={false} className="chat-container">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Chat with the AI version of me
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel
            id="model-select-label"
            sx={{ color: 'var(--foreground-2)' }}
          >
            Select Model
          </InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={modelsLoading || isLoading}
            label="Select Model"
            sx={{
              color: 'var(--foreground-2)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--foreground-2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--foreground-2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--foreground-2)',
              },
              '& .MuiSvgIcon-root': {
                color: 'var(--foreground-2)',
              },
            }}
          >
            {models.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {modelsLoading && (
          <Typography variant="body2" sx={{ color: 'var(--foreground-2)' }}>
            Loading models...
          </Typography>
        )}
      </Box>

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
              {msg.isStreaming && <span className="blinking-cursor">|</span>}
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
          disabled={isLoading || modelsLoading}
          autoComplete="off"
          className="input-field"
          sx={{
            width: '70%',
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
          disabled={isLoading || modelsLoading || input.trim() === ''}
        >
          Send
        </Button>

        <Button
          onClick={clearConversation}
          variant="outlined"
          sx={{
            width: '15%',
            marginLeft: '10px',
            color: 'var(--foreground-2)',
            borderColor: 'var(--foreground-2)',
          }}
        >
          Clear
        </Button>
      </form>
    </Container>
  );
}
