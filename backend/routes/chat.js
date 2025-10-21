// ============================================
// FILE: backend/routes/chat.js (UPDATED - PROPER AUTH HANDLING)
// ============================================
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');
const ChatHistory = require('../models/ChatHistory');
const { protect } = require('../middleware/auth');

// VERY GENEROUS Rate limiting for development/testing
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // 100 requests per minute (very generous for testing)
  message: {
    success: false,
    reply: 'Too many chat requests. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      reply: "I'm receiving too many requests right now. Please wait 10 seconds and try again.",
    });
  },
});

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_placeholder',
});

// System prompt for healthcare-focused AI
const SYSTEM_PROMPT = `You are Kromium Assistant, a friendly healthcare AI that helps users with digital medical services, teleconsultation, and health-related questions. 

Your responsibilities:
- Answer health and medical questions clearly and empathetically
- Provide information about teleconsultation services
- Guide users on booking appointments
- Explain Kromium Health platform features
- Offer general wellness advice

Important guidelines:
- ONLY respond to healthcare, medical, or Kromium Health service questions
- If asked about non-health topics, politely decline: "I'm sorry, I can only assist with healthcare-related inquiries or Kromium Health services."
- Always be empathetic, clear, and accurate
- Recommend consulting a doctor for serious medical concerns
- Never provide specific medical diagnoses or prescriptions
- Keep responses concise and user-friendly
- Use a warm, professional tone`;

// @route   POST /api/chat
// @desc    Handle chatbot messages
// @access  Protected (requires authentication)
router.post('/', protect, chatLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message',
      });
    }

    // Check message length
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message too long. Please keep it under 500 characters.',
      });
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_placeholder') {
      console.error('Groq API key not configured');
      return res.status(500).json({
        success: false,
        reply: "I'm currently unavailable. Please try again later.",
      });
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('No response from AI');
    }

    // Store chat history in database (only for authenticated users)
    try {
      let chatHistory = await ChatHistory.findOne({ user: userId });

      const userMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
      };

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'bot',
        timestamp: new Date(),
      };

      if (!chatHistory) {
        // Create new chat history
        chatHistory = await ChatHistory.create({
          user: userId,
          messages: [userMessage, botMessage],
        });
      } else {
        // Append to existing history
        chatHistory.messages.push(userMessage, botMessage);
        await chatHistory.save();
      }

      console.log(`✅ Chat history saved for user ${userId}`);
    } catch (historyError) {
      console.error('Error saving chat history:', historyError);
      // Don't fail the request if history save fails
    }

    res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error('Chat API Error:', error.message);

    // Handle specific Groq errors
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        reply: "I'm experiencing high traffic. Please try again in a moment.",
      });
    }

    if (error.status === 401 || error.status === 403) {
      console.error('Groq API authentication failed');
      return res.status(500).json({
        success: false,
        reply: "I'm currently unavailable. Please try again later.",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      reply: "I'm having trouble processing your request. Please try again.",
    });
  }
});

// @route   GET /api/chat/history
// @desc    Get user's chat history
// @access  Protected
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const chatHistory = await ChatHistory.findOne({ user: userId });

    if (!chatHistory) {
      return res.json({
        success: true,
        messages: [],
      });
    }

    res.json({
      success: true,
      messages: chatHistory.messages,
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
    });
  }
});

// @route   DELETE /api/chat/history
// @desc    Clear user's chat history
// @access  Protected
router.delete('/history', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    await ChatHistory.findOneAndDelete({ user: userId });

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
    });
  }
});

// @route   GET /api/chat/health
// @desc    Check chatbot service health
// @access  Public
router.get('/health', (req, res) => {
  const hasApiKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_placeholder';
  res.json({
    success: true,
    status: hasApiKey ? 'operational' : 'degraded',
    service: 'Kromium Assistant (Groq AI)',
    apiKeyConfigured: hasApiKey,
  });
});

// @route   POST /api/chat/guest
// @desc    Handle guest chatbot messages (no auth required)
// @access  Public
router.post('/guest', chatLimiter, async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message',
      });
    }

    // Check message length
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message too long. Please keep it under 500 characters.',
      });
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_placeholder') {
      console.error('Groq API key not configured');
      return res.status(500).json({
        success: false,
        reply: "I'm currently unavailable. Please try again later.",
      });
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('No response from AI');
    }

    // Guest messages are NOT saved to database

    res.json({
      success: true,
      reply,
      guest: true, // Indicate this is a guest session
    });

  } catch (error) {
    console.error('Guest Chat API Error:', error.message);
    // ... error handling (same as above)
    res.status(500).json({
      success: false,
      reply: "I'm having trouble processing your request. Please try again.",
    });
  }
});

module.exports = router;