import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConversationMessage {
  type: 'user' | 'bot';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { context, user_input, conversation_history } = await request.json();

    if (!context || !user_input) {
      return NextResponse.json(
        { error: 'Missing context or user input' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build the conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful assistant that provides insights about Instagram influencers based on the provided dataset. Be concise and informative in your responses.

Based on the information provided on Instagram influencers:
${context}`
      }
    ];

    // Add conversation history if provided
    if (conversation_history && Array.isArray(conversation_history)) {
      conversation_history.forEach((message: ConversationMessage) => {
        if (message.type === 'user') {
          messages.push({
            role: 'user',
            content: message.content
          });
        } else if (message.type === 'bot') {
          messages.push({
            role: 'assistant',
            content: message.content
          });
        }
      });
    }

    // Add the current user input
    messages.push({
      role: 'user',
      content: user_input
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 