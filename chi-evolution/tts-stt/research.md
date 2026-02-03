# Investigación TTS/STT - Proyecto Chi Evolution
## Fecha: 2025-02-03

---

## 1. TEXT-TO-SPEECH (TTS) - Opciones Analizadas

### 🏆 ElevenLabs
**Perfil:** Líder en calidad de voz natural

| Característica | Especificación |
|----------------|----------------|
| Latencia | 75ms (Flash v2.5) / 150ms (standard) |
| Word Accuracy | 82% |
| Natural Sound | 45% rated high |
| Error Rate | 2.8% |
| Idiomas | 32+ |
| Voces | 3,000+ disponibles |

**Pricing:**
- Starter: $5/mes - 30k caracteres
- Creator: $22/mes - 100k caracteres
- Pro: $99/mes - 500k caracteres
- Scale: $330/mes - 2M caracteres
- API: ~$206 por 1M caracteres (v3) / $103 (Flash)

**Pros:**
- ✅ Calidad de voz superior (emociones, prosodia natural)
- ✅ Flash v2.5 extremadamente rápido (75ms)
- ✅ Voice cloning con muestras cortas
- ✅ Gran librería de voces comunitarias

**Cons:**
- ❌ Costo significativamente mayor que alternativas
- ❌ Modelo de precios por suscripción menos flexible
- ❌ Limitado a 32 idiomas

---

### 🥈 OpenAI TTS
**Perfil:** Balance calidad-coste, integración simple

| Característica | Especificación |
|----------------|----------------|
| Latencia | 200ms |
| Word Accuracy | 77% |
| Natural Sound | 22% rated high |
| Error Rate | 3.4% |
| Idiomas | 100+ |
| Voces | 11 voces predefinidas |

**Pricing:**
- TTS Standard: $15 por 1M caracteres
- TTS HD: $30 por 1M caracteres
- TTS Mini: $0.60 por 1M caracteres

**Pros:**
- ✅ Precio muy competitivo (~3x más barato que ElevenLabs)
- ✅ Integración simple (todo en una API)
- ✅ Soporte multilenguaje fluido (100+ idiomas)
- ✅ Voces consistentes y predecibles

**Cons:**
- ❌ Menor naturalidad vs ElevenLabs
- ❌ Sin opciones de personalización de voz
- ❌ Latencia más alta (200ms vs 75ms)

---

### 🥉 Opciones Open Source

#### Fish Audio / Open Audio S1
- **Calidad:** #1 en TTS-Arena (supera a ElevenLabs en tests ciegos)
- **Precio:** $9.99/mes (200 min) o $15/1M chars
- **Licencia:** Mini model gratuito (personal), comercial disponible
- **Idiomas:** EN, JP, KR, CN, FR, DE, AR, ES
- **Emociones:** Tags como (laugh), (whisper), (sob)

#### Chatterbox (Resemble AI)
- **Licencia:** MIT (✅ uso comercial gratuito)
- **Calidad:** 63.8% preferido sobre ElevenLabs en tests ciegos
- **Idiomas:** 23 idiomas
- **VRAM:** 8-10GB recomendado
- **Voice cloning:** 5-10 segundos de audio

#### Kokoro TTS
- **Parámetros:** 82M (extremadamente ligero)
- **Licencia:** Apache-2.0 (✅ comercial)
- **Rendimiento:** CPU-friendly, funciona en Raspberry Pi 4
- **Idiomas:** 10 idiomas (EN, ES, FR, DE, IT, PT, RU, JP, CN, HI)
- **Limitación:** Sin voice cloning (solo 14 voces built-in)

#### Coqui TTS / XTTS v2
- **Licencia:** MPL-2.0 (código), modelos varían
- **Voice cloning:** 6 segundos de audio
- **Idiomas:** 17 idiomas
- **Nota:** XTTS v2 solo personal (no comercial sin licencia)

#### Microsoft Edge TTS
- **Precio:** GRATUITO (con limitaciones)
- **Calidad:** Básica pero funcional
- **Uso:** Ideal para prototipos y bajo volumen

---

## 2. SPEECH-TO-TEXT (STT) - Opciones Analizadas

### 🏆 Deepgram Nova-3
**Perfil:** Mejor opción para voice agents en producción

| Característica | Especificación |
|----------------|----------------|
| WER (Word Error Rate) | ~18.3% (benchmarks independientes) |
| Latencia | <300ms streaming |
| Idiomas | 36 + switching en tiempo real (10 idiomas) |
| Precio | $0.46/hora ($4.30/1000 min) |
| Precisión vs Whisper | 36% menor WER según benchmarks internos |

**Pros:**
- ✅ Mejor balance latencia/precio/precisión
- ✅ Streaming optimizado para voice agents
- ✅ Nova-3 Medical disponible (WER 3.45% en terminología médica)
- ✅ Deepgram Flux: CSR con end-of-turn detection integrado

