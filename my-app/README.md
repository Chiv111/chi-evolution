# The Bridge - Mission Control v4.0

**Agents HQ Redesign** - Kanban visual con estética de videojuego sci-fi.

![The Bridge Screenshot](./screenshot.png)

## Características

### 🎮 Estética Videojuego
- Diseño sci-fi inspirado en Star Citizen mobiGlas, Death Stranding, Cyberpunk 2077
- Glassmorphism + neon borders + glow effects
- Grid animado de fondo
- Efectos holograma y scanline
- Paleta: Cian (#00f0ff), Morado (#b829dd), Naranja (#ff6b35), Verde (#00ff88)

### 📋 Kanban Board
- **4 Columnas**: En Progreso | Próximas | Completadas | Bloqueadas
- Drag & drop entre columnas
- Cards estilo "misión" con:
  - Icono temático según etiquetas
  - Barra de progreso animada
  - Asignado (Mist 🌫️ o User 👤)
  - Etiquetas coloreadas
  - Glow en hover

### 💬 Chat con Mist
- Panel inferior izquierdo
- Mensajes en tiempo real
- Avatar con indicador online
- Historial persistente

### 📊 Activity Feed
- Deploys, commits, updates
- Iconos según tipo de actividad
- Timestamps relativos

### ➕ Crear Misiones
- Modal "Nueva Misión"
- Campos: Título, Descripción, Etiquetas
- Crea en cualquier columna

## Tecnologías

- **Framework**: Next.js 16 + React 19
- **Estilos**: Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **DB**: Supabase (preparado para real-time)

## Estructura

```
my-app/
├── app/
│   ├── components/
│   │   └── MissionControl.tsx    # Componente principal
│   ├── types/
│   │   └── index.ts              # Tipos Task, ChatMessage, Activity
│   ├── globals.css               # Estilos sci-fi
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── utils.ts                  # cn() helper
│   └── supabase.ts               # Cliente Supabase + seed data
└── next.config.ts
```

## Variables de Entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Uso

### Desarrollo
```bash
cd my-app
npm run dev
```

### Build
```bash
cd my-app
npm run build
```

El build estático se genera en `dist/`.

## Datos Iniciales (Seed)

**En Progreso:**
- Agents HQ v4.0 Redesign (80%)
- Sero AI Pricing Strategy (100%)

**Próximas:**
- Video Anthropic vs OpenAI
- Beta Testers Google Forms
- Health: Ear cleaning appointment

**Completadas:**
- Cardjutsu Battle System
- Chi Voice System Setup
- Sero AI Notion Packages

## Roadmap

- [ ] Conexión real-time con Supabase
- [ ] Persistencia de cambios drag & drop
- [ ] Edición inline de tareas
- [ ] Sonidos en interacciones
- [ ] Más animaciones holograma
- [ ] Responsive mobile

## Diseño

Inspirado en:
- Star Citizen mobiGlas
- Death Stranding menus
- Cyberpunk 2077 interfaces
- TFT/LoL client
- FUI (Fantasy User Interfaces)

---

**The Bridge v4.0** - Built by Mist 🌫️
