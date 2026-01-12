
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from '../services/geminiService';

const LiveSection: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const inputTranscriptionRef = useRef('');
  const outputTranscriptionRef = useRef('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inCtx;
      outputAudioContextRef.current = outCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (audioBase64) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.inputTranscription) {
              inputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            } else if (message.serverContent?.outputTranscription) {
              outputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = inputTranscriptionRef.current;
              const modelText = outputTranscriptionRef.current;
              setTranscriptions(prev => [
                ...prev, 
                { role: 'user', text: userText },
                { role: 'model', text: modelText }
              ]);
              inputTranscriptionRef.current = '';
              outputTranscriptionRef.current = '';
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Erro Live", e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "Você é um companheiro amigável. Fale naturalmente, seja prestativo e mantenha uma conversa leve em Português Brasileiro."
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      alert("Não foi possível iniciar a sessão. Certifique-se de que o acesso ao microfone foi concedido.");
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col py-10 px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold gemini-text-gradient mb-4">Conversa por Voz em Tempo Real</h2>
        <p className="text-slate-400">Experimente interações humanas ultra-rápidas e naturais.</p>
      </div>

      <div className="flex-1 glass rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
        {isActive ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 px-4 mb-6">
              {transcriptions.map((t, idx) => (
                <div key={idx} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${t.role === 'user' ? 'bg-indigo-600/30 text-indigo-200' : 'bg-slate-800 text-slate-300'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 h-12 mb-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" 
                       style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
              <button 
                onClick={stopSession}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all"
              >
                Encerrar Conversa
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <div className="w-48 h-48 rounded-full gemini-gradient flex items-center justify-center p-1 animate-pulse">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-microphone text-6xl text-indigo-400"></i>
              </div>
            </div>
            
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-2xl transition-all disabled:opacity-50"
            >
              {isConnecting ? "Estabelecendo Conexão..." : "Iniciar Voz em Tempo Real"}
            </button>
            
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved"></i>
              Conexão criptografada • IA de áudio nativa
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSection;
