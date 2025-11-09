// src/hooks/useGeoNotify.tsx
import { useEffect, useRef } from "react";
import { distanceMeters } from "../utils";
import type { MapPoint } from "../types";

export function useGeoNotify(events: MapPoint[], thresholdMeters = 200) {
  const notifiedRef = useRef<Set<string>>(new Set());
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    // Запрос прав на уведомления (браузер)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Если уже было watch — очистим
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Слежение за позицией
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        for (const ev of events) {
          if (notifiedRef.current.has(ev.id)) continue;

          const d = distanceMeters(lat, lng, ev.lat, ev.lng);
          if (d <= thresholdMeters) {
            // уведомляем
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Рядом: ${ev.name}`, {
                body: `${ev.type} — ${ev.description?.slice(0, 80) || ""}`,
              });
            } else {
              // fallback для случаев без прав на notification
              // можно показать toast или alert
              console.info(`Рядом: ${ev.name}`);
            }
            notifiedRef.current.add(ev.id);
          }
        }
      },
      (err) => {
        console.warn("geo watch error", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [events, thresholdMeters]);
}
