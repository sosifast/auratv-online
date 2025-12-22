-- =============================================
-- ADD name_server column to streaming_playlist
-- =============================================

-- Add name_server column
ALTER TABLE streaming_playlist 
ADD COLUMN name_server VARCHAR(100);

-- Add comment
COMMENT ON COLUMN streaming_playlist.name_server IS 'Server name/label for streaming source (e.g., "Server 1", "Cloudflare CDN", "Google Drive")';

-- Optional: Set default value for existing rows
UPDATE streaming_playlist 
SET name_server = CONCAT('Server ', type_streaming) 
WHERE name_server IS NULL;

-- Verify
SELECT id, id_streaming, name_server, type_streaming, status 
FROM streaming_playlist 
LIMIT 10;
