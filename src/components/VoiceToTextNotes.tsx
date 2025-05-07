
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const VoiceToTextNotes: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition if browser supports it
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNotes((prev) => prev + ' ' + transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
        toast("Error recording", {
          description: "There was an issue with the voice recognition"
        });
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      toast("Not supported", {
        description: "Voice recognition is not supported in your browser"
      });
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const saveNotes = () => {
    if (notes.trim()) {
      toast("Notes saved", {
        description: "Your voice notes have been saved successfully"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Voice Notes</CardTitle>
        <CardDescription>
          Record voice notes that will be converted to text automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Your voice notes will appear here..."
          className="min-h-[200px]"
        />
        
        <div className="mt-4 flex items-center">
          {isRecording && (
            <div className="animate-pulse mr-2 flex items-center">
              <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
              <span className="text-sm text-red-500">Recording...</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant={isRecording ? "destructive" : "outline"} 
          onClick={toggleRecording}
        >
          {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        
        <Button onClick={saveNotes} disabled={!notes.trim()}>
          <Save className="mr-2 h-4 w-4" />
          Save Notes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoiceToTextNotes;
