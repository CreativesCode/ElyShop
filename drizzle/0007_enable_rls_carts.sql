-- Enable RLS on carts table
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cart items
CREATE POLICY "Users can view own cart items" ON carts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own cart items  
CREATE POLICY "Users can insert own cart items" ON carts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON carts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON carts
  FOR DELETE
  USING (auth.uid() = user_id);

