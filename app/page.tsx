'use client'

import { Box, Button, colors, Stack, TextField } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Moira. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      // @ts-ignore: Object is possibly 'null'.
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }
  
  // @ts-ignore: Parameter 'event' has implicitly 'any' type.
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" , block: 'start'})
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box 
      width = "97.5vw"
      //max-height="100vh"
      height= 'calc(100vh - 32px)'
      padding={2}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="left"
      bgcolor={"black"}
      sx={{overflow: 'auto'}}
    >
      <Stack
        direction={'column'}
        width="800px"
        height="535px"
        //border="1px solid black"
        bg-color="white"
        p={2}
        spacing={3}
      >
        {/* @ts-ignore: No overload matches this call*/}
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          maxwidth="100%"
          sx = {{position: 'relative','&::-webkit-scrollbar': {
            width: '0px', // Hide scrollbar in WebKit browsers (Chrome, Safari)
          }}}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
                maxWidth="80%"
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            //disabled={isLoading}
            focused
            sx={{
        '& .MuiOutlinedInput-root': {
          color: 'white', // Text color
        },
        
        '& .MuiInputLabel-root': {
          color: 'white', // Label color
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'white', // Label color when focused
        },
      }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )

}

