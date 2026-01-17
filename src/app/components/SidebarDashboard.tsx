import { Shield } from 'lucide-react';
import { LiveStatsCard } from './LiveStatsCard';

interface SidebarDashboardProps {
  criticalCount: number;
  mediumCount: number;
  safeCount: number;
  avgConfidence: number;
}

export function SidebarDashboard({ criticalCount, mediumCount, safeCount, avgConfidence }: SidebarDashboardProps) {
  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto">
      {/* App Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ReliefXD</h1>
            <p className="text-xs text-slate-400">AI-Powered Emergency Intelligence</p>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
          Live Operations
        </h2>
        <LiveStatsCard
          criticalCount={criticalCount}
          mediumCount={mediumCount}
          safeCount={safeCount}
          aiConfidence={avgConfidence}
        />
      </div>
    </div>
  );
}
