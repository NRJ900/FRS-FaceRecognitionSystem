-- Create table for storing registered faces
CREATE TABLE public.faces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  descriptor JSONB NOT NULL, -- Face descriptor for recognition
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faces ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
CREATE POLICY "Anyone can view faces" 
ON public.faces 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create faces" 
ON public.faces 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update faces" 
ON public.faces 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete faces" 
ON public.faces 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faces_updated_at
BEFORE UPDATE ON public.faces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();