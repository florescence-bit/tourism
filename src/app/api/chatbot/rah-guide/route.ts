import { NextRequest, NextResponse } from 'next/server';

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

    // Build the conversation for Gemini
    const systemPrompt = `You are RAH (Reliable Assistance & Hospitality), an expert Indian tourism guide AI assistant. You provide comprehensive, accurate, and helpful information about Indian destinations, cultural sites, safety tips, local transportation, cuisine, and travel planning. Be warm, welcoming, and enthusiastic about Indian culture. Use appropriate greetings and emojis. Always prioritize tourist safety.`;

    // Build messages for API
    const messages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'नमस्ते! I am RAH, your Indian tourism guide. How can I help you?' }],
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    // Call Gemini API directly with REST endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[RAH Chatbot] Gemini API error:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed. Invalid Gemini API key.' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const assistantMessage = 
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again.';

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        model: 'gemini-2.0-flash',
      },
    });
  } catch (error) {
    console.error('[RAH Chatbot API Error]:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your Gemini API key.' },
          { status: 401 }
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
    aiProvider: 'Google Gemini 1.5 Flash',
  });
}
