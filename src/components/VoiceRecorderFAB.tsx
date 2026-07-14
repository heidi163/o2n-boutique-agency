import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function VoiceRecorderFAB() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const queryClient = useQueryClient();

  const createVoiceTask = useMutation({
    mutationFn: (data: { audioBase64: string; mimeType: string }) => api.post('/tasks/voice', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Voice task created successfully!', {
        description: 'The task has been added to your board.',
      });
    },
    onError: () => {
      toast.error('Failed to create voice task', {
        description: 'An error occurred while processing your audio. Please try again.',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result?.toString().split(',')[1];
          if (base64Data) {
            setIsProcessing(true);
            createVoiceTask.mutate({ audioBase64: base64Data, mimeType: mediaRecorder.mimeType });
          }
        };
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone Access Denied', {
          description: 'Please allow Microphone Access in your browser settings to use Voice Tasks.',
        });
      } else {
        toast.error('Microphone Error', {
          description: 'Could not access the microphone. Please check your device.',
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="absolute bottom-10 right-10 z-50 flex items-center justify-center">
      {isRecording && (
        <div className="absolute inset-0 bg-[#E8756A] rounded-full animate-ping opacity-75"></div>
      )}
      
      <button 
        onClick={handleClick}
        disabled={isProcessing}
        className={`relative p-4 pr-6 rounded-full shadow-xl flex items-center gap-4 text-white ring-8 ring-[#154A37]/5 transition-all overflow-hidden
          ${isRecording ? 'bg-[#E8756A] hover:bg-[#D6655B]' : 'bg-[#154A37] hover:bg-[#1E6B50]'}
          ${isProcessing ? 'opacity-80 cursor-not-allowed bg-[#1E6B50]' : 'cursor-pointer'}
        `}
      >
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-4 h-4 text-white fill-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </div>
        <span className="text-sm font-medium w-28 text-left flex items-center">
          {isProcessing ? 'Processing...' : isRecording ? (
            <span className="flex items-center gap-2">
              Listening
              <div className="flex items-center gap-[3px] h-3 ml-1">
                <div className="w-1 bg-white/80 rounded-full animate-[bounce_0.8s_infinite_100ms] h-full" />
                <div className="w-1 bg-white/80 rounded-full animate-[bounce_0.8s_infinite_300ms] h-2" />
                <div className="w-1 bg-white/80 rounded-full animate-[bounce_0.8s_infinite_200ms] h-full" />
                <div className="w-1 bg-white/80 rounded-full animate-[bounce_0.8s_infinite_400ms] h-1.5" />
              </div>
            </span>
          ) : 'Voice Task'}
        </span>
      </button>
    </div>
  );
}
