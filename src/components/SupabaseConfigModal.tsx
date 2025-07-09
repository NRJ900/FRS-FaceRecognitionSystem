import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Database, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onConfigSave: (config: { url: string; anonKey: string }) => void;
  onClose?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ 
  isOpen, 
  onConfigSave,
  onClose 
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateAndSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Supabase URL and Anonymous Key.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Supabase URL.",
        variant: "destructive",
      });
      return;
    }

    // Check if URL looks like a Supabase URL
    if (!url.includes('.supabase.co')) {
      toast({
        title: "Invalid Supabase URL",
        description: "URL should be in format: https://your-project.supabase.co",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save configuration
      onConfigSave({ url: url.trim(), anonKey: anonKey.trim() });
      
      toast({
        title: "Configuration Saved",
        description: "Your Supabase configuration has been saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configure Your Supabase Database
          </DialogTitle>
          <DialogDescription>
            To use this face recognition app, you need to connect your own Supabase database.
            This ensures your data stays private and secure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registration Card */}
          <Card className="border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-medium">Don't have a Supabase account?</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a free Supabase account and set up your database in minutes.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Supabase Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Supabase Project URL</Label>
              <Input
                id="supabase-url"
                type="url"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in your Supabase project settings under "API" section
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anon-key">Anonymous Key</Label>
              <Input
                id="anon-key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your public anonymous key (safe to use in frontend)
              </p>
            </div>
          </div>

          {/* Setup Instructions */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Quick Setup Guide
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Create a new Supabase project</li>
                  <li>Go to Settings → API in your dashboard</li>
                  <li>Copy your Project URL and anon/public key</li>
                  <li>Run this SQL in your SQL editor to create the faces table:</li>
                </ol>
                <div className="bg-background rounded p-2 mt-2 font-mono text-xs border">
                  {`CREATE TABLE faces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  descriptor JSONB NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage faces" ON faces
FOR ALL USING (true) WITH CHECK (true);`}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={validateAndSave} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Save Configuration & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};