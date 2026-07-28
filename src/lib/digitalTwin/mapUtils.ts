/** Re-exports for backward compatibility */
export {
  VOLTAGE_COLORS,
  VOLTAGE_HEX,
  VOLTAGE_FLOW_SPEED,
  HEALTH_COLORS,
  HEALTH_HEX,
  HARYANA_VIEW,
  MAPBOX_TOKEN,
  API_BASE,
} from "./constants";

export { positionAlongPath as getPositionAlongPath, generateFlowParticles } from "./powerFlowEngine";

import { HEALTH_COLORS, HEALTH_HEX } from "./constants";
import type { HealthStatus } from "@/lib/types/digitalTwin";

export function healthColor(health: HealthStatus): [number, number, number] {
  return HEALTH_COLORS[health] ?? [148, 163, 184];
}

export function healthHex(health: HealthStatus): string {
  return HEALTH_HEX[health] ?? "#94a3b8";
}
