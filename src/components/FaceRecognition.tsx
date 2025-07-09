import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseConfig';
import { toast } from '@/hooks/use-toast';

interface Face {
  id: string;
  name: string;
  descriptor: number[];
  created_at: string;
  image_url: string | null;
  updated_at: string;
}

export const FaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedFaces, setRecognizedFaces] = useState<string[]>([]);
  const [registeredFaces, setRegisteredFaces] = useState<Face[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
    loadRegisteredFaces();
  }, []);

  const loadRegisteredFaces = async () => {
    try {
      const { data, error } = await supabase
        .from('faces')
        .select('*');

      if (error) throw error;

      const formattedFaces = (data || []).map(face => ({
        ...face,
        descriptor: Array.isArray(face.descriptor) ? 
          face.descriptor.map(num => typeof num === 'number' ? num : 0) : []
      }));
      
      setRegisteredFaces(formattedFaces);
    } catch (error) {
      console.error('Error loading registered faces:', error);
    }
  };

  const startRecognition = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsRecognizing(true);
      startFaceDetection();
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast({
        title: "Webcam Error",
        description: "Could not access webcam. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecognition = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRecognizing(false);
    setRecognizedFaces([]);
  };

  const startFaceDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || registeredFaces.length === 0) {
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length === 0) {
          setRecognizedFaces([]);
          return;
        }

        // Create labeled face descriptors for comparison
        const labeledDescriptors = registeredFaces.map(face => 
          new faceapi.LabeledFaceDescriptors(
            face.name,
            [new Float32Array(face.descriptor)]
          )
        );

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        
        const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
        const recognizedNames = results
          .filter(result => result.label !== 'unknown')
          .map(result => result.label);

        setRecognizedFaces(recognizedNames);

        // Draw bounding boxes
        const canvas = canvasRef.current;
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const context = canvas.getContext('2d');
        
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          resizedDetections.forEach((detection, i) => {
            const box = detection.detection.box;
            const label = results[i].label !== 'unknown' ? results[i].label : 'Unknown';
            
            // Draw bounding box
            context.strokeStyle = results[i].label !== 'unknown' ? '#10b981' : '#ef4444';
            context.lineWidth = 2;
            context.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw label
            context.fillStyle = results[i].label !== 'unknown' ? '#10b981' : '#ef4444';
            context.font = '16px Arial';
            context.fillText(label, box.x, box.y - 10);
          });
        }
      } catch (error) {
        console.error('Error in face detection:', error);
      }
    }, 100);
  };

  useEffect(() => {
    if (isRecognizing && registeredFaces.length > 0) {
      startFaceDetection();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecognizing, registeredFaces]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Face Recognition</CardTitle>
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
          <p className="text-sm font-medium">Recognized Faces:</p>
          <div className="flex flex-wrap gap-1">
            {recognizedFaces.length > 0 ? (
              recognizedFaces.map((name, index) => (
                <Badge key={index} variant="default">
                  {name}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No faces recognized</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isRecognizing ? (
            <Button 
              onClick={startRecognition} 
              disabled={!isModelLoaded || registeredFaces.length === 0}
              className="flex-1"
            >
              Start Recognition
            </Button>
          ) : (
            <Button 
              onClick={stopRecognition}
              variant="outline"
              className="flex-1"
            >
              Stop Recognition
            </Button>
          )}
          
          <Button 
            onClick={loadRegisteredFaces}
            variant="outline"
            className="flex-1"
          >
            Refresh Faces
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Registered faces: {registeredFaces.length}</p>
          {!isModelLoaded && <p>Loading face detection models...</p>}
          {registeredFaces.length === 0 && (
            <p>Register some faces first to enable recognition.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};