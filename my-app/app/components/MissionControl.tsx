'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  Plus,
  MoreHorizontal,
  Clock,
  Zap,
  Bug,
  Search,
  Sparkles,
  Activity,
  GitCommit,
  Rocket,
  User,
  Bot,
  X,
  Edit2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Task, TaskStatus, ChatMessage, ActivityItem } from '@/app/types'
import { seedTasks, seedChatMessages, seedActivities } from '@/lib/supabase'

// --- Types & Constants ---

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
  { id: 'in-progress', title: 'EN PROGRESO', icon: <Target className="w-5 h-5" />, color: 'var(--neon-cyan)' },
  { id: 'upcoming', title: 'PRÓXIMAS', icon: <Calendar className="w-5 h-5" />, color: 'var(--neon-purple)' },
  { id: 'completed', title: 'COMPLETADAS', icon: <CheckCircle2 className="w-5 h-5" />, color: 'var(--neon-green)' },
  { id: 'blocked', title: 'BLOQUEADAS', icon: <AlertCircle className="w-5 h-5" />, color: 'var(--neon-orange)' },
]

const TAG_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  feature: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  bug: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  research: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  strategy: 'bg-green-500/20 text-green-400 border-green-500/30',
  content: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  setup: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  marketing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  health: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  personal: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  game: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  voice: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  documentation: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
}

// --- Components ---

function TaskCard({
  task,
  isOverlay,
  onClick,
}: {
  task: Task
  isOverlay?: boolean
  onClick?: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'glass rounded-lg p-4 cursor-grab active:cursor-grabbing relative overflow-hidden group',
        isOverlay && 'scale-105 rotate-2 shadow-2xl glow-cyan z-50',
        isDragging && 'opacity-50'
      )}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Progress glow on top border */}
      <div
        className="absolute top-0 left-0 h-[2px] progress-glow"
        style={{
          width: `${task.progress}%`,
          background: 'var(--neon-cyan)',
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTaskIcon(task.tags)}</span>
          <h4 className="font-semibold text-sm text-gray-100 leading-tight">{task.title}</h4>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
          <span className="text-xs">{task.assignee === 'mist' ? '🌫️' : '👤'}</span>
          <span className="text-xs text-gray-400 capitalize">{task.assignee}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Progreso</span>
          <span className="text-cyan-400 font-mono">{task.progress}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${task.progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))`,
            }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {task.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              'px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border',
              TAG_COLORS[tag] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function getTaskIcon(tags: string[]): string {
  if (tags.includes('bug')) return '🐛'
  if (tags.includes('feature')) return '✨'
  if (tags.includes('research')) return '🔬'
  if (tags.includes('content')) return '📝'
  if (tags.includes('strategy')) return '🎯'
  if (tags.includes('game')) return '🎮'
  if (tags.includes('health')) return '💊'
  if (tags.includes('voice')) return '🎙️'
  if (tags.includes('documentation')) return '📚'
  return '📋'
}

function Column({
  column,
  tasks,
  onAddTask,
}: {
  column: typeof COLUMNS[0]
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
}) {
  const { setNodeRef, isOver } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  })

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className={cn(
        'flex flex-col h-full min-h-[400px] rounded-xl',
        isOver && 'bg-cyan-500/5'
      )}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-4 mb-4 rounded-lg glass"
        style={{ borderLeft: `3px solid ${column.color}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: `${column.color}20`, color: column.color }}
          >
            {column.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wider" style={{ color: column.color }}>
              {column.title}
            </h3>
            <span className="text-xs text-gray-500">{tasks.length} tareas</span>
          </div>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 space-y-3 min-h-[200px] p-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>
    </motion.div>
  )
}

