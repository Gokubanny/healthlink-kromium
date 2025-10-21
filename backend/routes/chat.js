// ============================================
// FILE: backend/routes/chat.js (UPDATED WITH BETTER RATE LIMITS)
// ============================================
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');

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
  skipFailedRequests: true, // Don't count failed requests
  
  // Add a custom handler for better error messages
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      reply: "I'm receiving too many requests right now. Please wait 10 seconds and try again.",
    });
  },
});

// Initialize OpenAI with v4+ syntax
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
      console.error('OpenAI API key not configured');
      return res.status(500).json({
        success: false,
        reply: "I'm currently unavailable. Please try again later.",
      });
    }

    // Call OpenAI API with v4+ syntax
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
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

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        reply: "I'm experiencing high traffic. Please try again in a moment.",
      });
    }

    if (error.status === 401 || error.status === 403) {
      console.error('OpenAI API authentication failed');
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
  const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder';
  res.json({
    success: true,
    status: hasApiKey ? 'operational' : 'degraded',
    service: 'Kromium Assistant',
    apiKeyConfigured: hasApiKey,
  });
});

module.exports = router;