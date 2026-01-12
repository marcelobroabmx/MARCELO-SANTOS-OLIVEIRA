
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: 'fa-house', label: 'Início' },
    { id: AppView.CHAT, icon: 'fa-comments', label: 'Chat & Pesquisa' },
    { id: AppView.MEDIA, icon: 'fa-photo-film', label: 'Lab de Mídia' },
    { id: AppView.TIKTOK, icon: 'fa-shopping-bag', label: 'Criador TikTok' },
    { id: AppView.LIVE, icon: 'fa-microphone-lines', label: 'Voz em Real' },
    { id: AppView.TTS, icon: 'fa-volume-high', label: 'Sintetizador' },
  ];

  return (
    <div className="w-20 md:w-64 h-screen glass border-r flex flex-col items-center md:items-stretch transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 gemini-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fa-solid fa-bolt-lightning text-white text-xl"></i>
        </div>
        <h1 className="hidden md:block font-bold text-lg gemini-text-gradient leading-tight">TikTok Viral Lab</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="hidden md:block text-[10px] text-slate-500 text-center uppercase tracking-widest">
          Versão Gratuita v3.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
