"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type LatLng = { lat: number; lng: number };

type LocationPickerProps = {
  initialPosition?: LatLng | null;
  defaultCenter: LatLng;
  onChange: (position: LatLng) => void;
  copy: {
    helper: string;
    useMyLocation: string;
    locating: string;
    locateError: string;
    notSet: string;
  };
};

export function LocationPicker({
  initialPosition,
  defaultCenter,
  onChange,
  copy
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletModuleRef = useRef<typeof import("leaflet") | null>(null);
  const [position, setPosition] = useState<LatLng | null>(initialPosition ?? null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function placeMarker(next: LatLng) {
    const L = leafletModuleRef.current;
    const map = mapRef.current;
    if (!L || !map) {
      return;
    }

    setPosition(next);
    onChange(next);

    if (markerRef.current) {
      markerRef.current.setLatLng([next.lat, next.lng]);
      return;
    }

    const marker = L.marker([next.lat, next.lng], { draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const latlng = marker.getLatLng();
      placeMarker({ lat: latlng.lat, lng: latlng.lng });
    });
    markerRef.current = marker;
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      const [markerIcon2x, markerIcon, markerShadow] = await Promise.all([
        import("leaflet/dist/images/marker-icon-2x.png"),
        import("leaflet/dist/images/marker-icon.png"),
        import("leaflet/dist/images/marker-shadow.png")
      ]);

      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      leafletModuleRef.current = L;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.default.src ?? markerIcon2x.default,
        iconUrl: markerIcon.default.src ?? markerIcon.default,
        shadowUrl: markerShadow.default.src ?? markerShadow.default
      });

      const startCenter = initialPosition ?? defaultCenter;
      const map = L.map(containerRef.current).setView(
        [startCenter.lat, startCenter.lng],
        initialPosition ? 15 : 11
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;

      if (initialPosition) {
        placeMarker(initialPosition);
      }

      map.on("click", (event) => {
        placeMarker({ lat: event.latlng.lat, lng: event.latlng.lng });
      });
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // Map is initialized once; region/district changes only move the
    // *default* center for a not-yet-placed pin, handled separately below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (position || !mapRef.current) {
      return;
    }
    // No pin placed yet -- keep the view centered on the selected
    // region/district as the user changes it, without dropping a pin.
    mapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 11);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCenter.lat, defaultCenter.lng]);

  function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocateError(copy.locateError);
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        setIsLocating(false);
        const next = { lat: geoPosition.coords.latitude, lng: geoPosition.coords.longitude };
        mapRef.current?.setView([next.lat, next.lng], 16);
        placeMarker(next);
      },
      () => {
        setIsLocating(false);
        setLocateError(copy.locateError);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink/50">{copy.helper}</p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="btn-secondary shrink-0 gap-1.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
          </svg>
          {isLocating ? copy.locating : copy.useMyLocation}
        </button>
      </div>

      <div ref={containerRef} className="h-56 w-full overflow-hidden rounded-2xl border border-line sm:h-64" />

      {locateError ? <p className="text-xs text-coral">{locateError}</p> : null}
      {!position ? <p className="text-xs text-ink/50">{copy.notSet}</p> : null}
    </div>
  );
}
