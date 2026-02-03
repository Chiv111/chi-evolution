/**
 * Chi Voice System - TTS y STT
 * Integración con Fish Audio (TTS) y Deepgram (STT)
 */

const fs = require('fs').promises;
const path = require('path');

class ChiVoice {
  constructor(options = {}) {
    this.ttsProvider = options.ttsProvider || 'fish-audio'; // 'fish-audio', 'openai', 'edge'
    this.sttProvider = options.sttProvider || 'deepgram'; // 'deepgram', 'whisper', 'assemblyai'
    
    // API Keys (deben configurarse via env vars)
    this.fishApiKey = process.env.FISH_AUDIO_API_KEY;
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    // Configuración de voz
    this.voiceId = options.voiceId || 'default'; // Fish Audio voice ID
    this.language = options.language || 'es'; // es, en
    
    // Directorio para archivos de audio
    this.audioDir = options.audioDir || './audio';
  }

  /**
   * Text-to-Speech: Convierte texto a audio
   */
  async speak(text, options = {}) {
    switch (this.ttsProvider) {
      case 'fish-audio':
        return this.speakFishAudio(text, options);
      case 'openai':
        return this.speakOpenAI(text, options);
      case 'edge':
        return this.speakEdge(text, options);
      default:
        throw new Error(`TTS provider no soportado: ${this.ttsProvider}`);
    }
  }

  /**
   * Fish Audio TTS - Calidad #1, precio competitivo
   */
  async speakFishAudio(text, options = {}) {
    if (!this.fishApiKey) {
      throw new Error('FISH_AUDIO_API_KEY no configurada');
    }

    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.fishApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice_id: options.voiceId || this.voiceId,
        language: options.language || this.language,
        speed: options.speed || 1.0,
        format: 'mp3'
      })
    });

    if (!response.ok) {
      throw new Error(`Fish Audio error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const filename = `chi-tts-${Date.now()}.mp3`;
    const filepath = path.join(this.audioDir, filename);
    
    await fs.mkdir(this.audioDir, { recursive: true });
    await fs.writeFile(filepath, Buffer.from(audioBuffer));
    
    return {
      filepath,
      filename,
      text,
      provider: 'fish-audio',
      timestamp: Date.now()
    };
  }

  /**
   * OpenAI TTS - Fallback confiable
   */
  async speakOpenAI(text, options = {}) {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: options.voice || 'nova', // alloy, echo, fable, onyx, nova, shimmer
        input: text,
        speed: options.speed || 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const filename = `chi-tts-${Date.now()}.mp3`;
    const filepath = path.join(this.audioDir, filename);
    
    await fs.mkdir(this.audioDir, { recursive: true });
    await fs.writeFile(filepath, Buffer.from(audioBuffer));
    
    return {
      filepath,
      filename,
      text,
      provider: 'openai',
      timestamp: Date.now()
    };
  }

  /**
   * Deepgram STT - Speech-to-Text
   */
  async listen(audioBuffer, options = {}) {
    if (!this.deepgramApiKey) {
      throw new Error('DEEPGRAM_API_KEY no configurada');
    }

    const model = options.model || 'nova-3'; // nova-3, nova-2, enhanced
    const language = options.language || this.language;

    const response = await fetch(
      `https://api.deepgram.com/v1/listen?model=${model}&language=${language}&punctuate=true&smart_format=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`,
          'Content-Type': 'audio/wav' // o audio/mp3, audio/ogg
        },
        body: audioBuffer
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      text: result.results?.channels[0]?.alternatives[0]?.transcript || '',
      confidence: result.results?.channels[0]?.alternatives[0]?.confidence || 0,
      words: result.results?.channels[0]?.alternatives[0]?.words || [],
      provider: 'deepgram',
      timestamp: Date.now()
    };
  }

  /**
   * Whisper STT (OpenAI) - Fallback
   */
  async listenWhisper(audioBuffer, options = {}) {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer]), 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', options.language || this.language);
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Whisper error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      text: result.text || '',
      confidence: 0, // Whisper no devuelve confidence
      provider: 'whisper',
      timestamp: Date.now()
    };
  }

  /**
   * Configuración de voz de marca Chi
   */
  getVoiceConfig() {
    return {
      // Configuración optimizada para "sonar como Chi"
      fishAudio: {
        // TODO: Entrenar voz personalizada con muestras
        // Por ahora usar voz predefinida más cercana
        voiceId: 'es-male-1', // Placeholder
        speed: 1.1, // Ligeramente más rápido = más eficiente
        tone: 'professional-warm'
      },
      openai: {
        voice: 'nova', // Más cálida, menos robótica
        speed: 1.1
      }
    };
  }

  /**
   * Costo estimado por uso
   */
  estimateCost(charsPerMonth = 100000) {
    const fishCost = (charsPerMonth / 1000000) * 15; // $15 por 1M chars
    const openaiCost = (charsPerMonth / 1000) * 0.015; // $0.015 por 1K chars
    
    return {
      fishAudio: fishCost,
      openai: openaiCost,
      savings: ((openaiCost - fishCost) / openaiCost * 100).toFixed(1) + '%'
    };
  }
}

module.exports = ChiVoice;
