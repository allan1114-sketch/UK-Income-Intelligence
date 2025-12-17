
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../geminiService';
import { ChatMessage } from '../types';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChatBot: React.FC<Props> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your AI Tax Assistant. Ask me anything about UK income tax, National Insurance, or how to optimize your take-home pay." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const aiResponse = await sendChatMessage(history, userMsg);
      setMessages(prev => [...prev, { role: 'model', content: aiResponse || 'Sorry, I encountered an error.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: 'Oops! The service is a bit busy. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-2xl bg-blue-600 text-white shadow-2xl hover:bg-blue-700 transition-all z-50 flex items-center gap-2 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="font-semibold hidden sm:inline">Ask AI Tax Advisor</span>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 transform border border-gray-100 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tax Intelligence AI</h3>
              <p className="text-[10px] text-blue-100">Gemini 3 Pro Powered</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about dividends, ISA, bands..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> AI-generated guidance. Consult a professional.
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
