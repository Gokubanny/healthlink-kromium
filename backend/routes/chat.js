// ============================================
// FILE: backend/routes/chat.js (UPDATED WITH GROQ AI)
// ============================================
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');

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
// @access  Public (with rate limiting)
router.post('/', chatLimiter, async (req, res) => {
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
      model: 'llama-3.3-70b-versatile', // Fast and accurate model
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

module.exports = router;