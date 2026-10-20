import { clean } from './db'
import { supabase } from './supabase'

/** A multiple-choice question; answer = index of the right choice. */
export type QuizItem = { q: string; choices: string[]; answer: number; explain?: string }

/**
 * One section of the team briefing (?briefing), a row of public.briefing.
 * kind 'booth' also lists the numbered items of a design (room) with their info cards.
 */
export type BriefingSection = {
  id: string
  pos: number
  kind: 'text' | 'booth'
  title: string
  /** Simple markdown: ### headings, - lists, | tables |, > callouts, **bold**, [links](https://…). */
  body: string
  images: string[]
  quiz: QuizItem[]
  /** Booth section: the design to list; null = the latest ADIPEC design. */
  room: string | null
  updated_by?: string | null
  updated_at?: string
}

export type SectionPatch = Partial<Pick<BriefingSection, 'title' | 'body' | 'images' | 'quiz' | 'room' | 'pos'>>

/** Folder for briefing images in the "images" bucket (must look like a room id for the upload policy). */
export const BRIEFING_IMAGES = 'team-briefing-images'

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

const briefingError = (raw: string, msg = clean(raw)) =>
  /relation .*briefing.* does not exist|could not find the table|schema cache/i.test(msg)
    ? 'The briefing is not set up. Run supabase/schema.sql in the Supabase SQL Editor.'
    : msg

/** Accept a row from the database, filling anything missing. */
export function parseSection(r: Partial<BriefingSection> & { id: string }): BriefingSection {
  return {
    id: r.id,
    pos: r.pos ?? 0,
    kind: r.kind === 'booth' ? 'booth' : 'text',
    title: r.title ?? '',
    body: r.body ?? '',
    images: Array.isArray(r.images) ? r.images : [],
    quiz: Array.isArray(r.quiz) ? r.quiz.filter((q) => q && typeof q.q === 'string' && Array.isArray(q.choices)) : [],
    room: r.room ?? null,
    updated_by: r.updated_by ?? null,
    updated_at: r.updated_at,
  }
}

export const sortSections = (list: BriefingSection[]) => [...list].sort((a, b) => a.pos - b.pos || a.id.localeCompare(b.id))

export async function fetchBriefing(): Promise<BriefingSection[]> {
  const { data, error } = await db().from('briefing').select('*')
  if (error) throw new Error(briefingError(error.message))
  return sortSections((data as BriefingSection[]).map(parseSection))
}

/** Fill an empty briefing with the default sections. Existing rows are left alone. */
export async function seedBriefing(sections: BriefingSection[], by: string) {
  const rows = sections.map(({ updated_at: _u, ...s }) => ({ ...s, updated_by: by }))
  const { error } = await db().from('briefing').upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
  if (error) throw new Error(briefingError(error.message))
}

export async function insertSection(s: BriefingSection, by: string) {
  const { updated_at: _u, ...row } = s
  const { error } = await db().from('briefing').insert({ ...row, updated_by: by })
  if (error) throw new Error(briefingError(error.message))
}

export async function updateSection(id: string, patch: SectionPatch, by: string) {
  const { error } = await db().from('briefing').update({ ...patch, updated_by: by }).eq('id', id)
  if (error) throw new Error(briefingError(error.message))
}

export async function deleteSection(id: string) {
  const { error } = await db().from('briefing').delete().eq('id', id)
  if (error) throw new Error(briefingError(error.message))
}

/** Live changes by others: a changed / new row, or a deleted id. Returns the unsubscribe function. */
export function subscribeBriefing(onRow: (s: BriefingSection) => void, onDelete: (id: string) => void): () => void {
  const client = db()
  const ch = client
    .channel('briefing')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'briefing' }, (p) => {
      if (p.eventType === 'DELETE') {
        const id = (p.old as { id?: string }).id
        if (id) onDelete(id)
      } else onRow(parseSection(p.new as BriefingSection))
    })
    .subscribe()
  return () => {
    client.removeChannel(ch)
  }
}

// ─── Quiz answers: private, kept only in this browser ─────────────────────────────────────────

const QUIZ_KEY = 'ndt-adipec.quiz'

/** Stable key of a question (survives reordering; changes when the question is reworded). */
export const quizKey = (sectionId: string, q: QuizItem) => `${sectionId}:${q.q.trim()}`

export function loadQuizAnswers(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(QUIZ_KEY) ?? '{}')
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

export function saveQuizAnswers(a: Record<string, number>) {
  try {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(a))
  } catch {
    // storage blocked (private mode) — answers just won't be remembered
  }
}
