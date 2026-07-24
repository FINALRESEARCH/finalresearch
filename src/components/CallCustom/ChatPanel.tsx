'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@whereby.com/browser-sdk/react';

interface ChatPanelProps {
  messages: ChatMessage[];
  senderNames: Record<string, string>;
  localSenderId: string;
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, senderNames, localSenderId, onSend, onClose }: ChatPanelProps) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <div className="flex w-full shrink-0 flex-col border-t border-foreground sm:w-72 sm:border-l sm:border-t-0">
      <div className="flex items-center justify-between border-b border-foreground px-3 py-2">
        <span className="text-xs text-foreground">CHAT</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="text-xs text-foreground transition-opacity hover:opacity-70"
        >
          CLOSE
        </button>
      </div>

      <div ref={listRef} className="flex h-64 flex-col gap-2 overflow-y-auto p-3 sm:h-auto sm:flex-1">
        {messages.length === 0 && (
          <div className="text-xs text-foreground opacity-50">NO MESSAGES YET</div>
        )}
        {messages.map((message, i) => (
          <div key={i} className="text-xs text-foreground">
            <span className="opacity-50">
              {message.senderId === localSenderId ? 'YOU' : senderNames[message.senderId] || 'GUEST'}:
            </span>{' '}
            {message.text}
          </div>
        ))}
      </div>

      <div className="flex border-t border-foreground">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="MESSAGE"
          className="flex-1 bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground placeholder:opacity-50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="border-l border-foreground px-3 py-2 text-xs text-foreground transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
