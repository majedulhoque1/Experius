import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSettings() {
  const qc = useQueryClient()

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      if (!supabase) return {}
      const { data, error } = await supabase.from('site_settings').select('key,value')
      if (error) throw error
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>
    },
  })

  const update = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!supabase) return
      const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site_settings'] }),
  })

  return { settings, isLoading, update: update.mutateAsync }
}
