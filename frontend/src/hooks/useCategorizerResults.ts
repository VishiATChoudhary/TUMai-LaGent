import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CategorizerResult } from '@/lib/supabase';

export function useCategorizerResults() {
  return useQuery({
    queryKey: ['categorizer-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorizer_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as CategorizerResult[];
    }
  });
} 