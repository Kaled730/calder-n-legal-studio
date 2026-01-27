-- Create a table to track rate limits for contact form submissions
CREATE TABLE public.contact_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for efficient IP lookups
CREATE INDEX idx_contact_rate_limits_ip_created ON public.contact_rate_limits (ip_address, created_at);

-- Enable RLS (we'll use service role key in edge function to bypass)
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access policies - only accessible via service role in edge function
-- This prevents any client-side manipulation of rate limit records

-- Create a function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.contact_rate_limits 
  WHERE created_at < now() - INTERVAL '1 hour';
END;
$$;