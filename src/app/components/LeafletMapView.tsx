import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '../types/incident';
import L from 'leaflet';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Navigation } from 'lucide-react';

interface LeafletMapViewProps {
    incidents: Incident[];
    onIncidentClick: (incident: Incident) => void;
    userLocation?: { lat: number; lng: number } | null;
    locationStatus?: 'detecting' | 'detected' | 'denied' | 'unavailable';
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const getMarkerColor = (urgency: Incident['urgency']) => {
    switch (urgency) {
        case 'critical':
            return '#ef4444'; // red-500
        case 'medium':
            return '#f97316'; // orange-500
        case 'safe':
            return '#22c55e'; // green-500
        default:
            return '#6b7280'; // gray-500
    }
};

const createCustomIcon = (incident: Incident, isHovered: boolean) => {
    const color = getMarkerColor(incident.urgency);
    const isPulsing = incident.urgency === 'critical';

    // We use divIcon to replicate the custom styling
    return L.divIcon({
        className: 'custom-marker-icon', // Use a class we can target if needed, but styles are inline in html
        html: `
            <div style="position: relative; width: 24px; height: 24px;">
                ${isPulsing ? `
                <div class="absolute inset-0 rounded-full animate-ping" style="background-color: ${color}; opacity: 0.5;"></div>
                ` : ''}
                <div class="absolute inset-0 rounded-full border-2 border-white" style="background-color: ${color}; box-shadow: 0 0 4px rgba(0,0,0,0.3); transform: scale(${isHovered ? 1.3 : 1}); transition: transform 0.2s;"></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Create user location marker (blue with pulse)
const createUserLocationIcon = () => {
    return L.divIcon({
        className: 'custom-user-marker',
        html: `
            <div style="position: relative; width: 32px; height: 32px;">
                <div class="absolute inset-0 rounded-full animate-ping" style="background-color: #3b82f6; opacity: 0.4;"></div>
                <div class="absolute inset-0 rounded-full border-4 border-white" style="background-color: #3b82f6; box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);"></div>
                <div class="absolute inset-0 flex items-center justify-center" style="font-size: 14px;">📍</div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

// Component to control map programmatically
function MapController({ center }: { center: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, {
                duration: 1.5,
            });
        }
    }, [center, map]);

    return null;
}

export function LeafletMapView({ incidents, onIncidentClick, userLocation, locationStatus, onLocationUpdate }: LeafletMapViewProps) {
    const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194];
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [recenterTarget, setRecenterTarget] = useState<[number, number] | null>(null);
    const userMarkerRef = useRef<L.Marker>(null);

    const handleRecenter = () => {
        if (userLocation) {
            setRecenterTarget([userLocation.lat, userLocation.lng]);
            // Reset after animation
            setTimeout(() => setRecenterTarget(null), 2000);
        }
    };

    const handleDragEnd = useCallback(() => {
        const marker = userMarkerRef.current;
        if (marker && onLocationUpdate) {
            const newPos = marker.getLatLng();
            onLocationUpdate({ lat: newPos.lat, lng: newPos.lng });
        }
    }, [onLocationUpdate]);

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={center}
                zoom={12}
                className="w-full h-full z-0" // z-0 to ensure it doesn't overlap sidebar/modals if z-indexes are tricky
                style={{ width: '100%', height: '100%', background: '#0f172a' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={recenterTarget} />
                {incidents.map((incident) => {
                    const isHovered = hoveredId === incident.id;
                    return (
                        <Marker
                            key={incident.id}
                            position={[incident.location.lat, incident.location.lng]}
                            icon={createCustomIcon(incident, isHovered)}
                            eventHandlers={{
                                click: () => onIncidentClick(incident),
                                mouseover: () => setHoveredId(incident.id),
                                mouseout: () => setHoveredId(null),
                            }}
                        >
                            <Tooltip
                                permanent={isHovered}
                                direction="top"
                                offset={[0, -12]}
                                opacity={1}
                                className="bg-transparent border-none shadow-none p-0" // Reset default leaflet tooltip styles
                            >
                                {isHovered && (
                                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 w-64 text-left pointer-events-none">
                                        <p className="font-semibold text-sm mb-1 capitalize">{incident.category}</p>
                                        <p className="text-xs text-slate-300 mb-2 truncate">{incident.summary}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">Confidence:</span>
                                            <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                    style={{ width: `${incident.confidence}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-blue-400">{incident.confidence}%</span>
                                        </div>
                                    </div>
                                )}
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Recenter Button */}
            {userLocation && locationStatus === 'detected' && (
                <button
                    onClick={handleRecenter}
                    className="absolute bottom-6 right-6 z-[1000] bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
                    title="Recenter on my location"
                >
                    <Navigation className="w-5 h-5" />
                    <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Recenter on Me
                    </span>
                </button>
            )}
        </div>
    );
}
