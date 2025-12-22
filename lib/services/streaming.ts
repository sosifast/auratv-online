import { createClient } from '@/lib/supabase/client';
import type { Streaming, StreamingInsert, StreamingUpdate } from '@/lib/types/database';

const supabase = createClient();

export const streamingService = {
    // Get all streaming with category
    async getAll() {
        const { data, error } = await supabase
            .from('streaming')
            .select(`*, category:id_category(id, name, slug)`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get streaming by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('streaming')
            .select(`*, category:id_category(id, name, slug)`)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create streaming
    async create(streaming: StreamingInsert) {
        const { data, error } = await supabase
            .from('streaming')
            .insert(streaming)
            .select()
            .single();

        if (error) throw error;
        return data as Streaming;
    },

    // Update streaming
    async update(id: string, streaming: StreamingUpdate) {
        const { data, error } = await supabase
            .from('streaming')
            .update(streaming)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Streaming;
    },

    // Delete streaming
    async delete(id: string) {
        const { error } = await supabase
            .from('streaming')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Increment view count
    async incrementView(id: string) {
        const { error } = await supabase.rpc('increment_view_count', { streaming_id: id });
        if (error) throw error;
        return true;
    },
};
