
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { MediaItem } from '../types';

const MediaSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [history, setHistory] = useState<MediaItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setLoadingMsg(activeTab === 'image' ? 'Criando sua arte visual...' : 'Dirigindo seu vídeo cinematográfico...');

    try {
      if (activeTab === 'video') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      let url = '';
      if (activeTab === 'image') {
        url = await GeminiService.generateImage(prompt, aspectRatio);
      } else {
        url = await GeminiService.generateVideo(prompt);
      }

      const newItem: MediaItem = {
        id: Date.now().toString(),
        type: activeTab,
        url,
        prompt,
        timestamp: new Date()
      };
      setHistory(prev => [newItem, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert("Falha na geração. Verifique os detalhes no console.");
    } finally {
      setIsGenerating(false);
      setLoadingMsg('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full overflow-y-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controles */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6 shadow-2xl">
            <div className="flex p-1 bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                Gerar Imagem
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'video' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                Gerar Vídeo
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'image' ? "Uma paisagem cósmica exuberante..." : "Um holograma neon de um gato dirigindo..."}
                className="w-full h-32 glass bg-slate-900/50 border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {activeTab === 'image' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Proporção (Aspect Ratio)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["1:1", "16:9", "9:16"] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        aspectRatio === ratio
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 gemini-gradient rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner-third animate-spin"></i>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <i className={`fa-solid ${activeTab === 'image' ? 'fa-wand-magic-sparkles' : 'fa-clapperboard'}`}></i>
                  <span>Gerar {activeTab === 'image' ? 'Imagem' : 'Vídeo'}</span>
                </>
              )}
            </button>
            
            {isGenerating && (
              <div className="bg-indigo-600/10 border border-indigo-500/30 p-3 rounded-xl">
                <p className="text-xs text-indigo-400 text-center animate-pulse">
                  {loadingMsg} {activeTab === 'video' && "(Pode levar alguns minutos)"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Saída */}
        <div className="lg:flex-1 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-slate-500"></i>
            Criações Recentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.length === 0 ? (
              <div className="col-span-full py-20 glass rounded-3xl flex flex-col items-center justify-center text-slate-500 border-dashed">
                <i className="fa-solid fa-images text-4xl mb-4 opacity-20"></i>
                <p>Sua galeria está vazia</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="glass rounded-2xl overflow-hidden group border border-slate-700/50 hover:border-indigo-500/30 transition-all shadow-xl">
                  <div className="aspect-square relative bg-slate-900 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                    ) : (
                      <video src={item.url} controls className="w-full h-full object-contain" />
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest text-indigo-400 border border-white/10">
                      {item.type === 'image' ? 'Imagem' : 'Vídeo'}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-300 line-clamp-2 italic">"{item.prompt}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaSection;
