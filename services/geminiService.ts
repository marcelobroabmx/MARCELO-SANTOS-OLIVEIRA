
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

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
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
            text: `Analise esta mídia (imagem ou vídeo) e crie um PROMPT para geração de vídeo de 8 segundos no TikTok Shop.
            
            REGRAS OBRIGATÓRIAS:
            1. O prompt deve ser escrito inteiramente em PORTUGUÊS BRASILEIRO NATIVO.
            2. Deve conter a NARRAÇÃO COMPLETA (as falas) que o personagem ou narrador dirá no vídeo.
            3. ESTRUTURA DO VÍDEO (8 segundos):
               - GANCHO VIRAL (0-3s): Uma fala impactante que prenda a atenção imediatamente.
               - HISTÓRIA RÁPIDA: Uma mini narrativa mostrando o uso prático ou desejo pelo produto.
               - ESCASSEZ: Uma frase enfática dizendo que o estoque está acabando ou é a última chance.
               - CALL TO ACTION (CTA): Comando final para clicar no carrinho ou comprar agora.
            4. FOCO VISUAL: Descreva a cena cinematográfica, iluminação de estúdio, ultra-realismo, sem textos na tela (foco na ação e narração).
            
            Retorne um prompt descritivo que inclua: "Cena: [Descrição visual] | Narração: [Texto completo da fala em PT-BR]".`
          }
        ]
      }
    });
    return response.text || "";
  }

  static async generateVideo(prompt: string, model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview' = 'veo-3.1-fast-generate-preview', aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = this.getAi();
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
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
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
