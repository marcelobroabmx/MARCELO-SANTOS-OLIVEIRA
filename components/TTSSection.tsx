
import React, { useState, useRef } from 'react';
import { GeminiService, decode } from '../services/geminiService';

const TTSSection: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeak = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const base64 = await GeminiService.textToSpeech(text, voice);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBytes = decode(base64);
      const dataInt16 = new Int16Array(audioBytes.buffer);
      const frameCount = dataInt16.length;
      const buffer = ctx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) {
      console.error(err);
      alert("Falha na síntese de voz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const voices = [
    { name: 'Kore', gender: 'Feminino', tone: 'Prestativa' },
    { name: 'Puck', gender: 'Masculino', tone: 'Engraçado' },
    { name: 'Charon', gender: 'Masculino', tone: 'Autoritário' },
    { name: 'Fenrir', gender: 'Masculino', tone: 'Grave' },
    { name: 'Zephyr', gender: 'Neutro', tone: 'Calmo' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="glass rounded-3xl p-10 shadow-2xl space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Sintetizador de Voz Profissional</h2>
          <p className="text-slate-400">Converta qualquer texto em áudio falado de alta qualidade usando nossa tecnologia de IA nativa.</p>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selecione a Persona</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {voices.map((v) => (
              <button
                key={v.name}
                onClick={() => setVoice(v.name as any)}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  voice === v.name 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1">{v.name}</div>
                <div className="text-[10px] text-slate-500">{v.tone} • {v.gender}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seu Texto</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite o que você quer que a IA fale com clareza e emoção..."
            className="w-full h-48 glass bg-slate-950/50 border-slate-800 rounded-2xl p-6 text-lg focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        <button
          onClick={handleSpeak}
          disabled={!text.trim() || isGenerating}
          className="w-full py-5 gemini-gradient rounded-2xl font-bold text-xl text-white shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {isGenerating ? (
            <i className="fa-solid fa-spinner-third animate-spin"></i>
          ) : (
            <i className="fa-solid fa-waveform-lines"></i>
          )}
          <span>{isGenerating ? "Sintetizando..." : "Sintetizar Voz"}</span>
        </button>
      </div>
    </div>
  );
};

export default TTSSection;
