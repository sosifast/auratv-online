import { createClient } from '@/lib/supabase/client';
import type { Category, CategoryInsert, CategoryUpdate } from '@/lib/types/database';
import { generateSlug, makeUniqueSlug } from '@/lib/utils/slug';

const supabase = createClient();

export const categoryService = {
    // Get all categories
    async getAll() {
        const { data, error } = await supabase
            .from('category')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Category[];
    },

    // Get category by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('category')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Category;
    },

    // Create category
    async create(category: CategoryInsert) {
        // Auto-generate slug from name if not provided
        let slug = category.slug || generateSlug(category.name);

        // Check if slug already exists
        const { data: existing } = await supabase
            .from('category')
            .select('slug')
            .eq('slug', slug);

        // Make slug unique if needed
        if (existing && existing.length > 0) {
            const existingSlugs = existing.map((item: { slug: string }) => item.slug);
            slug = makeUniqueSlug(slug, existingSlugs);
        }

        // Insert with generated slug
        const { data, error } = await supabase
            .from('category')
            .insert({ ...category, slug })
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    // Update category
    async update(id: string, category: CategoryUpdate) {
        const { data, error } = await supabase
            .from('category')
            .update(category)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    // Delete category
    async delete(id: string) {
        const { error } = await supabase
            .from('category')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },
};
