import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseConfig';
import { toast } from '@/hooks/use-toast';

interface WebcamCaptureProps {
  onFaceRegistered?: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onFaceRegistered }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [name, setName] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setIsModelLoaded(true);
        toast({
          title: "Models loaded",
          description: "Face detection models are ready!",
        });
      } catch (error) {
        console.error('Error loading models:', error);
        toast({
          title: "Error loading models",
          description: "Please check if model files are available.",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, []);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Webcam Error",
        description: "Could not access webcam. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a name and ensure webcam is active.",
        variant: "destructive",
      });
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast({
          title: "No face detected",
          description: "Please ensure your face is clearly visible in the camera.",
          variant: "destructive",
        });
        return;
      }

      // Save face descriptor to database
      const { error } = await supabase
        .from('faces')
        .insert({
          name: name.trim(),
          descriptor: Array.from(detection.descriptor)
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Face registered successfully",
        description: `Face for ${name} has been saved!`,
      });

      setName('');
      onFaceRegistered?.();
    } catch (error) {
      console.error('Error capturing face:', error);
      toast({
        title: "Registration failed",
        description: "Could not register face. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register New Face</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-[50vh] min-h-[300px] max-h-[600px] bg-muted rounded-md object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-[50vh] min-h-[300px] max-h-[600px]"
          />
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter person's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {!isCapturing ? (
            <Button 
              onClick={startWebcam} 
              disabled={!isModelLoaded}
              className="flex-1"
            >
              Start Camera
            </Button>
          ) : (
            <Button 
              onClick={stopWebcam}
              variant="outline"
              className="flex-1"
            >
              Stop Camera
            </Button>
          )}
          
          <Button 
            onClick={captureFace}
            disabled={!isCapturing || !name.trim() || !isModelLoaded}
            className="flex-1"
          >
            Register Face
          </Button>
        </div>

        {!isModelLoaded && (
          <p className="text-sm text-muted-foreground">
            Loading face detection models...
          </p>
        )}
      </CardContent>
    </Card>
  );
};