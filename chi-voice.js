/**
 * Chi Voice System - TTS y STT
 * Deepgram para todo (STT + TTS) - $200 créditos disponibles
 */

const fs = require('fs').promises;
const path = require('path');

class ChiVoice {
  constructor(options = {}) {
    this.provider = 'deepgram'; // Unificado: Deepgram hace TTS y STT
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    this.language = options.language || 'es';
    this.audioDir = options.audioDir || './audio';
    
    if (!this.deepgramApiKey) {
      throw new Error('DEEPGRAM_API_KEY requerida');
    }
  }

  /**
   * Text-to-Speech: Convierte texto a audio
   * Usa Deepgram Aura (TTS de alta calidad)
   */
  async speak(text, options = {}) {
    // Modelos de voz Deepgram Aura
    const model = options.model || 'aura-asteria-en'; // asteria, luna, stella, etc.
    const encoding = options.encoding || 'mp3';
    
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}&encoding=${encoding}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Deepgram TTS error ${response.status}: ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const filename = `chi-voz-${Date.now()}.mp3`;
    const filepath = path.join(this.audioDir, filename);
    
    await fs.mkdir(this.audioDir, { recursive: true });
    await fs.writeFile(filepath, Buffer.from(audioBuffer));
    
    return {
      filepath,
      filename,
      text,
      provider: 'deepgram-tts',
      model,
      timestamp: Date.now()
    };
  }

  /**
   * Speech-to-Text: Convierte audio a texto
   * Usa Deepgram Nova-3 (mejor precisión)
   */
  async listen(audioBuffer, options = {}) {
    const model = options.model || 'nova-3';
    const language = options.language || this.language;
    const contentType = options.contentType || 'audio/mp3';

    const response = await fetch(
      `https://api.deepgram.com/v1/listen?model=${model}&language=${language}&punctuate=true&smart_format=true&diarize=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`,
          'Content-Type': contentType
        },
        body: audioBuffer
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Deepgram STT error ${response.status}: ${error}`);
    }

    const result = await response.json();
    const alternative = result.results?.channels[0]?.alternatives[0];
    
    return {
      text: alternative?.transcript || '',
      confidence: alternative?.confidence || 0,
      words: alternative?.words || [],
      paragraphs: result.results?.channels[0]?.alternatives[0]?.paragraphs || [],
      provider: 'deepgram-stt',
      model,
      timestamp: Date.now()
    };
  }

  /**
   * Transcribe archivo de audio desde path
   */
  async transcribeFile(filepath, options = {}) {
    const buffer = await fs.readFile(filepath);
    const ext = path.extname(filepath).toLowerCase();
    
    const contentTypeMap = {
      '.mp3': 'audio/mp3',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/m4a',
      '.webm': 'audio/webm'
    };
    
    options.contentType = contentTypeMap[ext] || 'audio/mp3';
    return this.listen(buffer, options);
  }

  /**
   * Genera audio y devuelve buffer (sin guardar archivo)
   */
  async speakBuffer(text, options = {}) {
    const model = options.model || 'aura-asteria-en';
    
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}&encoding=mp3`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.deepgramApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram TTS error ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  /**
   * Verifica saldo y estado de la cuenta
   */
  async checkStatus() {
    const response = await fetch('https://api.deepgram.com/v1/projects', {
      headers: {
        'Authorization': `Token ${this.deepgramApiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo verificar estado de Deepgram');
    }

    const data = await response.json();
    return {
      projects: data.projects?.length || 0,
      status: 'active',
      provider: 'deepgram'
    };
  }

  /**
   * Estima costo de uso mensual
   * Deepgram: TTS ~$4/hora, STT ~$4.30/1000min
   */
  estimateCost(hoursTTS = 10, minutesSTT = 500) {
    const ttsCost = hoursTTS * 4; // $4 por hora de audio generado
    const sttCost = (minutesSTT / 1000) * 4.30; // $4.30 por 1000 minutos
    
    return {
      tts: ttsCost.toFixed(2),
      stt: sttCost.toFixed(2),
      total: (ttsCost + sttCost).toFixed(2),
      currency: 'USD',
      remaining: 200 - (ttsCost + sttCost) // Créditos restantes de $200
    };
  }
}

module.exports = ChiVoice;
