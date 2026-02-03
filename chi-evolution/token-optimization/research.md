# Optimización de Tokens - Proyecto Chi Evolution
## Fecha: 2025-02-03

---

## 1. COMPRESIÓN DE PROMPTS

### El Problema del Contexto Largo

**Datos clave:**
- GPT-4 muestra degradación de 15-47% en performance con contextos largos
- Fenómeno "lost in the middle": información en el centro del contexto se pierde
- A 32,000 tokens, 11 de 12 modelos testeados bajan de 50% de performance
- Costo: $2.50-$5.00 por millón de tokens

**Ejemplo de impacto económico:**
- 3 mil millones de tokens/mes con Claude 4 Opus = ~$270,000
- Con 5x compresión = $54,000 (ahorro de $216,000/mes)

---

### Técnicas de Compresión

#### A. LLMLingua (Microsoft Research)

**Estado del arte en compresión de prompts.**

| Característica | Detalle |
|----------------|---------|
| Compresión | Hasta 20x |
| Pérdida de performance | Solo 1.5% |
| Método | Token perplexity con budget controller |

**Cómo funciona:**
```python
# Usa un modelo pequeño para calcular perplexity de tokens
# Tokens con menor perplexity = menos información = eliminables

from llmlingua import PromptCompressor

compressor = PromptCompressor()
compressed = compressor.compress(
    context=long_context,
    instruction="Answer the question based on context",
    question=user_question,
    target_token=300  # Target de tokens comprimidos
)
```

**Budget Controller:**
- Instrucciones: 10-20% compresión (preservar claridad)
- Ejemplos: 60-80% compresión (alta redundancia)
- Pregunta: 0-10% compresión (preservar intención)

**LongLLMLingua:** Extensión para RAG
- Question-aware coarse-to-fine compression
- Document reordering (combatir positional bias)
- +21.4% performance en NaturalQuestions
- 94% reducción de costo en benchmark LooGLE

---

#### B. Compresión Extractiva vs Abstractiva

| Tipo | Método | Cuándo usar |
|------|--------|-------------|
| **Extractiva** | Seleccionar oraciones verbatim | RAG, código, datos estructurados |
| **Abstractiva** | Generar nuevo resumen | Summarization puro |

**Resultados 2024:**
- Extractiva reranker: +7.89 F1 points a 4.5x compresión
- Abstractiva: -4.69 F1 points a ratio similar

**Conclusión:** Para RAG, extractiva suele ser mejor (filtra ruido).

---

#### C. Keyphrase Extraction

**Algoritmos principales:**

| Algoritmo | Tipo | F1 Score | Velocidad |
|-----------|------|----------|-----------|
| **RAKE** | Estadístico | 32% | Muy rápido |
| **YAKE** | Estadístico | 36% | Rápido |
| **TextRank** | Graph-based | 36% | Media |
| **KeyBERT** | Transformer | 40-45% | Lenta (necesita GPU) |

**Uso:** Mantener solo contenido con keyphrases importantes.

---

#### D. Semantic Chunking

**Estrategias:**

1. **Recursive Character Splitting** (LangChain)
```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=77,
    separators=["\n\n", "\n", ". ", " ", ""]
)
```

2. **Semantic Similarity Splitting**
   - Crear grupos de oraciones
   - Calcular embeddings de cada grupo
   - Insertar breaks donde similarity < threshold

3. **Proposition-based** (Dense X Retrieval)
   - Decomponer en proposiciones atómicas
   - Reemplazar pronombres con entidades completas
   - +5.9 a +7.8 EM@100 en question-answering

**Hallazgo Vectara 2024:**
Semantic chunking raramente justifica su costo computacional.
Fixed-size chunking igualó o superó métodos semánticos en 3/5 datasets.

---

### Guía de Selección de Técnica

| Caso de Uso | Técnica Recomendada | Compresión |
|-------------|---------------------|------------|
| RAG multi-documento | Extractiva con reranker | 2-10x |
| Chain-of-thought | LLMLingua | 5-20x |
| Código / SQL | Extractiva (nunca token pruning) | 2-5x |
| Summarization puro | Abstractiva | 5-10x |
| Chat history | Sliding window + summarization | Variable |

---

## 2. TÉCNICAS DE RESUMEN DE CONTEXTO

### Estrategias de Memoria Conversacional

#### A. Sliding Window (Ventana Deslizante)

```
┌─────────────────────────────────────────────────────────────┐
│  Mensajes antiguos → [Summary] → Mensajes recientes (N)     │
└─────────────────────────────────────────────────────────────┘
```

**Configuración típica:**
- Mantener últimos 8-10 mensajes completos
- Resumir mensajes antiguos en summary
- Cuando se excede límite, regenerar summary

**Implementación:**
```python
# Ejemplo con LangChain
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=1000,
    return_messages=True
)
```

---

#### B. Jerarquía de Memoria

```
┌─────────────────────────────────────────────────────────────┐
│  CORE MEMORIES (Identidad, preferencias críticas)           │
│  └─ Nunca se resumen, siempre disponibles                   │
├─────────────────────────────────────────────────────────────┤
│  LONG-TERM MEMORY (Todas las conversaciones)                │
│  └─ Acceso por retrieval semántico                          │
├─────────────────────────────────────────────────────────────┤
│  SHORT-TERM MEMORY (Últimas 24-48h)                         │
│  └─ Summary + últimos mensajes                              │
├─────────────────────────────────────────────────────────────┤
│  WORKING MEMORY (Contexto inmediato)                        │
│  └─ Ventana deslizante de N mensajes                        │
└─────────────────────────────────────────────────────────────┘
```

