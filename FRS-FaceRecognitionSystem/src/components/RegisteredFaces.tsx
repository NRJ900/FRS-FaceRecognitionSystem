import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseConfig';
import { toast } from '@/hooks/use-toast';

interface Face {
  id: string;
  name: string;
  created_at: string;
}

interface RegisteredFacesProps {
  refreshTrigger?: number;
}

export const RegisteredFaces: React.FC<RegisteredFacesProps> = ({ refreshTrigger }) => {
  const [faces, setFaces] = useState<Face[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faces')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFaces(data || []);
    } catch (error) {
      console.error('Error loading faces:', error);
      toast({
        title: "Error loading faces",
        description: "Could not load registered faces.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFace = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('faces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Face deleted",
        description: `${name}'s face has been removed.`,
      });

      loadFaces();
    } catch (error) {
      console.error('Error deleting face:', error);
      toast({
        title: "Error deleting face",
        description: "Could not delete the face. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFaces();
  }, [refreshTrigger]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registered Faces ({faces.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading faces...</p>
        ) : faces.length === 0 ? (
          <p className="text-sm text-muted-foreground">No faces registered yet.</p>
        ) : (
          faces.map((face) => (
            <div key={face.id} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex flex-col">
                <span className="font-medium">{face.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(face.created_at).toLocaleDateString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteFace(face.id, face.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        
        <Button 
          onClick={loadFaces} 
          variant="outline" 
          className="w-full mt-4"
        >
          Refresh List
        </Button>
      </CardContent>
    </Card>
  );
};