import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * RAH Tourist Guide API Endpoint
 * Handles AI-powered Indian tourism guidance using Google Gemini
 * 
 * POST /api/chatbot/rah-guide
 * Body: { message: string, conversationHistory: Array }
 * Response: { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('[RAH Chatbot] Gemini API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please set GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // System prompt for RAH Tourist Guide
    const systemPrompt = `You are RAH (Reliable Assistance & Hospitality), an expert Indian tourism guide AI assistant. You provide comprehensive, accurate, and helpful information about:

🇮🇳 SPECIALIZATION:
- Indian destinations, monuments, and cultural sites (Taj Mahal, Jaipur, Goa, Kerala, Himalayas, etc.)
- Historical and cultural significance of Indian places
- Best times to visit different regions
- Local transportation options and travel tips
- Indian cuisine, customs, and traditions
- Safety recommendations for tourists
- Budget travel planning and accommodation advice
- Local experiences and hidden gems
- Travel documents and visa information
- Weather and seasonal information

✨ PERSONALITY:
- Warm, welcoming, and enthusiastic about Indian culture
- Use appropriate greetings like "नमस्ते" (Namaste)
- Provide detailed, accurate information
- Include practical tips and local recommendations
- Be respectful of Indian traditions and customs
- Use emojis appropriately to make responses engaging

🎯 COMMUNICATION STYLE:
- Answer in the language the user uses (English, Hindi, etc.)
- Provide structured information with bullet points when helpful
- Include estimated costs, times, and distances when relevant
- Suggest alternative options and hidden gems
- Prioritize tourist safety and comfort
- Respect cultural sensitivities

⚠️ IMPORTANT:
- Always prioritize tourist safety
- Recommend official channels for visas and documents
- Suggest current travel advisories when relevant
- Be honest about limitations and recommend expert consultation for complex issues`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
    });

    // Build conversation history for context
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start a chat session with history
    const chat = model.startChat({
      history: history,
    });

    // Prepend system prompt to user message for context
    const fullMessage = `${systemPrompt}\n\nUser Query: ${message}`;

    // Send the user message
    const result = await chat.sendMessage(fullMessage);
    const response = result.response;
    const assistantMessage = response.text();

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Failed to generate response from Gemini' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        model: 'gemini-pro',
        inputTokens: 'N/A',
        outputTokens: 'N/A',
      },
    });
  } catch (error) {
    console.error('[RAH Chatbot API Error]:', error);

    if (error instanceof Error) {
      // Handle Gemini-specific errors
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your Gemini API key.' },
          { status: 401 }
        );
      }

      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      if (error.message.includes('500') || error.message.includes('server error')) {
        return NextResponse.json(
          { error: 'Gemini service is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'RAH Tourist Guide API is running',
    status: 'healthy',
    aiProvider: 'Google Gemini Pro',
  });
}