---

#### C. Consolidación Periódica

| Frecuencia | Acción |
|------------|--------|
| **Nightly** | Comprimir conversaciones del día en daily summary |
| **Weekly** | Identificar patrones, actualizar core memories |
| **Monthly** | Archivar memorias de bajo acceso, re-indexar |

---

## 3. ESTRATEGIAS DE CACHÉ SEMÁNTICA

### GPTCache

**Librería líder para caché semántico de LLMs.**

**Beneficios:**
- 💰 Reduce costos hasta 10x
- ⚡ Mejora velocidad hasta 100x
- 🔄 Integración con LangChain, LlamaIndex

**Arquitectura:**
```
User Query → Embedding → Vector Search → Similarity Check → Cache Hit?
                ↓                                       ↓
           Vector Store                          LLM API Call
                ↓                                       ↓
         Similar Queries                        Store Response
```

**Modos de operación:**

| Modo | Descripción |
|------|-------------|
| **Exact Match** | Respuesta exacta almacenada |
| **Similar Search** | Búsqueda semántica de queries similares |
| **Temperature** | Control de exploración vs explotación |

**Integración simple:**
```python
from gptcache import cache
from gptcache.adapter import openai

cache.init()
cache.set_openai_key()

# Ahora todas las llamadas a openai usan caché
```

**Métricas:**
- Hit Ratio: % de queries servidas desde caché
- Latency: Tiempo de respuesta desde caché
- Recall: % de queries que deberían haber sido servidas desde caché

---

### Estrategias de Caché para OpenClaw

#### Nivel 1: Caché de Respuestas Exactas
```python
# Para queries idénticas
key = hash(query)
if key in cache:
    return cache[key]
```

#### Nivel 2: Caché Semántica
```python
# Para queries similares
embedding = embed(query)
similar = vector_search(embedding, threshold=0.95)
if similar:
    return similar.response
```

#### Nivel 3: Caché de Contexto
```python
# Para recuperación de memoria
context_hash = hash(retrieved_contexts)
if context_hash in context_cache:
    return context_cache[context_hash]
```

---

## 4. ESTRATEGIAS ADICIONALES

### A. Pre-fetching Proactivo

```python
# Predecir información que el usuario necesitará
# basándose en el contexto actual

if topic == "viaje a París":
    prefetch(["clima París", "mejores restaurantes París", "metro París"])
```

### B. Streaming Parcial

```python
# Enviar partes de la respuesta mientras se genera
# reduce percepción de latencia

for chunk in llm.stream(query):
    yield chunk
```

### C. Modelo Cascada

```python
# Intentar con modelo más barato primero

def cascade_query(query):
    # 1. Intentar con modelo local/cheap
    response = cheap_model(query)
    if confidence(response) > 0.9:
        return response
    
    # 2. Escalar a modelo premium
    return expensive_model(query)
```

---

## 5. IMPLEMENTACIÓN PARA CHI

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query                                │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  CACHÉ LAYER                                                 │
│  ├─ Exact Match Cache (Redis)                               │
│  └─ Semantic Cache (GPTCache + LanceDB)                     │
└─────────────────────┬───────────────────────────────────────┘
                      ↓ (miss)
┌─────────────────────────────────────────────────────────────┐
│  CONTEXT COMPRESSION                                         │
│  ├─ Memory Retrieval (LanceDB + BGE-M3)                     │
│  ├─ Sliding Window (últimos 10 mensajes)                    │
│  ├─ Summary Buffer (resumen histórico)                      │
│  └─ LLMLingua Compression                                   │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  LLM API CALL                                                │
│  └─ Modelo seleccionado (cascada si aplica)                 │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  POST-PROCESSING                                             │
│  ├─ Store in cache                                          │
│  ├─ Update memory                                           │
│  └─ Stream to user                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. ESTIMACIÓN DE AHORRO

### Escenario: Chi con uso moderado

| Componente | Sin Optimización | Con Optimización | Ahorro |
|------------|------------------|------------------|--------|
| Tokens LLM | 50M/mes | 15M/mes | 70% |
| Costo API | $250/mes | $75/mes | $175/mes |
| Latencia avg | 2s | 500ms | 75% |
| Cache Hit Rate | 0% | ~60% | - |

---

## 7. CONCLUSIONES

1. **LLMLingua** es la técnica más efectiva para compresión (20x con 1.5% pérdida)
2. **Sliding window + summary** es el estándar para memoria conversacional
3. **GPTCache** puede reducir costos hasta 10x con implementación simple
4. **Compresión extractiva > abstractiva** para RAG y código
5. **Semantic chunking** raramente justifica su costo vs fixed-size
6. **Jerarquía de memoria** (working/short/long/core) optimiza retrieval

---

## 8. REFERENCIAS

- [LLMLingua (Microsoft Research)](https://github.com/microsoft/LLMLingua)
- [LongLLMLingua Paper](https://aclanthology.org/2024.acl-long.91/)
- [GPTCache (Zilliz)](https://github.com/zilliztech/GPTCache)
- [Stanford - Lost in the Middle](https://arxiv.org/abs/2307.03172)
- [Prompt Compression Survey](https://arxiv.org/html/2410.12388v2)

---

*Documento generado para Proyecto Chi Evolution - Fase 1*
