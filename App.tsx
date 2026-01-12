
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatSection from './components/ChatSection';
import MediaSection from './components/MediaSection';
import LiveSection from './components/LiveSection';
import TTSSection from './components/TTSSection';
import TikTokSection from './components/TikTokSection';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="max-w-5xl mx-auto py-8 px-6 overflow-y-auto h-full custom-scrollbar pb-20">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight leading-tight">
                <span className="gemini-text-gradient">Gerador de imagens e vídeos viral para TikTok Shop</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">Crie conteúdo profissional de alto impacto com inteligência artificial de ponta.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
              {/* Feature Principal: TikTok Creator */}
              <button 
                onClick={() => setCurrentView(AppView.TIKTOK)}
                className="col-span-1 md:col-span-2 glass p-6 md:p-8 rounded-[2rem] text-left hover:border-indigo-500/50 transition-all group relative overflow-hidden border-2 border-indigo-500/10"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <i className="fa-solid fa-shopping-bag text-[8rem]"></i>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-3 transition-transform">
                    <i className="fa-solid fa-clapperboard text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className="text-2xl font-black italic">Criador TikTok Shop</h3>
                       <span className="bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Popular</span>
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
                      Transforme fotos ou vídeos de produtos em anúncios verticais de 8s. Análise de mídia avançada com ganchos virais e gatilhos de escassez integrados no fluxo pencil.
                    </p>
                  </div>
                  <div className="hidden lg:block text-slate-700 group-hover:text-indigo-500 transition-colors">
                     <i className="fa-solid fa-chevron-right text-xl"></i>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="glass p-5 rounded-2xl text-left hover:border-indigo-500/30 transition-all group border border-slate-800"
              >
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
                  <i className="fa-solid fa-search text-lg"></i>
                </div>
                <h3 className="text-base font-bold mb-1">Chat & Pesquisa</h3>
                <p className="text-slate-400 text-[11px]">Respostas em tempo real com Pesquisa Google.</p>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.MEDIA)}
                className="glass p-5 rounded-2xl text-left hover:border-purple-500/30 transition-all group border border-slate-800"
              >
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                  <i className="fa-solid fa-photo-film text-lg"></i>
                </div>
                <h3 className="text-base font-bold mb-1">Lab de Mídia</h3>
                <p className="text-slate-400 text-[11px]">Gere imagens e vídeos cinematográficos.</p>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.LIVE)}
                className="glass p-5 rounded-2xl text-left hover:border-blue-500/30 transition-all group border border-slate-800"
              >
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                  <i className="fa-solid fa-microphone-lines text-lg"></i>
                </div>
                <h3 className="text-base font-bold mb-1">Voz em Real</h3>
                <p className="text-slate-400 text-[11px]">Conversas verbais naturais com IA.</p>
              </button>

              <button 
                onClick={() => setCurrentView(AppView.TTS)}
                className="glass p-5 rounded-2xl text-left hover:border-pink-500/30 transition-all group border border-slate-800"
              >
                <div className="w-10 h-10 bg-pink-600/20 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                  <i className="fa-solid fa-waveform-lines text-lg"></i>
                </div>
                <h3 className="text-base font-bold mb-1">Sintetizador</h3>
                <p className="text-slate-400 text-[11px]">Vozes de alta fidelidade para narração.</p>
              </button>
            </div>

            <div className="p-4 glass border-amber-500/10 rounded-2xl flex items-center gap-4">
               <i className="fa-solid fa-circle-info text-amber-500 text-lg"></i>
               <p className="text-[11px] text-slate-400 leading-relaxed">
                  Esta é a <strong>Versão Gratuita</strong>. Renderização ultra-realista em processamento. 
                  <span className="text-indigo-400 ml-1 font-bold italic">Novas atualizações Pro chegando em breve!</span>
               </p>
            </div>
          </div>
        );
      case AppView.CHAT:
        return <ChatSection />;
      case AppView.MEDIA:
        return <MediaSection />;
      case AppView.TIKTOK:
        return <TikTokSection />;
      case AppView.LIVE:
        return <LiveSection />;
      case AppView.TTS:
        return <TTSSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden relative h-full">
        {/* Decorative BG */}
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full -z-10"></div>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
