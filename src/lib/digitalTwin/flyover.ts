/**
 * Flyover sequence — startup camera tour visiting major substations.
 */
export interface FlyoverWaypoint {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  duration: number;
  pauseMs: number;
}

export const STARTUP_FLYOVER: FlyoverWaypoint[] = [
  { longitude: 77.03, latitude: 28.46, zoom: 11, pitch: 55, bearing: -20, duration: 3000, pauseMs: 800 },
  { longitude: 77.32, latitude: 28.41, zoom: 12, pitch: 50, bearing: 30, duration: 2500, pauseMs: 600 },
  { longitude: 76.96, latitude: 29.39, zoom: 11.5, pitch: 55, bearing: -10, duration: 3000, pauseMs: 800 },
  { longitude: 76.99, latitude: 29.68, zoom: 11.5, pitch: 50, bearing: 45, duration: 2500, pauseMs: 600 },
  { longitude: 75.72, latitude: 29.15, zoom: 11, pitch: 55, bearing: -30, duration: 3000, pauseMs: 800 },
  { longitude: 76.5, latitude: 29.1, zoom: 7.8, pitch: 50, bearing: -15, duration: 4000, pauseMs: 0 },
];

export async function playFlyover(
  waypoints: FlyoverWaypoint[],
  flyTo: (wp: FlyoverWaypoint) => void
): Promise<void> {
  for (const wp of waypoints) {
    flyTo(wp);
    await new Promise((r) => setTimeout(r, wp.duration + wp.pauseMs));
  }
}
