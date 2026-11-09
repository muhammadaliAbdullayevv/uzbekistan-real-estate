"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

import { getDistrictCentroid } from "@/lib/district-coordinates";

const FALLBACK_MAP_CENTER = { lat: 41.2995, lng: 69.2401 }; // Tashkent center

type ListingLocationViewerProps = {
  region: string;
  district: string;
  address?: string | null;
  street?: string | null;
  title: string;
  latitude: number | null;
  longitude: number | null;
  locale: "uz" | "ru";
};

export function ListingLocationViewer({
  region,
  district,
  address,
  street,
  title,
  latitude,
  longitude,
  locale
}: ListingLocationViewerProps) {
  const isRu = locale === "ru";
  const [modalOpen, setModalOpen] = useState(false);

  // Position calculation
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    (latitude !== 0 || longitude !== 0);

  const fallback = getDistrictCentroid(region, district) ?? FALLBACK_MAP_CENTER;
  const targetPos = hasCoordinates ? { lat: latitude!, lng: longitude! } : fallback;

  // Refs for preview map
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewMapRef = useRef<LeafletMap | null>(null);

  // Refs for full modal map
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<LeafletMap | null>(null);
  const leafletModuleRef = useRef<typeof import("leaflet") | null>(null);

  // Initialize preview map
  useEffect(() => {
    let cancelled = false;

    async function initPreview() {
      if (!previewContainerRef.current || previewMapRef.current) return;

      const L = (await import("leaflet")).default;
      const [markerIcon2x, markerIcon, markerShadow] = await Promise.all([
        import("leaflet/dist/images/marker-icon-2x.png"),
        import("leaflet/dist/images/marker-icon.png"),
        import("leaflet/dist/images/marker-shadow.png")
      ]);

      if (cancelled || !previewContainerRef.current) return;

      leafletModuleRef.current = L;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.default.src ?? markerIcon2x.default,
        iconUrl: markerIcon.default.src ?? markerIcon.default,
        shadowUrl: markerShadow.default.src ?? markerShadow.default
      });

      const map = L.map(previewContainerRef.current, {
        center: [targetPos.lat, targetPos.lng],
        zoom: hasCoordinates ? 15 : 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([targetPos.lat, targetPos.lng]).addTo(map);

      previewMapRef.current = map;
    }

    initPreview();

    return () => {
      cancelled = true;
      if (previewMapRef.current) {
        previewMapRef.current.remove();
        previewMapRef.current = null;
      }
    };
  }, [targetPos.lat, targetPos.lng, hasCoordinates]);

  // Initialize modal map when modal opens
  useEffect(() => {
    if (!modalOpen) return;

    let timer: NodeJS.Timeout;

    async function initModalMap() {
      if (!modalContainerRef.current) return;

      const L = leafletModuleRef.current ?? (await import("leaflet")).default;

      if (modalMapRef.current) {
        modalMapRef.current.invalidateSize();
        return;
      }

      const map = L.map(modalContainerRef.current).setView(
        [targetPos.lat, targetPos.lng],
        hasCoordinates ? 16 : 14
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      const marker = L.marker([targetPos.lat, targetPos.lng]).addTo(map);
      marker.bindPopup(`<b>${title}</b><br>${address || district || region}`).openPopup();

      modalMapRef.current = map;

      timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    initModalMap();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      if (modalMapRef.current) {
        modalMapRef.current.remove();
        modalMapRef.current = null;
      }
    };
  }, [modalOpen, targetPos.lat, targetPos.lng, hasCoordinates, title, address, district, region]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-xs font-black">
              📍
            </span>
            <span>{isRu ? "Расположение и ориентир" : "Joylashuv va mo'ljal"}</span>
          </h2>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95 transition"
          >
            <span>{isRu ? "Открыть на карте" : "Xaritada ochish"}</span>
            <span>↗</span>
          </button>
        </div>

        {/* Address & Landmark Information */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold shrink-0 mt-0.5">📍</span>
            <div className="space-y-1 min-w-0 flex-1">
              <p className="font-extrabold text-slate-900 text-sm leading-tight">
                {district ? `${district}, ` : ""}{region}
              </p>
              {address ? (
                <p className="text-slate-600 font-medium">
                  <span className="text-slate-400 font-semibold">{isRu ? "Ориентир:" : "Mo'ljal:"} </span>
                  <span className="text-slate-800 font-semibold">{address}</span>
                </p>
              ) : null}
              {street && street !== address ? (
                <p className="text-slate-500 font-medium text-[11px]">
                  <span className="text-slate-400 font-semibold">{isRu ? "Улица:" : "Ko'cha:"} </span>
                  <span>{street}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Visual Map Preview Box (Clickable) */}
        <div
          onClick={() => setModalOpen(true)}
          className="relative h-44 sm:h-52 rounded-xl border border-slate-200 overflow-hidden cursor-pointer group shadow-inner"
        >
          <div ref={previewContainerRef} className="w-full h-full pointer-events-none" />

          {/* Click to expand overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent flex items-end justify-center p-3 pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-black text-blue-700 shadow-lg flex items-center gap-1.5 transition group-hover:scale-105 active:scale-95">
              <span>🗺</span>
              <span>{isRu ? "Открыть карту" : "Xaritani kattalashtirish"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen / Large In-App Map Modal */}
      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-6"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-sm font-bold">
                  📍
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-black text-slate-900 leading-tight truncate">
                    {title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {district ? `${district}, ` : ""}{region}
                  </p>
                </div>
              </div>

              {/* Close Button [ ✕ ] */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shadow-2xs font-extrabold text-sm active:scale-95 ml-2"
                aria-label={isRu ? "Закрыть" : "Yopish"}
              >
                ✕
              </button>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] bg-slate-100">
              <div ref={modalContainerRef} className="w-full h-full min-h-[380px] sm:min-h-[440px]" />

              {/* Bottom Address Bar */}
              <div className="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-xl flex items-center justify-between z-[1000] gap-2">
                <div className="min-w-0">
                  <p className="font-black text-xs text-slate-900 truncate">
                    {address || `${district ? `${district}, ` : ""}${region}`}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                    {district ? `${district}, ` : ""}{region}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 shrink-0 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-500 transition shadow-xs active:scale-95"
                >
                  {isRu ? "Закрыть" : "Yopish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
