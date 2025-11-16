import { NextRequest, NextResponse } from 'next/server';

/**
 * RAH Tourist Guide API Endpoint
 * Handles AI-powered Indian tourism guidance using OpenAI
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

    if (!process.env.OPENAI_API_KEY) {
      console.error('[RAH Chatbot] OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Lazy-load OpenAI only when API is called
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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

    // Build conversation history
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    });

    const assistantMessage =
      response.choices[0]?.message?.content || 
      'Sorry, I could not generate a response. Please try again.';

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      },
    });
  } catch (error) {
    console.error('[RAH Chatbot API Error]:', error);

    if (error instanceof Error) {
      // Handle OpenAI-specific errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your OpenAI API key.' },
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
          { error: 'OpenAI service is temporarily unavailable. Please try again later.' },
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
  });
}
