# Investigación Memoria Vectorial - Proyecto Chi Evolution
## Fecha: 2025-02-03

---

## 1. COMPARATIVA DE BASES DE DATOS VECTORIALES

### 🏆 LanceDB
**Perfil:** Embedded, serverless, ideal para edge/móvil

| Característica | Especificación |
|----------------|----------------|
| Arquitectura | Embedded, serverless |
| Licencia | Apache 2.0 (Open Source) |
| Lenguaje | Rust (Python/JS bindings) |
| Escala Ideal | Hasta ~50M vectores |
| Latencia | <10ms local |
| Costo | Gratuito (self-hosted) |

**Features Clave:**
- ✅ Zero-copy, versioning automático
- ✅ GPU support para índices
- ✅ Multimodal nativo (texto, imágenes, video, point clouds)
- ✅ Lance columnar format optimizado para ML
- ✅ Sin servidor que gestionar
- ✅ Integración nativa con LangChain, LlamaIndex

**Casos de Uso Ideales:**
- Edge computing / IoT
- Aplicaciones móviles
- Prototipos rápidos
- RAG local (ej. AnythingLLM lo usa por defecto)

---

### 🥈 Chroma
**Perfil:** Python-first, ideal para prototipado RAG

| Característica | Especificación |
|----------------|----------------|
| Arquitectura | Client-Server o Embedded |
| Licencia | Apache 2.0 (Open Source) |
| Lenguaje | Python |
| Escala Ideal | Millones de vectores |
| Costo | Free self-hosted / $20-500/mo cloud |

**Features Clave:**
- ✅ Deep LangChain integration
- ✅ Comunidad activa
- ✅ Setup simple (pip install chromadb)
- ✅ Perfecto para RAG MVPs

**Casos de Uso Ideales:**
- Prototipado rápido
- Q&A chatbots
- Knowledge bases internas
- Aplicaciones con datos cambiantes frecuentemente

---

### 🥉 Pinecone
**Perfil:** Managed cloud, zero-ops, enterprise

| Característica | Especificación |
|----------------|----------------|
| Arquitectura | Fully Managed Cloud |
| Licencia | Proprietary |
| Escala Ideal | Billones de vectores |
| Latencia | 5-10ms |
| Costo | $70-1,200/mo |

**Features Clave:**
- ✅ Zero-ops (sin servidores que gestionar)
- ✅ Enterprise features (RBAC, encryption)
- ✅ Hybrid search avanzado
- ✅ Metadata filtering eficiente

**Casos de Uso Ideales:**
- Producción enterprise
- E-commerce real-time
- Startups que necesitan escalar rápido
- Equipos sin capacidad DevOps

---

### Otras Opciones

| Base de Datos | Arquitectura | Mejor Para | Notas |
|---------------|--------------|------------|-------|
| **Milvus** | Distributed, Client-Server | Billones de vectores, self-hosted | Open source, alta tunabilidad |
| **Weaviate** | Vector-native DB | GraphQL queries, modular | Open source, schema flexible |
| **Qdrant** | Rust-based | Filtrado híbrido, rust ecosystem | Open source, alta performance |
| **FAISS** | Library (Meta) | Investigación, casos específicos | No es DB completa |

---

## 2. RECOMENDACIÓN PARA OPENCLAW/CHI

### Opción Primaria: **LanceDB**

**Razones:**
1. ✅ **Embeddable:** Sin servidor externo, reduce complejidad
2. ✅ **Rust-native:** Aligned con arquitectura moderna
3. ✅ **Zero-copy:** Eficiente en memoria
4. ✅ **Versioning:** Historial de cambios sin infra extra
5. ✅ **Costo:** 100% gratuito, sin vendor lock-in
6. ✅ **Integración:** APIs Python/JS/REST disponibles

**Trade-off:** Limitado a ~50M vectores (suficiente para memoria conversacional personal)

---

### Alternativa: **Chroma**
Si se necesita:
- Mayor comunidad/ecosistema
- Integración nativa con LangChain más madura
- Opción cloud gestionada posteriormente

---

## 3. ESTRATEGIA DE EMBEDDINGS

### Opciones Analizadas

| Modelo | Dimensión | Idiomas | Calidad | Costo | Hosting |
|--------|-----------|---------|---------|-------|---------|
| **OpenAI text-embedding-3** | 1536-3072 | 100+ | ⭐⭐⭐⭐⭐ | $0.13/1M tokens | API |
| **BGE-M3** | 1024 | 100+ | ⭐⭐⭐⭐⭐ | Gratis | Local |
| **BGE-large-en-v1.5** | 1024 | EN | ⭐⭐⭐⭐ | Gratis | Local |
| **E5-mistral** | 4096 | 100+ | ⭐⭐⭐⭐⭐ | Gratis | Local |
| **Nomic-embed** | 768 | 100+ | ⭐⭐⭐⭐ | Gratis | Local |

---

