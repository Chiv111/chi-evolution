export type TaskStatus = 'in-progress' | 'upcoming' | 'completed' | 'blocked'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  progress: number
  assignee: 'mist' | 'user' | 'both'
  tags: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ChatMessage {
  id: string
  sender: 'mist' | 'user'
  content: string
  timestamp: string
}

export interface ActivityItem {
  id: string
  type: 'deploy' | 'commit' | 'update' | 'status_change' | 'create'
  message: string
  timestamp: string
  metadata?: Record<string, any>
}
