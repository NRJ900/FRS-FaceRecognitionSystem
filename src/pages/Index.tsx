import React, { useState, useEffect } from 'react';
import { WebcamCapture } from '@/components/WebcamCapture';
import { FaceRecognition } from '@/components/FaceRecognition';
import { RegisteredFaces } from '@/components/RegisteredFaces';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { hasSupabaseConfig, saveSupabaseConfig, type SupabaseConfig } from '@/lib/supabaseConfig';

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if Supabase is already configured
    const configured = hasSupabaseConfig();
    setIsConfigured(configured);
    setShowConfigModal(!configured);
  }, []);

  const handleFaceRegistered = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleConfigSave = (config: SupabaseConfig) => {
    saveSupabaseConfig(config);
    setIsConfigured(true);
    setShowConfigModal(false);
    // Reload the page to reinitialize Supabase client with new config
    window.location.reload();
  };

  if (!isConfigured) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <h1
              className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent animate-float"
              style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              }}
            >
              F R S
            
            <h3 className="text-4xl font-bold mb-4">Real-time Face Recognition</h3>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Configure your Supabase database to get started
            </p>
          </div>
        </div>
        <SupabaseConfigModal 
          isOpen={showConfigModal} 
          onConfigSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-0 right-0"
            onClick={() => setShowConfigModal(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Database Settings
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">Real-time Face Recognition</h1>
          <p className="text-xl text-muted-foreground">
            Register faces and perform real-time recognition using your webcam
          </p>
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register">Register Face</TabsTrigger>
            <TabsTrigger value="recognize">Recognize Faces</TabsTrigger>
            <TabsTrigger value="manage">Manage Faces</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 flex justify-center">
            <TabsContent value="register" className="mt-0">
              <WebcamCapture onFaceRegistered={handleFaceRegistered} />
            </TabsContent>
            
            <TabsContent value="recognize" className="mt-0">
              <FaceRecognition />
            </TabsContent>
            
            <TabsContent value="manage" className="mt-0">
              <RegisteredFaces refreshTrigger={refreshTrigger} />
            </TabsContent>
          </div>
        </Tabs>

        
        <SupabaseConfigModal 
          isOpen={showConfigModal} 
          onConfigSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      </div>
    </div>
  );
};

export default Index;
