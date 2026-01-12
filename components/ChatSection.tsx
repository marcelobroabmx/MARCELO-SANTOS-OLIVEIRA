
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await GeminiService.chatWithSearch(input);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: result.text,
        sources: result.sources,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        text: "Desculpe, encontrei um erro. Por favor, verifique sua conexão e tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-search text-2xl text-slate-400"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Chat Inteligente com Pesquisa</h2>
              <p className="text-slate-400 max-w-sm mx-auto mt-2">
                Pergunte qualquer coisa! Usarei a Pesquisa Google em tempo real para fornecer respostas fundamentadas e precisas.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'glass text-slate-200'
            }`}>
              <div className="text-sm opacity-60 mb-1 flex items-center gap-2">
                <i className={`fa-solid ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                {msg.role === 'user' ? 'Você' : 'Assistente IA'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Fontes</div>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, sIdx) => (
                      <a 
                        key={sIdx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 transition-colors"
                      >
                        <i className="fa-solid fa-link text-[10px]"></i>
                        {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass px-5 py-4 rounded-2xl flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="py-6">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pesquise algo ou faça uma pergunta complexa..."
            className="w-full glass bg-slate-900/50 border-slate-700 rounded-2xl py-4 pl-6 pr-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            <span>Enviar</span>
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center uppercase tracking-widest">
          Potencializado por IA avançada com Pesquisa Google
        </p>
      </div>
    </div>
  );
};

export default ChatSection;
