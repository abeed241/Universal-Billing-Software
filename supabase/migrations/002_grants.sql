-- Fix: grant table access to Supabase API roles (required after creating tables in SQL editor)

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON stores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON store_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bills TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bill_items TO authenticated;

GRANT EXECUTE ON FUNCTION is_store_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_store_ids() TO authenticated;

-- Default privileges for any future tables in this project
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO authenticated;
