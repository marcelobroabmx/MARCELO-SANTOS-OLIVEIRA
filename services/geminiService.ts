
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiService {
  private static getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async chatWithSearch(prompt: string) {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Você é um assistente prestativo. Responda sempre em Português Brasileiro.",
      },
    });

    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      text: response.text || "",
      sources
    };
  }

  static async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Nenhuma imagem gerada");
  }

  static async analyzeMediaForVideo(base64Data: string, mimeType: string) {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Analise esta mídia e crie uma proposta original de prompt e roteiro focado em conversão para TikTok Shop.

REGRAS DE OURO (PROTEÇÃO E QUALIDADE):
1. EVITAR DIREITOS AUTORAIS: Se houver pessoas, crie uma versão similar mas única. Modifique levemente o modelo para ser original. 
2. FALA NATURAL E ÚNICA: O roteiro deve ser inédito, modificando o tom e as palavras da fala original, mas mantendo a estrutura de conversão (Gancho, Escassez, Narração, CTA).
3. FIDELIDADE AO PRODUTO: O produto deve ser uma réplica 1:1, sem alterações de tamanho, cor ou especificações.
4. QUALIDADE TÉCNICA EXTREMA: O prompt deve instruir explicitamente o modelo de vídeo a remover todos os bugs visuais, garantir movimentos suaves e uma fala ultra-natural.

ESTRUTURA EM PORTUGUÊS BRASILEIRO NATIVO:
- GANCHO VIRAL (0-3s): Fala impactante inédita.
- NARRATIVA UGC: Uso prático do produto com realismo.
- ESCASSEZ: Gatilho mental de estoque acabando.
- CTA: Chamada clara para o carrinho.

SAÍDA OBRIGATÓRIA (MANTENHA ESTA INTRODUÇÃO):
"Aqui está uma proposta original de prompt e roteiro focado em conversão para TikTok Shop, mantendo a fidelidade ao produto e evitando direitos autorais:

PROMPT VISUAL: [Descreva a cena cinematográfica, movimentos suaves, sem bugs, sem membros duplicados, modelo similar original, produto 1:1]
ROTEIRO DE NARRAÇÃO: [Texto completo das falas em Português Brasileiro nativo com fala natural e fluida]."`
          }
        ]
      }
    });
    return response.text || "";
  }

  static async generateVideo(prompt: string, model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview' = 'veo-3.1-fast-generate-preview', aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Link de download do vídeo não encontrado.");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Erro ao baixar o vídeo gerado.");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  static async textToSpeech(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore') {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Áudio não gerado");
    return base64Audio;
  }
}
