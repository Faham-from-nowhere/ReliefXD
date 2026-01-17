import { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { AdminTableView } from './components/AdminTableView';
import { LoginModal } from './components/LoginModal';
import { Incident, AIAnalysisResult, UrgencyLevel, CategoryType } from './types/incident';

const CURRENT_USER_ID = 'user-1';

/* ================= BACKEND API ================= */

const analyzeWithBackend = async (
  description: string
): Promise<AIAnalysisResult> => {
  const res = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });

  if (!res.ok) {
    throw new Error('Backend analysis failed');
  }

  return res.json();
};

/* ================= RANDOM LOCATION (DEMO ONLY) ================= */

const generateRandomLocation = () => ({
  lat: (Math.random() * 160) - 80,
  lng: (Math.random() * 360) - 180,
});

/* ================= SAMPLE INCIDENT ================= */

const sampleIncidents: Incident[] = [
  {
    id: '1',
    description: 'Earthquake aftermath in Tokyo',
    urgency: 'critical',
    category: 'rescue',
    summary: 'Structural collapse risk',
    resources: ['Rescue Team'],
    confidence: 95,
    location: { lat: 35.6762, lng: 139.6503 },
    timestamp: new Date(),
    userId: 'user-2',
  },
];

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(sampleIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<'detecting' | 'detected' | 'denied' | 'unavailable'>('detecting');

  /* ================= GEOLOCATION ================= */

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setUserLocation(generateRandomLocation());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus('detected');
      },
      () => {
        setLocationStatus('denied');
        setUserLocation(generateRandomLocation()); // demo fallback
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ================= ANALYZE REQUEST ================= */

  const handleAnalyze = useCallback(async (description: string) => {
    if (!userLocation) {
      alert('Waiting for location detection. Please try again.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      const result = await analyzeWithBackend(description);

      setCurrentAnalysis(result);

      const newIncident: Incident = {
        id: Date.now().toString(),
        description,
        urgency: result.urgency.toLowerCase() as UrgencyLevel,
        category: result.category.toLowerCase() as CategoryType,
        summary: result.summary,
        resources: result.resources,
        confidence: Math.round(result.confidence * 100),
        location: userLocation,
        timestamp: new Date(),
        userId: CURRENT_USER_ID,
      };

      setIncidents((prev) => [newIncident, ...prev]);

    } catch (err) {
      console.error('Backend error:', err);
      alert('AI service unavailable');
    } finally {
      setIsAnalyzing(false);
    }
  }, [userLocation]);

  /* ================= FILTERING ================= */

  const filteredIncidents = useMemo(() => {
    return isAdmin
      ? incidents
      : incidents.filter((i) => i.userId === CURRENT_USER_ID);
  }, [incidents, isAdmin]);

  /* ================= STATS ================= */

  const criticalCount = filteredIncidents.filter(i => i.urgency === 'critical').length;
  const mediumCount = filteredIncidents.filter(i => i.urgency === 'medium').length;
  const safeCount = filteredIncidents.filter(i => i.urgency === 'safe').length;

  const avgConfidence =
    filteredIncidents.length > 0
      ? Math.round(
          filteredIncidents.reduce((sum, i) => sum + i.confidence, 0) /
            filteredIncidents.length
        )
      : 0;

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onLoginClick={() => setIsLoginModalOpen(true)}
      >
        {activeTab === 'dashboard' ? (
          <DashboardView
            criticalCount={criticalCount}
            mediumCount={mediumCount}
            safeCount={safeCount}
            avgConfidence={avgConfidence}
            incidents={filteredIncidents}
            onIncidentClick={setSelectedIncident}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            currentAnalysis={currentAnalysis}
            locationStatus={locationStatus}
            userLocation={userLocation}
            onLocationUpdate={setUserLocation}
          />
        ) : (
          isAdmin ? (
            <AdminTableView incidents={incidents} />
          ) : (
            <HistoryView incidents={filteredIncidents} />
          )
        )}
      </Layout>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(role) => setIsAdmin(role === 'admin')}
      />
    </>
  );
}