### 🏆 Recomendación: **BGE-M3**

**Por qué:**
1. ✅ **Multi-linguality:** 100+ idiomas
2. ✅ **Multi-granularity:** Input hasta 8192 tokens
3. ✅ **Multi-functionality:** Dense + Lexical + Multi-vector (ColBERT)
4. ✅ **SOTA:** Supera OpenAI v3 en benchmarks multilingües
5. ✅ **Gratuito:** Sin costos de API
6. ✅ **Tamaño:** Modelo base manejable (~2GB)

**Características únicas:**
- **Dense retrieval:** Embedding tradicional
- **Sparse retrieval:** Lexical matching tipo BM25
- **Multi-vector:** ColBERT-style late interaction

---

### Alternativas:

**OpenAI text-embedding-3:**
- ✅ Más simple, sin infra local
- ❌ Costo continuo
- ❌ Dependencia de terceros

**E5-mistral:**
- ✅ Excelente calidad
- ❌ Mayor tamaño (~20GB)
- ❌ Requiere más recursos

---

## 4. ESQUEMA DE DATOS ÓPTIMO PARA MEMORIA CONVERSACIONAL

### Propuesta de Schema

```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "session_id": "string",
  "timestamp": "datetime",
  "role": "user|assistant|system|tool",
  "content": "string",
  "content_type": "text|image|audio|code",
  "embedding": "vector[1024]",
  "metadata": {
    "importance_score": "float 0-1",
    "topic_tags": ["string"],
    "emotional_sentiment": "string",
    "entities": ["string"],
    "action_items": ["string"],
    "referenced_messages": ["uuid"]
  },
  "context_window": {
    "previous_messages": ["uuid"],
    "related_memories": ["uuid"]
  },
  "retention": {
    "last_accessed": "datetime",
    "access_count": "int",
    "decay_factor": "float"
  }
}
```

---

### Estrategias de Organización

#### A. Jerarquía de Memoria

```
Working Memory (Contexto inmediato)
    ↓ (consolidación)
Short-term Memory (Últimas 24-48h)
    ↓ (importancia ≥ threshold)
Long-term Memory (Todo almacenado)
    ↓ (acceso frecuente)
Core Memories (Identidad/preferencias)
```

#### B. Indexación

1. **Índice temporal:** Para recuperar conversaciones recientes
2. **Índice semántico:** Para similaridad de contenido
3. **Índice de entidades:** Para menciones de personas/lugares
4. **Índice de tópicos:** Para agrupación temática

#### C. Consolidación

- **Nightly job:** Comprimir conversaciones del día en summary
- **Weekly job:** Identificar patrones y actualizar core memories
- **Monthly job:** Archivar memórias de bajo acceso

---

## 5. INTEGRACIÓN CON OPENCLAW

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────┐
│                    OpenClaw Agent                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Memory Mgr  │←→│ LanceDB (FS) │←→│ BGE-M3 Embed │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↑                                              │
│  ┌──────────────┐                                     │
│  │ Context Comp │                                     │
│  └──────────────┘                                     │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Recuperación

1. **Query embedding:** BGE-M3 codifica la consulta actual
2. **Búsqueda híbrida:** LanceDB busca en dense + sparse
3. **Reranking:** Modelo ligero reordena resultados
4. **Context assembly:** Ensamblar ventana de contexto
5. **Compresión:** LLMLingua comprime si es necesario

---

## 6. IMPLEMENTACIÓN SUGERIDA

### Fase 1: Básica
- LanceDB embedded
- BGE-M3 local
- Recuperación semántica simple
- Ventana de contexto fija

### Fase 2: Avanzada
- Memoria jerárquica
- Consolidación automática
- Filtrado híbrido
- Compresión de contexto

### Fase 3: Inteligente
- Importancia automática
- Clustering de tópicos
- Predicción de necesidades
- Memoria proactiva

---

## 7. COSTOS ESTIMADOS

### Opción Local (Recomendada)
| Componente | Costo |
|------------|-------|
| LanceDB | $0 |
| BGE-M3 | $0 (infra local) |
| Almacenamiento | ~$5/mes (SSD) |
| **Total** | **~$5/mes** |

### Opción Cloud
| Componente | Costo |
|------------|-------|
| Pinecone | $70/mo mínimo |
| OpenAI Embeddings | ~$10/mo (uso moderado) |
| **Total** | **~$80/mes** |

---

## 8. CONCLUSIONES

1. **LanceDB** es ideal para OpenClaw: embedded, sin servidor, eficiente
2. **BGE-M3** supera a OpenAI en calidad multilingüe y es gratuita
3. **Esquema jerárquico** (working/short/long/core) optimiza retrieval
4. **Híbrido dense+sparse** ofrece mejor recuperación que solo embeddings
5. **Consolidación periódica** mantiene memoria relevante y manejable

---

*Documento generado para Proyecto Chi Evolution - Fase 1*
