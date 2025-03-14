-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own profile
CREATE POLICY "Users can view only their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow users to update only their own profile
CREATE POLICY "Users can update only their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create service_tokens table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS service_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  service TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, service)
);

-- Enable Row Level Security
ALTER TABLE service_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own tokens
CREATE POLICY "Users can view only their own tokens" 
  ON service_tokens FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to update only their own tokens
CREATE POLICY "Users can update only their own tokens" 
  ON service_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert only their own tokens
CREATE POLICY "Users can insert only their own tokens" 
  ON service_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete only their own tokens
CREATE POLICY "Users can delete only their own tokens" 
  ON service_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own chats
CREATE POLICY "Users can view only their own chats" 
  ON chats FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert only their own chats
CREATE POLICY "Users can insert only their own chats" 
  ON chats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own chats
CREATE POLICY "Users can update only their own chats" 
  ON chats FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own chats
CREATE POLICY "Users can delete only their own chats" 
  ON chats FOR DELETE 
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only messages in their own chats
CREATE POLICY "Users can view only messages in their own chats" 
  ON messages FOR SELECT 
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow users to insert only messages in their own chats
CREATE POLICY "Users can insert only messages in their own chats" 
  ON messages FOR INSERT 
  WITH CHECK (
    chat_id IN (
      SELECT id FROM chats WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow users to update only messages in their own chats
CREATE POLICY "Users can update only messages in their own chats" 
  ON messages FOR UPDATE 
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow users to delete only messages in their own chats
CREATE POLICY "Users can delete only messages in their own chats" 
  ON messages FOR DELETE 
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE user_id = auth.uid()
    )
  );

-- Create function to create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function after a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_service_tokens_user_id ON service_tokens(user_id);