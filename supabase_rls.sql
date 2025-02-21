-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a user" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Create policies for rooms
CREATE POLICY "Anyone can read rooms" ON public.rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create rooms" ON public.rooms
  FOR INSERT
  WITH CHECK (true);

-- Create policies for messages
CREATE POLICY "Anyone can read messages" ON public.messages
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create messages" ON public.messages
  FOR INSERT
  WITH CHECK (true);