function ChatPanel({
  messages,
  onSend,
}: {
  messages: ChatMessage[]
  onSend: (content: string) => void
}) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  return (
    <div className="glass-strong rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-xl">🌫️</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0c0e]" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-100">Mist</h3>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'flex gap-3',
              msg.sender === 'user' && 'flex-row-reverse'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                msg.sender === 'mist'
                  ? 'bg-gradient-to-br from-cyan-500 to-purple-600'
                  : 'bg-gray-700'
              )}
            >
              <span className="text-sm">{msg.sender === 'mist' ? '🌫️' : '👤'}</span>
            </div>
            <div
              className={cn(
                'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm',
                msg.sender === 'mist'
                  ? 'bg-white/10 text-gray-200 rounded-tl-sm'
                  : 'bg-cyan-500/20 text-cyan-100 rounded-tr-sm border border-cyan-500/30'
              )}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mensaje a Mist..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ActivityPanel({ activities }: { activities: ActivityItem[] }) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'deploy':
        return <Rocket className="w-4 h-4 text-purple-400" />
      case 'commit':
        return <GitCommit className="w-4 h-4 text-cyan-400" />
      case 'update':
        return <Activity className="w-4 h-4 text-green-400" />
      case 'status_change':
        return <Zap className="w-4 h-4 text-yellow-400" />
      case 'create':
        return <Sparkles className="w-4 h-4 text-pink-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="glass-strong rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-sm text-gray-100">Activity Feed</h3>
      </div>

      {/* Activities */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 leading-snug">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function NewTaskModal({
  isOpen,
  onClose,
  onSave,
  initialStatus,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => void
  initialStatus: TaskStatus
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])

  if (!isOpen) return null

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title,
      description,
      status: initialStatus,
      tags,
      progress: 0,
      assignee: 'mist',
    })
    setTitle('')
    setDescription('')
    setTags([])
    onClose()
  }

  const availableTags = ['urgent', 'feature', 'bug', 'research', 'strategy', 'content', 'setup']

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl p-6 w-full max-w-md border border-cyan-500/30 glow-cyan"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Nueva Misión</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre de la misión..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles de la misión..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTags((prev: string[]) =>
                        prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs border transition-all',
                      tags.includes(tag)
                        ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crear Misión
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// --- Main Component ---

export default function MissionControl() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(seedChatMessages)
  const [activities, setActivities] = useState<ActivityItem[]>(seedActivities)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('upcoming')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    const overColumn = COLUMNS.find((c) => c.id === over.id)

    if (!activeTask || !overColumn) return
    if (activeTask.status === overColumn.id) return

    setTasks((prev: Task[]) =>
      prev.map((t: Task) =>
        t.id === active.id ? { ...t, status: overColumn.id } : t
      )
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    const overColumn = COLUMNS.find((c) => c.id === over.id)

    if (activeTask && overColumn && activeTask.status !== overColumn.id) {
      // Add activity log
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'status_change',
        message: `"${activeTask.title}" moved to ${overColumn.title}`,
        timestamp: new Date().toISOString(),
      }
      setActivities((prev) => [newActivity, ...prev])

      // Update task
      setTasks((prev: Task[]) =>
        prev.map((t: Task) =>
          t.id === active.id
            ? {
                ...t,
                status: overColumn.id,
                updatedAt: new Date().toISOString(),
                completedAt: overColumn.id === 'completed' ? new Date().toISOString() : t.completedAt,
                progress: overColumn.id === 'completed' ? 100 : t.progress,
              }
            : t
        )
      )
    }
  }

  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status)
    setIsNewTaskModalOpen(true)
  }

  const handleSaveTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title!,
      description: taskData.description,
      status: taskData.status as TaskStatus,
      progress: taskData.progress || 0,
      assignee: (taskData.assignee as 'mist' | 'user' | 'both') || 'mist',
      tags: taskData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])

    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: 'create',
      message: `New mission created: "${newTask.title}"`,
      timestamp: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, newMessage])

    // Simulate Mist response
    setTimeout(() => {
      const mistResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'mist',
        content: 'Recibido. Procesando tu solicitud...',
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, mistResponse])
    }, 1000)
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  const activeTask = tasks.find((t) => t.id === activeId)

  return (
    <div className="min-h-screen bg-scifi text-gray-100 overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-strong border-b border-white/10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center glow-cyan"
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 opacity-50 blur-lg pulse-glow" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-glow-cyan">
                  THE BRIDGE
                </h1>
                <p className="text-xs text-gray-500 tracking-widest">MISSION CONTROL v4.0</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-medium">SYSTEM ONLINE</span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-gray-200">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1920px] mx-auto px-6 py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Kanban Board - 8 columns */}
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {COLUMNS.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks.filter((t) => t.status === column.id)}
                    onAddTask={handleAddTask}
                  />
                ))}
              </div>
            </div>

            {/* Side Panel - 4 columns */}
            <div className="col-span-12 lg:col-span-4">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                <div className="h-[300px] lg:h-[280px]">
                  <ChatPanel messages={chatMessages} onSend={handleSendMessage} />
                </div>
                <div className="h-[300px] lg:h-[280px]">
                  <ActivityPanel activities={activities} />
                </div>
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialStatus={newTaskStatus}
      />
    </div>
  )
}
