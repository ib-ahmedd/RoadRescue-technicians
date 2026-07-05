"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  TechnicianNotification,
  TechnicianNotificationInput,
} from "@/lib/technicianNotifications";

const TOAST_DURATION_MS = 5000;
const MAX_VISIBLE_TOASTS = 5;

function createToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTechnicianNotifications() {
  const [notifications, setNotifications] = useState<TechnicianNotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissNotification = useCallback((toastId: string) => {
    const timer = timersRef.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(toastId);
    }
    setNotifications((prev) => prev.filter((n) => n.toastId !== toastId));
  }, []);

  const scheduleDismiss = useCallback((toastId: string) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(toastId);
      setNotifications((prev) => prev.filter((n) => n.toastId !== toastId));
    }, TOAST_DURATION_MS);
    timersRef.current.set(toastId, timer);
  }, []);

  const pushNotifications = useCallback(
    (items: TechnicianNotificationInput[]) => {
      if (items.length === 0) return;

      const withIds: TechnicianNotification[] = items.map((item) => ({
        ...item,
        toastId: createToastId(),
      }));

      setNotifications((prev) => {
        const merged = [...prev, ...withIds];
        return merged.slice(-MAX_VISIBLE_TOASTS);
      });

      withIds.forEach((n) => scheduleDismiss(n.toastId));
    },
    [scheduleDismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return {
    notifications,
    pushNotifications,
    dismissNotification,
  };
}
