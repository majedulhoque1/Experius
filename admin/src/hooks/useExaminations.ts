import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Mirrors LeakMap in lib/examination/schema.ts — the visitor's copy. */
export interface LeakMap {
  headline: string
  summary: string
  trace: { step: string; seam: string | null }[]
  costliest: { step: string; why: string }
  arithmetic: { label: string; formula: string; note: string }[]
  indicated: { module: string; because: string }[]
  unknowns: string[]
}

/** Mirrors LeadBrief in lib/examination/schema.ts — internal, never shown to them. */
export interface LeadBrief {
  summary: string
  likelySegment: string
  severity: 'mild' | 'moderate' | 'serious' | 'critical'
  signals: string[]
  redFlags: string[]
  openingQuestion: string
}

export interface Examination {
  id: string
  created_at: string
  name: string | null
  email: string | null
  marked_ids: string[]
  marked_count: number
  follow_ups: { question: string; answer: string }[] | null
  other_pain: string | null
  indicated: string[]
  severity: 'mild' | 'moderate' | 'serious' | 'critical'
  referrer: string | null
  utm: string | null
  handled_at: string | null
  /** Null on rows written before migration 0004, so every read site must guard. */
  map: LeakMap | null
  brief: LeadBrief | null
}

const COLUMNS =
  'id,created_at,name,email,marked_ids,marked_count,follow_ups,other_pain,indicated,severity,referrer,utm,handled_at,map,brief'

/**
 * One lead, fetched by id rather than picked out of the list — so the detail
 * page survives a refresh, a bookmark, and being opened in its own tab during
 * a call, none of which a modal over the table could do.
 */
export function useExamination(id: string | undefined) {
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['examination', id],
    enabled: !!id,
    queryFn: async () => {
      if (!supabase || !id) return null
      const { data, error } = await supabase.from('examinations').select(COLUMNS).eq('id', id).maybeSingle()
      if (error) throw error
      return (data ?? null) as Examination | null
    },
    // Seed from the list when it is already cached, so arriving from the table
    // paints immediately and then reconciles.
    initialData: () =>
      qc.getQueryData<Examination[]>(['examinations'])?.find((e) => e.id === id),
  })

  return { examination: data ?? null, isLoading, error: error as Error | null }
}

export function useExaminations() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['examinations'] })

  const { data: examinations = [], isLoading } = useQuery({
    queryKey: ['examinations'],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('examinations')
        .select(COLUMNS)
        .eq('generated', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Examination[]
    },
  })

  const markHandled = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) return
      const { error } = await supabase
        .from('examinations')
        .update({ handled_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: inv,
  })

  const convertToContact = useMutation({
    mutationFn: async (e: Examination) => {
      if (!supabase) return
      const { error } = await supabase.from('contacts').insert({
        name: e.name,
        phone: null,
        email: e.email,
        details: { source: 'examination', examination_id: e.id, marked_count: e.marked_count, severity: e.severity },
        notes: e.other_pain,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })

  return {
    examinations,
    isLoading,
    markHandled: markHandled.mutateAsync,
    convertToContact: convertToContact.mutateAsync,
  }
}
