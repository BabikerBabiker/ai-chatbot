"use client";
import { Box, Button, Stack, TextField, Divider } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Network response was not ok: ${errorMessage}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      const typingSpeed = 15;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const char of text) {
          accumulatedText += char;

          setMessages((messages) => {
            const lastMessage = messages[messages.length - 1];
            const otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: accumulatedText },
            ];
          });

          await new Promise((resolve) => setTimeout(resolve, typingSpeed));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const clearChat = () => {
    setMessages([]); 
    setMessage("");  
    setIsLoading(false); 
    }

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="flex-end"
    > 
      <Stack
      height="100vh"
      width="40vw"
      backgroundColor="white">
        <Stack
        height = "70vh"
        >Feedback</Stack>
        <Stack
        height = "30vh"
        >Languages</Stack>
      </Stack>
      <Divider
        orientation="vertical" 
        sx={{
          borderRightWidth: '2px',
          borderColor: 'gray',
          borderStyle: 'dashed',
        }}
      />
      <Stack
        direction={"column"}
        width="1000px"
        height="700px"
        border="3px solid black"
        borderRadius={5}
        p={2}
        spacing={3}
        marginRight={5}
        marginLeft={5}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "#5B99C2"
                    : "#F9DBBA"
                }
                color="black"
                borderRadius={5}
                p={3}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Message"
            color="secondary"
            focused
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            minRows={2}
            maxRows={4}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={clearChat}
            disabled={isLoading}
            endIcon={<DeleteIcon />}
          >
            Clear
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