**Cons:**
- ❌ Menos idiomas que OpenAI (36 vs 100+)

---

### 🥈 AssemblyAI Universal-2
**Perfil:** Mayor precisión en streaming

| Característica | Especificación |
|----------------|----------------|
| WER | ~14.5% (mejor precisión en streaming) |
| Latencia | 300-600ms |
| Idiomas | 102 (Nano) / 20 (Best) |
| Precio | $0.27/hora (Universal) / $0.12/hora (Nano) |

**Pros:**
- ✅ Mayor precisión entre modelos streaming
- ✅ Excelente en contextos médicos y ventas
- ✅ All-neural architecture

**Cons:**
- ❌ Mayor latencia que Deepgram
- ❌ Pricing más complejo

---

### 🥉 OpenAI gpt-4o-transcribe
**Perfil:** Mayor soporte de idiomas

| Característica | Especificación |
|----------------|----------------|
| WER | ~21.4% (benchmarks independientes) |
| Latencia | 320ms |
| Idiomas | 100+ |
| Precio | $6.00/1000 min (gpt-4o) / $3.00/1000 min (mini) |

**Pros:**
- ✅ Mayor cobertura de idiomas
- ✅ Integración con ecosistema OpenAI
- ✅ Opción mini más económica

**Cons:**
- ❌ Mayor WER que competidores
- ❌ No open-source (solo API)
- ❌ Precio más alto que Deepgram

---

### Otras Opciones Notables

| Proveedor | WER | Latencia | Precio/hora | Notas |
|-----------|-----|----------|-------------|-------|
| Google Chirp 2 | ~11.6% | Batch | $0.96 | Mejor precisión, solo batch |
| ElevenLabs Scribe | ~15.1% | Batch | $0.40 | 99 idiomas, speaker diarization |
| Gladia AI Solaria | N/A | ~270ms | $0.61 | 100 idiomas, 42 underserved |
| Speechmatics Ursa 2 | N/A | <1s | $1.35 | 50 idiomas, fuerte en ES/PL |

---

## 3. RECOMENDACIÓN PARA CHI

### Opción Recomendada: **Híbrida/Open Source First**

#### Para TTS:
**Primera opción:** Fish Audio / Open Audio S1
- Calidad superior a ElevenLabs (según TTS-Arena)
- 80% más barato que ElevenLabs
- Modelo mini gratuito para uso personal/pruebas
- Emotion tags avanzados

**Alternativa low-cost:** Kokoro TTS
- Apache-2.0 (totalmente libre)
- Funciona en CPU (Raspberry Pi)
- Ideal para edge deployment

**Para alta calidad premium:** ElevenLabs Flash v2.5
- Cuando la latencia es crítica (<75ms)
- Para interacciones de alta fidelidad

#### Para STT:
**Primera opción:** Deepgram Nova-3
- Mejor balance para voice agents
- <300ms latencia
- Precio competitivo ($4.30/1000 min)

**Alternativa local:** Whisper (Open Source)
- Modelos open source disponibles
- Opción self-hosted para privacidad
- Requiere GPU para latencia óptima

---

## 4. COMPARATIVA DE COSTOS (Estimación Mensual)

### Escenario: 10,000 minutos/mes de uso

| Servicio | Costo TTS | Costo STT | Total |
|----------|-----------|-----------|-------|
| Premium (ElevenLabs + Deepgram) | ~$500 | $43 | **~$543** |
| Balance (OpenAI TTS + Deepgram) | $150 | $43 | **~$193** |
| Económico (Fish Audio + Deepgram) | $90 | $43 | **~$133** |
| Open Source (Kokoro + Whisper local) | $0 | $0 (infra) | **~$50** (GPU) |

---

## 5. INTEGRACIÓN CON OPENCLAW

OpenClaw ya tiene integración con:
- ✅ ElevenLabs TTS (sag tool)
- ✅ OpenAI TTS (a través de skill)

Para integrar opciones adicionales:
1. Fish Audio: API REST compatible, fácil integración
2. Deepgram STT: WebSocket streaming para baja latencia
3. Kokoro: Self-hosted, integración vía API local

---

## 6. CONCLUSIONES

1. **ElevenLabs** sigue siendo el gold standard pero a precio premium
2. **Fish Audio** ofrece calidad comparable a 80% menos costo
3. **OpenAI** es la opción más simple para integración rápida
4. **Kokoro** es ideal para deployments edge y bajo presupuesto
5. **Deepgram Nova-3** es la mejor opción STT para voice agents
6. Para máxima privacidad: **Whisper local + Kokoro**

---

*Documento generado para Proyecto Chi Evolution - Fase 1*
