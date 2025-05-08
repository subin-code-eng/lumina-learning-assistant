
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Save, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const VoiceToTextNotes: React.FC = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('New Voice Note');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [tempTranscript, setTempTranscript] = useState('');
  const processingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotes, setSavedNotes] = useState<VoiceNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // Load user's notes from Supabase
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);
  
  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setSavedNotes(data);
        
        // Load the most recent note if available
        if (data.length > 0 && !activeNoteId) {
          setActiveNoteId(data[0].id);
          setTitle(data[0].title);
          setNotes(data[0].content);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };
  
  useEffect(() => {
    // Initialize speech recognition if browser supports it
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        // Only process if we're not already processing a result
        if (processingRef.current) return;
        
        processingRef.current = true;
        
        let transcript = '';
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          transcript = result[0].transcript;
          
          // If this is a final result, append to final transcript
          if (result.isFinal) {
            finalTranscript += ' ' + transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the notes with final transcript
        if (finalTranscript) {
          setNotes((prev) => prev + finalTranscript);
          setTempTranscript('');
        } else {
          // Show interim results in temp transcript
          setTempTranscript(interimTranscript);
        }
        
        processingRef.current = false;
      };
      
      recognitionInstance.onend = () => {
        // If we're still supposed to be recording but recognition ended, restart it
        if (isRecording) {
          try {
            recognitionInstance.start();
          } catch (error) {
            console.error('Error restarting recording:', error);
            setIsRecording(false);
          }
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
        toast("Error recording", {
          description: "There was an issue with the voice recognition"
        });
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    }
    
    // Cleanup function
    return () => {
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      toast("Not supported", {
        description: "Voice recognition is not supported in your browser"
      });
      return;
    }
    
    if (isRecording) {
      try {
        recognition.stop();
        setIsRecording(false);
        setTempTranscript('');
        processingRef.current = false;
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      try {
        // Clear any previous state
        processingRef.current = false;
        setTempTranscript('');
        
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const saveNotes = async () => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please login to save notes"
      });
      return;
    }
    
    if (!title.trim() || !notes.trim()) {
      toast.error("Title and content required", {
        description: "Please add a title and some content to your note"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (activeNoteId) {
        // Update existing note
        const { error } = await supabase
          .from('voice_notes')
          .update({
            title,
            content: notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeNoteId);
        
        if (error) throw error;
        
        toast.success("Note updated", {
          description: "Your voice note has been saved successfully"
        });
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('voice_notes')
          .insert({
            title,
            content: notes,
            user_id: user.id
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActiveNoteId(data[0].id);
        }
        
        toast.success("Note saved", {
          description: "Your voice note has been saved successfully"
        });
      }
      
      // Refresh the notes list
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Error saving note", {
        description: "Please try again later"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const createNewNote = () => {
    setActiveNoteId(null);
    setTitle('New Voice Note');
    setNotes('');
  };
  
  const loadNote = (note: VoiceNote) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setNotes(note.content);
  };

  const deleteNote = async () => {
    if (!activeNoteId) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const { error } = await supabase
          .from('voice_notes')
          .delete()
          .eq('id', activeNoteId);
        
        if (error) throw error;
        
        toast.success("Note deleted", {
          description: "Your voice note has been deleted"
        });
        
        // Refresh the notes list and reset the form
        fetchNotes();
        createNewNote();
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error("Error deleting note", {
          description: "Please try again later"
        });
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex justify-between items-center">
          <span>Voice Notes</span>
          <Button variant="outline" size="sm" onClick={createNewNote}>
            New Note
          </Button>
        </CardTitle>
        <CardDescription>
          Record voice notes that will be converted to text automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="font-medium"
          />
          
          <Textarea 
            value={notes + (tempTranscript ? ' ' + tempTranscript : '')}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Your voice notes will appear here..."
            className="min-h-[200px]"
          />
        </div>
        
        {savedNotes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Saved Notes</h3>
            <div className="max-h-[150px] overflow-y-auto space-y-2">
              {savedNotes.map((note) => (
                <div 
                  key={note.id}
                  className={`p-2 rounded-md cursor-pointer ${
                    activeNoteId === note.id ? 'bg-primary/10' : 'bg-muted hover:bg-muted/70'
                  }`}
                  onClick={() => loadNote(note)}
                >
                  <div className="font-medium">{note.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{note.content.substring(0, 100)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center">
          {isRecording && (
            <div className="animate-pulse mr-2 flex items-center">
              <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
              <span className="text-sm text-red-500">Recording...</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant={isRecording ? "destructive" : "outline"} 
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          
          {activeNoteId && (
            <Button variant="outline" onClick={deleteNote}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
        
        <Button onClick={saveNotes} disabled={!title.trim() || !notes.trim() || isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoiceToTextNotes;
