import { createClient } from '@supabase/supabase-js'
import { Task, ChatMessage, ActivityItem } from '@/app/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client only if credentials are available
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Seed data for initial state
export const seedTasks: Task[] = [
  {
    id: '1',
    title: 'Agents HQ v4.0 Redesign',
    description: 'Complete redesign of the mission control interface with sci-fi aesthetics',
    status: 'in-progress',
    progress: 80,
    assignee: 'mist',
    tags: ['feature', 'urgent'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Sero AI Pricing Strategy',
    description: 'Define pricing tiers and packages for Sero AI services',
    status: 'in-progress',
    progress: 100,
    assignee: 'mist',
    tags: ['strategy', 'completed'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Video Anthropic vs OpenAI',
    description: 'Research and script comparison video between AI models',
    status: 'upcoming',
    progress: 0,
    assignee: 'mist',
    tags: ['content', 'research'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Beta Testers Google Forms',
    description: 'Create and configure recruitment form for beta testers',
    status: 'upcoming',
    progress: 0,
    assignee: 'mist',
    tags: ['setup', 'marketing'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Health: Ear cleaning appointment',
    description: 'Personal health appointment scheduling',
    status: 'upcoming',
    progress: 0,
    assignee: 'user',
    tags: ['health', 'personal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Cardjutsu Battle System',
    description: 'Complete card battle game mechanics and UI',
    status: 'completed',
    progress: 100,
    assignee: 'mist',
    tags: ['feature', 'game'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: '7',
    title: 'Chi Voice System Setup',
    description: 'Configure and deploy voice interaction system',
    status: 'completed',
    progress: 100,
    assignee: 'mist',
    tags: ['feature', 'voice'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Sero AI Notion Packages',
    description: 'Define and document service packages in Notion',
    status: 'completed',
    progress: 100,
    assignee: 'mist',
    tags: ['documentation', 'completed'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
]

export const seedChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'mist',
    content: 'Working on the v4.0 redesign. The kanban board is coming together nicely!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    sender: 'mist',
    content: 'All systems operational. Ready for your next command.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
]

export const seedActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'deploy',
    message: 'Mission Control v4.0 deployed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '2',
    type: 'commit',
    message: 'Updated kanban board with drag & drop',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    type: 'update',
    message: 'Sero AI Pricing Strategy marked complete',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
]
