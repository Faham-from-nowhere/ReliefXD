import { useEffect, useRef, useMemo } from "react";
import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Incident } from "../types/incident";

// Local cn utility to avoid import path issues
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const MOVEMENT_DAMPING = 3000; // Increased damping for smoother interaction

const BASE_GLOBE_CONFIG: COBEOptions = {
    width: 800,
    height: 800,
    onRender: () => { },
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.25, // Slightly more tilted
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [0.3, 0.3, 0.3],
    markerColor: [1, 0.2, 0.2], // Emergency Red
    glowColor: [0.1, 0.1, 0.1],
    markers: [],
};

interface GlobeViewProps {
    className?: string;
    incidents: Incident[];
    userLocation?: { lat: number; lng: number } | null;
    locationStatus?: 'detecting' | 'detected' | 'denied' | 'unavailable';
}

export function GlobeView({ className, incidents, userLocation, locationStatus }: GlobeViewProps) {
    let phi = 0;
    let width = 0;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);

    const r = useMotionValue(0);
    const rs = useSpring(r, {
        mass: 1,
        damping: 30,
        stiffness: 100,
    });

    // Convert incidents to globe markers
    // Note: Cobe currently supports one marker color per globe instance.
    // We prioritize representing location and approximate severity by size.
    const markers = useMemo(() => {
        const incidentMarkers = incidents.map(incident => ({
            location: [incident.location.lat, incident.location.lng] as [number, number],
            size: incident.urgency === 'critical' ? 0.15 : 0.08 // Larger for critical
        }));

        // Add user location marker if available and detected
        if (userLocation && locationStatus === 'detected') {
            incidentMarkers.push({
                location: [userLocation.lat, userLocation.lng] as [number, number],
                size: 0.12 // Medium size for user location
            });
        }

        return incidentMarkers;
    }, [incidents, userLocation, locationStatus]);

    const updatePointerInteraction = (value: number | null) => {
        pointerInteracting.current = value;
        if (canvasRef.current) {
            canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
        }
    };

    const updateMovement = (clientX: number) => {
        if (pointerInteracting.current !== null) {
            const delta = clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            r.set(r.get() + delta / MOVEMENT_DAMPING);
        }
    };

    useEffect(() => {
        const onResize = () => {
            if (canvasRef.current) {
                width = canvasRef.current.offsetWidth;
            }
        };

        window.addEventListener("resize", onResize);
        onResize();

        const globe = createGlobe(canvasRef.current!, {
            ...BASE_GLOBE_CONFIG,
            width: width * 2,
            height: width * 2,
            markers: markers,
            onRender: (state) => {
                // Reduced rotation speed from 0.005 to 0.001
                if (!pointerInteracting.current) phi += 0.002;
                state.phi = phi + rs.get();
                state.width = width * 2;
                state.height = width * 2;
            },
        });

        setTimeout(() => {
            if (canvasRef.current) canvasRef.current.style.opacity = "1";
        }, 0);

        return () => {
            globe.destroy();
            window.removeEventListener("resize", onResize);
        };
    }, [rs, markers]);

    // Expose control to parent if needed, but for now we'll handle "Rotate to Me" internally
    const handleRecenter = () => {
        if (userLocation) {
            // Calculate phi (rotation) to center the user's longitude
            // Globe rotation is in radians.
            // Longitude is -180 to 180.
            // We need to convert longitude to radians and adjust for offset.
            // Formula: phi = -(lng * PI / 180) - PI/2? Trial and error often needed with Cobe's coordinate system.
            // Actually, Cobe's 0 is at [0,0]?
            // Let's try: phi = 0 centers Lat 0, Lng 0?
            // "phi" controls horizontal rotation.
            const targetPhi = -(userLocation.lng * Math.PI) / 180;
            const currentPhi = r.get();

            // Find shortest path to targetPhi to avoid spinning wildly
            // We want (targetPhi - currentPhi) to be between -PI and PI
            let delta = (targetPhi - currentPhi) % (2 * Math.PI);
            if (delta > Math.PI) delta -= 2 * Math.PI;
            if (delta < -Math.PI) delta += 2 * Math.PI;

            r.set(currentPhi + delta);
            // We don't change theta (vertical tilt) automatically for now to keep it simple,
            // or we could animate it too if we exposed it.
        }
    };

    return (
        <div
            className={cn(
                "relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950",
                className
            )}
        >
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-white font-bold text-lg">Global Live View</h3>
                <p className="text-slate-400 text-xs">Red Markers = Active Incidents</p>
                <p className="text-blue-400 text-xs mt-1 font-mono">
                    Monitor Active: {markers.length}
                </p>
            </div>

            <canvas
                className={cn(
                    "h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
                    "max-w-[700px] max-h-[700px] translate-y-8" // Reduced max size and moved down
                )}
                ref={canvasRef}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX;
                    updatePointerInteraction(e.clientX);
                }}
                onPointerUp={() => updatePointerInteraction(null)}
                onPointerOut={() => updatePointerInteraction(null)}
                onMouseMove={(e) => updateMovement(e.clientX)}
                onTouchMove={(e) =>
                    e.touches[0] && updateMovement(e.touches[0].clientX)
                }
            />

            {/* Recenter Button (Globe) */}
            {userLocation && locationStatus === 'detected' && (
                <button
                    onClick={handleRecenter}
                    className="absolute bottom-6 right-6 z-[100] bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group flex items-center justify-center"
                    title="Rotate to my location"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-navigation"
                    >
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Rotate to Me
                    </span>
                </button>
            )}
        </div>
    );
}
