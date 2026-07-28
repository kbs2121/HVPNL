"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl/maplibre";
import type { PickingInfo } from "@deck.gl/core";
import { AnimatePresence } from "framer-motion";
import { haryanaNetwork } from "@/lib/data/haryana";
import { useDigitalTwinStore } from "@/hooks/useDigitalTwinStore";
import { buildAllLayers } from "@/lib/digitalTwin/layerBuilder";
import { getBasemapStyle } from "@/lib/digitalTwin/basemaps";
import { preloadIconAtlas } from "@/lib/digitalTwin/icons";
import { STARTUP_FLYOVER } from "@/lib/digitalTwin/flyover";
import type {
  Substation,
  Tower,
  Zone,
  Circle,
  Division,
  TransmissionLine,
} from "@/lib/types/digitalTwin";
import { AssetPopup } from "../popups/AssetPopup";
import "maplibre-gl/dist/maplibre-gl.css";

const NETWORK = haryanaNetwork;

export function DigitalTwinMap() {
  const animRef = useRef(0);
  const [timeMs, setTimeMs] = useState(0);
  const [iconAtlas, setIconAtlas] = useState("");
  const [iconMapping, setIconMapping] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  const {
    viewState,
    basemapId,
    layers,
    trippedLineId,
    highlightedAssetId,
    flyoverComplete,
    setViewState,
    setMouseCoords,
    setAnimationTime,
    setHoverInfo,
    flyToWaypoint,
    setFlyoverComplete,
  } = useDigitalTwinStore();

  const hoverInfo = useDigitalTwinStore((s) => s.hoverInfo);

  // Preload icon atlas
  useEffect(() => {
    preloadIconAtlas().then(({ atlas, mapping }) => {
      setIconAtlas(atlas);
      setIconMapping(mapping);
    });
  }, []);

  // Animation loop — 60 FPS power flow
  useEffect(() => {
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      setTimeMs(ts - start);
      setAnimationTime(ts - start);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [setAnimationTime]);

  // Startup flyover tour
  useEffect(() => {
    if (flyoverComplete) return;
    let cancelled = false;
    (async () => {
      for (const wp of STARTUP_FLYOVER) {
        if (cancelled) break;
        flyToWaypoint(wp);
        await new Promise((r) => setTimeout(r, wp.duration + wp.pauseMs));
      }
      if (!cancelled) setFlyoverComplete(true);
    })();
    return () => { cancelled = true; };
  }, [flyoverComplete, flyToWaypoint, setFlyoverComplete]);

  const deckLayers = useMemo(
    () =>
      buildAllLayers({
        zones: NETWORK.zones,
        circles: NETWORK.circles,
        divisions: NETWORK.divisions,
        substations: NETWORK.substations,
        towers: NETWORK.towers,
        lines: NETWORK.lines,
        layers,
        timeMs,
        zoom: viewState.zoom,
        iconAtlas,
        iconMapping,
        highlightedId: highlightedAssetId,
        trippedLineId,
        hoveredId: hoverInfo?.object
          ? "id" in hoverInfo.object
            ? hoverInfo.object.id
            : null
          : null,
      }),
    [
      layers,
      timeMs,
      viewState.zoom,
      iconAtlas,
      iconMapping,
      highlightedAssetId,
      trippedLineId,
      hoverInfo,
    ]
  );

  const mapStyle = useMemo(() => getBasemapStyle(basemapId), [basemapId]);

  const onHover = useCallback(
    (info: PickingInfo) => {
      if (info.object && info.x != null && info.y != null) {
        const layerId = info.layer?.id ?? "";
        let type: "substation" | "tower" | "zone" | "circle" | "division" | "line" | null = null;

        if (layerId.includes("substation")) type = "substation";
        else if (layerId.includes("tower")) type = "tower";
        else if (layerId === "jurisdiction-zones") type = "zone";
        else if (layerId.includes("circle")) type = "circle";
        else if (layerId.includes("division")) type = "division";
        else if (layerId.includes("lines-conductor")) type = "line";

        if (type) {
          setHoverInfo({
            type,
            object: info.object as Substation | Tower | Zone | Circle | Division | TransmissionLine,
            x: info.x,
            y: info.y,
          });
          return;
        }
      }
      setHoverInfo(null);
    },
    [setHoverInfo]
  );

  return (
    <div className="relative h-full w-full">
      <DeckGL
        viewState={viewState as never}
        onViewStateChange={({ viewState: vs }) => {
          const { longitude, latitude, zoom, pitch, bearing, transitionDuration } = vs as typeof viewState;
          setViewState({ longitude, latitude, zoom, pitch, bearing, transitionDuration });
        }}
        controller={{ touchRotate: true, inertia: true }}
        layers={deckLayers}
        onHover={onHover}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
        onClick={(info) => {
          if (info.coordinate) {
            setMouseCoords({ lng: info.coordinate[0], lat: info.coordinate[1] });
          }
        }}
      >
        <MapGL
          mapStyle={mapStyle}
          attributionControl={false}
          maxPitch={65}
          onMouseMove={(e) => {
            setMouseCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
          }}
          onDblClick={(e) => {
            const map = e.target;
            map.flyTo({
              center: [e.lngLat.lng, e.lngLat.lat],
              zoom: map.getZoom() + 1.5,
              duration: 800,
            });
          }}
        />
      </DeckGL>

      <AnimatePresence>
        {hoverInfo && (
          <AssetPopup
            type={hoverInfo.type}
            data={hoverInfo.object}
            x={hoverInfo.x}
            y={hoverInfo.y}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
