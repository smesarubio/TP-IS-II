-- Add renewal_url and document_title to notifications for quick access
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS renewal_url TEXT,
ADD COLUMN IF NOT EXISTS document_title TEXT,
ADD COLUMN IF NOT EXISTS document_expiration_date DATE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
