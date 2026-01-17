import { useState } from 'react';
import { Incident, AIAnalysisResult } from '../types/incident';
import { LeafletMapView } from './LeafletMapView';
import { GlobeView } from './GlobeView';
import { IncidentInput } from './IncidentInput';
import { AIResponseCard } from './AIResponseCard';
import { LiveStatsCard } from './LiveStatsCard';
import { Maximize2, MoreHorizontal, Globe, Map as MapIcon, Minimize2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
    criticalCount: number;
    mediumCount: number;
    safeCount: number;
    avgConfidence: number;
    incidents: Incident[];
    onIncidentClick: (incident: Incident) => void;
    onAnalyze: (description: string) => void;
    isAnalyzing: boolean;
    currentAnalysis: AIAnalysisResult | null;
    locationStatus?: 'detecting' | 'detected' | 'denied' | 'unavailable';
    userLocation?: { lat: number; lng: number } | null;
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

export function DashboardView({
    criticalCount,
    mediumCount,
    safeCount,
    avgConfidence,
    incidents,
    onIncidentClick,
    onAnalyze,
    isAnalyzing,
    currentAnalysis,
    locationStatus,
    userLocation,
    onLocationUpdate
}: DashboardViewProps) {
    // State for View Mode (Map or Globe)
    const [viewMode, setViewMode] = useState<'map' | 'globe'>('map');
    // State for AI Panel Maximize
    const [isAiMaximized, setIsAiMaximized] = useState(false);

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Top Stats Row - Hide when AI is maximized to focus attention, or keep? Let's keep it. */}
            {/* Actually hiding it might be cleaner for "Focus Mode". Let's hide it. */}
            {!isAiMaximized && (
                <LiveStatsCard
                    criticalCount={criticalCount}
                    mediumCount={mediumCount}
                    safeCount={safeCount}
                    aiConfidence={avgConfidence}
                />
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Center Map/Globe Widget - Hidden when AI maximized */}
                {!isAiMaximized && (
                    <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden relative group">
                        {/* View Toggle */}
                        <div className="absolute top-4 right-4 z-10 flex p-1 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                title="2D Map View"
                            >
                                <MapIcon size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('globe')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'globe' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                title="3D Globe View"
                            >
                                <Globe size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="w-full h-full">
                            {viewMode === 'map' ? (
                                <LeafletMapView
                                    incidents={incidents}
                                    onIncidentClick={onIncidentClick}
                                    userLocation={userLocation}
                                    locationStatus={locationStatus}
                                    onLocationUpdate={onLocationUpdate}
                                />
                            ) : (
                                <GlobeView
                                    incidents={incidents}
                                    userLocation={userLocation}
                                    locationStatus={locationStatus}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Right Analysis Widget - Expands when maximized */}
                <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${isAiMaximized ? 'lg:col-span-3 h-[calc(100vh-140px)]' : 'lg:col-span-1 border-l-slate-800'}`}>
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-md">
                                <Sparkles size={16} className="text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white">AI Command Center</h3>
                        </div>
                        <button
                            onClick={() => setIsAiMaximized(!isAiMaximized)}
                            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2 group"
                            title={isAiMaximized ? "Minimize View" : "Focus Mode"}
                        >
                            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                {isAiMaximized ? "Standard View" : "Focus Mode"}
                            </span>
                            {isAiMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>

                    {/* Content Container - Conditional Layout */}
                    <div className={`flex-1 overflow-y-auto p-6 ${isAiMaximized ? 'bg-slate-950/50' : ''}`}>
                        <div className={`transition-all duration-300 ${isAiMaximized ? 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start' : 'space-y-6'}`}>

                            {/* Input Section */}
                            <div className="space-y-4">
                                {isAiMaximized && (
                                    <div className="mb-6">
                                        <h2 className="mt-25 text-2xl font-bold text-white mb-2">Detailed Situation Report</h2>
                                        <p className="text-slate-400">Provide a comprehensive description of the incident for detailed AI analysis and resource allocation.</p>
                                    </div>
                                )}
                                <IncidentInput
                                    onAnalyze={onAnalyze}
                                    isAnalyzing={isAnalyzing}
                                    locationStatus={locationStatus}
                                    userLocation={userLocation}
                                />
                            </div>

                            {/* Analysis Section */}
                            <div className={isAiMaximized ? 'sticky top-0' : ''}>
                                {currentAnalysis ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <AIResponseCard result={currentAnalysis} />
                                    </motion.div>
                                ) : (
                                    isAiMaximized && (
                                        <div className="mt-30 h-full min-h-[400px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/20">
                                            <div className="p-4 bg-slate-900/50 rounded-full mb-4">
                                                <Sparkles size={32} className="text-slate-700" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-300 mb-2">Waiting for Input</h3>
                                            <p className="max-w-xs mb-4">Describe an incident on the left to generate real-time AI strategic analysis.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
