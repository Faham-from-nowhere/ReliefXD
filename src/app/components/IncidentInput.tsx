import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';
import { AIAnalysisResult } from '../types/incident';
import { motion } from 'motion/react';

interface IncidentInputProps {
  onAnalyze: (description: string) => void;
  isAnalyzing: boolean;
  locationStatus?: 'detecting' | 'detected' | 'denied' | 'unavailable';
  userLocation?: { lat: number; lng: number } | null;
}

export function IncidentInput({ onAnalyze, isAnalyzing, locationStatus = 'detecting', userLocation }: IncidentInputProps) {
  const [description, setDescription] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDescription(text);
    setCharCount(text.length);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setDescription(transcript);
    setCharCount(transcript.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && !isAnalyzing) {
      onAnalyze(description);
    }
  };

  const getLocationBadge = () => {
    switch (locationStatus) {
      case 'detected':
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
              <span>📍</span>
              <span>Location: Detected</span>
            </div>
            {userLocation && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                <span className="font-mono text-slate-300">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
              </div>
            )}
          </div>
        );
      case 'detecting':
        return (
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
            <span>📍</span>
            <span>Detecting...</span>
          </div>
        );
      case 'denied':
        return (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
            <span>📍</span>
            <span>Location: Manual</span>
          </div>
        );
      case 'unavailable':
        return (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-500/10 px-2 py-1 rounded border border-slate-500/20">
            <span>📍</span>
            <span>Location: Unavailable</span>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="incident-description" className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Incident Description
          </label>
          {getLocationBadge()}
        </div>
        <Textarea
          id="incident-description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Describe the emergency situation here..."
          className="min-h-[200px] bg-slate-800/50 border-slate-700 focus:border-blue-500 text-slate-100 placeholder:text-slate-500 resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
          disabled={isAnalyzing}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400 tabular-nums">
            {charCount} characters
          </span>
          {charCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-green-400"
            >
              ✓ Ready to analyze
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <VoiceInputButton onTranscript={handleVoiceTranscript} />

        <Button
          type="submit"
          size="lg"
          disabled={!description.trim() || isAnalyzing}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Incident
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
