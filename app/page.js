"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

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
  const [feedback, setFeedback] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);

  useEffect(() => {
    const storedFeedback = localStorage.getItem("feedbackList");
    if (storedFeedback) {
      setFeedbackList(JSON.parse(storedFeedback));
    }
  }, []);

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
    scrollToBottom();

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
            const updatedMessages = [
              ...otherMessages,
              { ...lastMessage, content: accumulatedText },
            ];
            return updatedMessages;
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
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages((messages) => [
      {
        role: "assistant",
        content:
          "Hi! I'm the Headstarter support assistant. How can I help you today?",
      },
    ]);
    setMessage("");
    setIsLoading(false);
  };

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

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      const newFeedbackList = [...feedbackList, feedback];
      setFeedbackList(newFeedbackList);
      localStorage.setItem("feedbackList", JSON.stringify(newFeedbackList));
      setFeedback("");
    }
  };

  const handleClearFeedback = () => {
    setFeedbackList([]);
    localStorage.removeItem("feedbackList");
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="relative"
      sx={{
        "@media (max-width: 600px)": {
          height: "100vh",
          p: 1,
        },
        background: "linear-gradient(135deg, #2e2e2e, #7d7d7d, #2e2e2e)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 2,
          color: "#ffffff",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Headstarter Support Assistant
      </Typography>
      <Stack
        direction="column"
        width="100%"
        maxWidth="600px"
        border="1px solid #ddd"
        borderRadius={2}
        p={2}
        spacing={2}
        sx={{
          boxShadow: 2,
          backgroundColor: "#fff",
          borderColor: "#ccc",
          overflow: "hidden",
          mt: 2,
          mb: 2,
          "@media (max-width: 600px)": {
            width: "85%",
            height: "500px",
            p: 2,
            mt: 1,
            mb: 1,
          },
          "@media (min-width: 601px)": {
            width: "50%",
            height: "700px",
            p: 2,
            mt: 2,
            mb: 2,
          },
        }}
      >
        <Stack
          direction="column"
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
                bgcolor={message.role === "assistant" ? "#F2F2F7" : "#007AFF"}
                color={message.role === "assistant" ? "#000000" : "#FFFFFF"}
                borderRadius={5}
                p="10px 15px"
                sx={{
                  maxWidth: "80%",
                  overflowWrap: "break-word",
                  boxShadow: 1,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "& .markdown-body": {
                    margin: 0,
                    padding: 0,
                    "& ul, & ol": {
                      marginLeft: "1.5em",
                      paddingLeft: "0.5em",
                    },
                    "& li": {
                      marginBottom: "0.5em",
                    },
                    "& p": {
                      marginBottom: "0.5em",
                    },
                    "& blockquote": {
                      borderLeft: "2px solid #e0e0e0",
                      paddingLeft: "1em",
                      margin: "0 0 1em 0",
                    },
                    "& code": {
                      backgroundColor: "#f4f4f4",
                      padding: "0.2em 0.4em",
                      borderRadius: "4px",
                    },
                  },
                }}
              >
                <ReactMarkdown className="markdown-body">
                  {message.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Message"
            color="secondary"
            focused
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            minRows={1}
            maxRows={1}
            sx={{ flexGrow: 1 }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              fontSize: "1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "50%",
              width: "56px",
              height: "56px",
              "&:hover": {
                backgroundColor: "#0056b3",
              },
              "@media (max-width: 600px)": {
                fontSize: "1.25rem",
                width: "48px",
                height: "48px",
              },
              mt: 1,
            }}
          >
            <SendIcon />
          </IconButton>
          <IconButton
            onClick={clearChat}
            disabled={isLoading}
            sx={{
              fontSize: "1.5rem",
              backgroundColor: "#dc3545",
              color: "white",
              borderRadius: "50%",
              width: "56px",
              height: "56px",
              "&:hover": {
                backgroundColor: "#c82333",
              },
              "@media (max-width: 600px)": {
                fontSize: "1.25rem",
                width: "48px",
                height: "48px",
              },
              mt: 1,
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>

      {}
      <Button
        variant="contained"
        color="success"
        onClick={() => setOpenFeedbackModal(true)}
        sx={{
          position: "fixed",
          bottom: 30,
          right: 10,
          zIndex: 1000,
          "@media (max-width: 600px)": {
            bottom: 70,
            right: 35,
            fontSize: "0.75rem",
          },
        }}
      >
        Feedback
      </Button>

      {}
      <Modal
        open={openFeedbackModal}
        onClose={() => setOpenFeedbackModal(false)}
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-description"
      >
        <Box
          sx={{
            width: "90%",
            maxWidth: "500px",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            overflow: "auto",
          }}
        >
          <Typography id="feedback-modal-title" variant="h6" component="h2">
            Leave Feedback
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback here..."
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFeedbackSubmit}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearFeedback}
            >
              Clear All
            </Button>
          </Box>
          {feedbackList.length > 0 && (
            <Box
              sx={{
                mt: 3,
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 1,
                bgcolor: "#f9f9f9",
              }}
            >
              {feedbackList.map((feedbackItem, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: "#fff",
                    boxShadow: 1,
                  }}
                >
                  <ReactMarkdown>{feedbackItem}</ReactMarkdown>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
