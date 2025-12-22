import { createClient } from '@/lib/supabase/client';
import type { Settings, SettingsUpdate } from '@/lib/types/database';

const supabase = createClient();

export const settingsService = {
    // Get settings (first row)
    async get() {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single();

        if (error) throw error;
        return data as Settings;
    },

    // Update settings
    async update(id: string, settings: SettingsUpdate) {
        const { data, error } = await supabase
            .from('settings')
            .update(settings)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Settings;
    },
};
