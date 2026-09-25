/**
 * Power Flow Engine — generates animated particles, energy pulses, and dash offsets.
 * Designed for 60 FPS GPU-accelerated rendering via deck.gl ScatterplotLayer.
 */
import type { TransmissionLine, VoltageLevel } from "@/lib/types/digitalTwin";
import { VOLTAGE_FLOW_SPEED } from "./constants";

export interface FlowParticle {
  position: [number, number];
  lineId: string;
  voltage: VoltageLevel;
  size: number;
  opacity: number;
  isPulse: boolean;
}

export interface DashState {
  lineId: string;
  offset: number;
}

/** Interpolate position along a polyline at parameter t ∈ [0, 1] */
export function positionAlongPath(
  path: [number, number][],
  t: number
): [number, number] {
  if (path.length < 2) return path[0] ?? [0, 0];
  const total = path.length - 1;
  const wrapped = ((t % 1) + 1) % 1;
  const scaled = wrapped * total;
  const seg = Math.min(Math.floor(scaled), total - 1);
  const frac = scaled - seg;
  const [lng1, lat1] = path[seg];
  const [lng2, lat2] = path[seg + 1];
  return [lng1 + (lng2 - lng1) * frac, lat1 + (lat2 - lat1) * frac];
}

/**
 * Generate continuous flow particles for all active lines.
 * @param particlesPerLine - regular dots per line
 */
export function generateFlowParticles(
  lines: TransmissionLine[],
  timeMs: number,
  particlesPerLine = 10
): FlowParticle[] {
  const out: FlowParticle[] = [];

  for (const line of lines) {
    const speed = VOLTAGE_FLOW_SPEED[line.voltage_level];
    const baseSize =
      line.voltage_level === "400kV" ? 5 : line.voltage_level === "220kV" ? 4 : 3;

    // Regular flowing dots
    for (let i = 0; i < particlesPerLine; i++) {
      const offset = i / particlesPerLine;
      const t = (timeMs * speed + offset) % 1;
      out.push({
        position: positionAlongPath(line.path, t),
        lineId: line.id,
        voltage: line.voltage_level,
        size: baseSize,
        opacity: 220,
        isPulse: false,
      });
    }

    // Energy pulse — bright packet every ~4 seconds per line
    const pulsePeriod = 4000 + (line.id.charCodeAt(3) % 5) * 600;
    const pulsePhase = (timeMs % pulsePeriod) / pulsePeriod;
    if (pulsePhase < 0.15) {
      const t = pulsePhase / 0.15;
      out.push({
        position: positionAlongPath(line.path, t),
        lineId: line.id,
        voltage: line.voltage_level,
        size: baseSize * 3,
        opacity: 255,
        isPulse: true,
      });
    }
  }

  return out;
}

/** Dash offset for animated rolling dashes (PathStyleExtension) */
export function dashOffsetForLine(line: TransmissionLine, timeMs: number): number {
  const speed = VOLTAGE_FLOW_SPEED[line.voltage_level];
  return -(timeMs * speed * 200) % 20;
}

/** Arrow positions along line for direction indicators */
export function generateFlowArrows(
  lines: TransmissionLine[],
  timeMs: number,
  spacing = 0.15
): { position: [number, number]; angle: number; voltage: VoltageLevel }[] {
  const arrows: { position: [number, number]; angle: number; voltage: VoltageLevel }[] = [];

  for (const line of lines) {
    const speed = VOLTAGE_FLOW_SPEED[line.voltage_level];
    const offset = (timeMs * speed) % spacing;
    for (let t = offset; t < 1; t += spacing) {
      const pos = positionAlongPath(line.path, t);
      const posNext = positionAlongPath(line.path, Math.min(t + 0.01, 1));
      const angle =
        (Math.atan2(posNext[1] - pos[1], posNext[0] - pos[0]) * 180) / Math.PI;
      arrows.push({ position: pos, angle, voltage: line.voltage_level });
    }
  }

  return arrows;
}
