import { createClient } from '@/lib/supabase/client';
import type { User, UserInsert, UserUpdate } from '@/lib/types/database';

const supabase = createClient();

export const userService = {
    // Get all users
    async getAll() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as User[];
    },

    // Get user by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as User;
    },

    // Create user
    async create(user: UserInsert) {
        const { data, error } = await supabase
            .from('users')
            .insert(user)
            .select()
            .single();

        if (error) throw error;
        return data as User;
    },

    // Update user
    async update(id: string, user: UserUpdate) {
        const { data, error } = await supabase
            .from('users')
            .update(user)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as User;
    },

    // Delete user
    async delete(id: string) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },
};
