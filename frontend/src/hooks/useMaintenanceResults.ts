import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type MaintenanceResult = {
  name: string;
  type: string;
  rating: string;
  email_draft?: string;
};

export function useMaintenanceResults() {
  return useQuery({
    queryKey: ['maintenance-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_search_results')
        .select('name, rating, type')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        throw error;
      }

      return data as MaintenanceResult[];
    }
  });
} 