-- Create the leaderboard table with composite primary key
CREATE TABLE public.leaderboard (
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  game_duration INTEGER NOT NULL,
  room_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (room_id, wallet_address, player_id)
);

-- Add index for better query performance
CREATE INDEX idx_leaderboard_room_id ON public.leaderboard(room_id);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score);
CREATE INDEX idx_leaderboard_created_at ON public.leaderboard(created_at);
CREATE INDEX idx_leaderboard_wallet_address ON public.leaderboard(wallet_address);

-- Create a function to handle updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) for security
ALTER TABLE public.leaderboard DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.leaderboard;
DROP POLICY IF EXISTS "Allow insert for any authenticated user" ON public.leaderboard;

-- Create new policies
-- Allow public read access to leaderboard
CREATE POLICY "Allow public read access" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- Allow any authenticated user to insert or update records
CREATE POLICY "Allow upsert for any authenticated user"
ON public.leaderboard
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
