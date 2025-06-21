'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, User, Bot } from 'lucide-react';
import { parseCSV, dataToString, InfluencerData } from '@/lib/csv-parser';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvContext, setCsvContext] = useState<string>('');
  const [error, setError] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load CSV data on component mount
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch('/influencer1.csv');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        const contextString = dataToString(data);
        setCsvContext(contextString);
      } catch (err) {
        setError('Failed to load influencer data');
        console.error('Error loading CSV:', err);
      }
    };

    loadCSVData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: csvContext,
          user_input: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-center">Instagram Influencer Chat</h1>
          <p className="text-center text-muted-foreground">
            Ask questions about our influencer dataset
          </p>
        </div>

        <ScrollArea className="flex-1 border rounded-lg p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[80%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <Card className="max-w-[80%] border-destructive">
                  <CardContent className="p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the influencers..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
} 