-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streaming_id UUID NOT NULL REFERENCES streaming(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, streaming_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_streaming_id_idx ON favorites(streaming_id);
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON favorites(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);
