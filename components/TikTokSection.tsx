
import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';

const TikTokSection: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaMime, setMediaMime] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        alert("Por favor, selecione uma imagem ou um vídeo.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedMedia(base64String);
        setMediaMime(file.type);
        setMediaType(isVideo ? 'video' : 'image');
        setVideoUrl(null);
        setGeneratedPrompt('');
        setCopied(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMedia = async () => {
    if (!selectedMedia) return;
    setIsAnalyzing(true);
    try {
      const prompt = await GeminiService.analyzeMediaForVideo(selectedMedia, mediaMime);
      setGeneratedPrompt(prompt);
      setCopied(false);
    } catch (err) {
      console.error(err);
      alert("Falha na análise da mídia.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateVideo = async () => {
    if (!generatedPrompt) return;
    setIsGenerating(true);
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
      const url = await GeminiService.generateVideo(generatedPrompt, 'veo-3.1-generate-preview', '9:16');
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Falha na renderização do vídeo cinematográfico.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full overflow-y-auto py-8 px-6 custom-scrollbar pb-24 text-slate-100">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-indigo-500/20">
              Anti-Bugs & Smooth Motion
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
              Fidelidade 1:1 • Originalidade 100%
            </span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">
            Criador <span className="gemini-text-gradient italic text-white">TikTok Shop</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Propostas exclusivas com movimentos suaves, fala natural e proteção contra direitos autorais.
          </p>
        </div>
        
        <div className="hidden md:flex flex-col items-end text-right">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Qualidade Premium</div>
          <div className="text-indigo-400 font-mono text-xs italic">Remoção de Glitches Ativa</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo */}
        <div className="lg:col-span-7 space-y-6">
          
          <section className="glass rounded-3xl p-6 shadow-xl relative border-white/5 overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs">1</div>
                <h3 className="text-lg font-bold">Upload de Referência</h3>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedMedia 
                  ? 'border-indigo-500 bg-indigo-500/5' 
                  : 'border-slate-700 hover:border-indigo-500/50 bg-slate-900/40'
                }`}
              >
                {selectedMedia ? (
                  mediaType === 'image' ? (
                    <img src={`data:${mediaMime};base64,${selectedMedia}`} className="w-full h-full object-contain p-2 rounded-2xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                       <i className="fa-solid fa-video-slash text-5xl text-indigo-400 animate-pulse"></i>
                       <span className="text-sm font-bold text-slate-300">Vídeo Pronto para Remodelagem</span>
                       <span className="text-[10px] text-slate-500 px-8">Processando suavidade de movimento e fala natural...</span>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fa-solid fa-upload text-xl text-indigo-400"></i>
                    </div>
                    <span className="text-sm font-bold text-slate-300 block">Referência de Produto/UGC</span>
                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest italic">Mantemos o produto, criamos a cena</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleMediaUpload} className="hidden" accept="image/*,video/*" />
              </div>

              <button
                onClick={analyzeMedia}
                disabled={!selectedMedia || isAnalyzing}
                className="w-full mt-4 py-4 bg-white text-slate-950 hover:bg-indigo-50 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-lg"
              >
                {isAnalyzing ? (
                  <i className="fa-solid fa-wand-magic-sparkles animate-spin text-lg"></i>
                ) : (
                  <i className="fa-solid fa-sparkles text-lg"></i>
                )}
                <span>{isAnalyzing ? "Gerando Proposta Inédita..." : "Gerar Roteiro Viral e Proposta de Prompt"}</span>
              </button>
            </div>
          </section>

          {generatedPrompt && (
            <section className="glass rounded-3xl p-6 shadow-xl border-purple-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-xs">2</div>
                  <h3 className="text-lg font-bold">Proposta de Roteiro e Prompt</h3>
                </div>
                <button 
                  onClick={copyPrompt}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-lg ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/50'
                  }`}
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  {copied ? 'Copiado!' : 'Copiar Proposta Completa'}
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 text-[11px] text-slate-200 font-sans leading-relaxed mb-4 max-h-80 overflow-y-auto custom-scrollbar">
                <div className="whitespace-pre-wrap">{generatedPrompt}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-center">
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                   <div className="text-[7px] text-slate-500 font-bold uppercase mb-1">Movimentos</div>
                   <div className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Suaves</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                   <div className="text-[7px] text-slate-500 font-bold uppercase mb-1">Fala</div>
                   <div className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Natural</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                   <div className="text-[7px] text-slate-500 font-bold uppercase mb-1">Bugs/Glitches</div>
                   <div className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Removidos</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                   <div className="text-[7px] text-slate-500 font-bold uppercase mb-1">Produto</div>
                   <div className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">1:1 Fiel</div>
                </div>
              </div>

              <button
                onClick={generateVideo}
                disabled={isGenerating}
                className="w-full py-5 gemini-gradient text-white rounded-xl font-black text-base shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <i className="fa-solid fa-clapperboard animate-bounce text-xl"></i>
                    <span>Criando Vídeo Sem Bugs...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play-circle text-xl"></i>
                    <span>Criar Vídeo Viral Original</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Lado Direito */}
        <div className="lg:col-span-5">
          <div className="sticky top-4 flex flex-col items-center">
            <div className="w-full max-w-[300px] aspect-[9/16] bg-slate-950 rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
              
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                 <div className="w-8 h-1 rounded-full bg-slate-800"></div>
              </div>
              
              <div className="absolute inset-0 z-10">
                {videoUrl ? (
                  <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-900/50">
                    <i className="fa-solid fa-wand-sparkles text-6xl text-slate-800"></i>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Pure Original Feed</p>
                  </div>
                )}
              </div>

              {/* Overlay Mock */}
              <div className="absolute bottom-10 right-3 z-20 flex flex-col gap-5 text-white/90">
                 <div className="flex flex-col items-center gap-0.5"><i className="fa-solid fa-heart text-xl drop-shadow-lg"></i><span className="text-[9px] font-black">24.1K</span></div>
                 <div className="flex flex-col items-center gap-0.5"><i className="fa-solid fa-comment-dots text-xl drop-shadow-lg"></i><span className="text-[9px] font-black">3.2K</span></div>
                 <div className="flex flex-col items-center gap-0.5"><i className="fa-solid fa-share text-xl drop-shadow-lg"></i><span className="text-[9px] font-black">6.7K</span></div>
              </div>

              <div className="absolute bottom-10 left-3 right-16 z-20 text-white drop-shadow-lg">
                 <div className="font-black text-sm mb-1">@SeuCanalTikTok</div>
                 <div className="text-[10px] leading-snug line-clamp-2 italic">A experiência original que você procurava! 🚨 Garanta o seu. #original #shop #ugc</div>
              </div>

              {/* Card de Compra */}
              <div className="absolute bottom-24 left-3 right-3 z-20 bg-white rounded-lg p-2 flex items-center gap-3 animate-bounce shadow-2xl border-2 border-indigo-500">
                 <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                    {selectedMedia && mediaType === 'image' && <img src={`data:${mediaMime};base64,${selectedMedia}`} className="w-full h-full object-cover" />}
                    {selectedMedia && mediaType === 'video' && <i className="fa-solid fa-play text-slate-400 text-xs"></i>}
                 </div>
                 <div className="flex-1">
                    <div className="text-[9px] font-black text-slate-900 uppercase leading-none mb-0.5">Shop Oferta</div>
                    <div className="text-[8px] text-red-600 font-bold uppercase tracking-tighter italic">Cópia Fiel 1:1</div>
                 </div>
                 <div className="bg-red-500 text-white px-3 py-1.5 rounded-md text-[9px] font-black uppercase shadow-lg">Comprar</div>
              </div>

              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/90 z-40 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <i className="fa-solid fa-clapperboard text-indigo-400 text-xl"></i>
                    </div>
                  </div>
                  <h4 className="font-black text-base text-white uppercase tracking-wider">Refinando Vídeo</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-3 px-2">
                    Limpando glitches, suavizando movimentos e aplicando fala natural em PT-BR para um resultado original e seguro.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokSection;
