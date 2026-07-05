"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, apiFetch, parseApiResponse } from "@/lib/api";
import { STATUS_FLOW } from "@/lib/constants";
import { clearSession, getSessionProviderId } from "@/lib/session";
import {
  buildSnapshot,
  detectTechnicianChanges,
  type TechnicianDataSnapshot,
  type TechnicianNotification,
} from "@/lib/technicianNotifications";
import { useTechnicianNotifications } from "@/hooks/useTechnicianNotifications";
import type {
  Dispute,
  Provider,
  RequestData,
  RequestStatus,
  TechnicianBalanceSummary,
  TechnicianCredit,
} from "@/lib/types";

export type Tab = "job" | "history" | "earnings" | "profile";

const ACTIVE_STATUSES: RequestStatus[] = [
  "matched",
  "en-route",
  "arrived",
  "assessing",
  "awaiting-payment",
  "in-progress",
];

function getNextStatus(current: RequestStatus): RequestStatus | null {
  const idx = STATUS_FLOW.indexOf(current as (typeof STATUS_FLOW)[number]);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function useTechnicianDashboard() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("job");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [completionSubmitting, setCompletionSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<TechnicianCredit[]>([]);
  const [balanceSummary, setBalanceSummary] = useState<TechnicianBalanceSummary>({
    accountBalance: 0,
    bookingCommissionTotal: 0,
    quoteCommissionTotal: 0,
    transactionCount: 0,
  });

  const { notifications, pushNotifications, dismissNotification } = useTechnicianNotifications();
  const prevSnapshotRef = useRef<TechnicianDataSnapshot | null>(null);
  const isInitialLoadRef = useRef(true);
  const skipRequestIdsRef = useRef<Set<string>>(new Set());
  const requestsRef = useRef(requests);
  const disputesRef = useRef(disputes);
  const creditsRef = useRef(credits);

  requestsRef.current = requests;
  disputesRef.current = disputes;
  creditsRef.current = credits;

  useEffect(() => {
    const id = getSessionProviderId();
    if (!id) {
      router.replace("/login");
      return;
    }
    setSessionId(id);
  }, [router]);

  const markSkipRequestStatus = useCallback((id: string) => {
    skipRequestIdsRef.current.add(id);
  }, []);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!sessionId) return;
      if (!silent) setLoading(true);
      setServerError(null);

      try {
        const [provRes, reqRes, disputeRes, creditsRes, summaryRes] = await Promise.all([
          apiFetch(`/api/providers?id=${sessionId}`, { bustCache: silent }),
          apiFetch("/api/requests", { bustCache: silent }),
          apiFetch("/api/disputes", { bustCache: silent }),
          apiFetch(`/api/technician-credits?providerId=${sessionId}`, { bustCache: silent }),
          apiFetch(`/api/technician-credits/summary?providerId=${sessionId}`, { bustCache: silent }),
        ]);

        if (!provRes.ok) {
          clearSession();
          router.replace("/login");
          return;
        }

        const prov: Provider = await provRes.json();
        setProvider(prov);

        const allRequests: RequestData[] = reqRes.ok ? await reqRes.json() : [];
        const nextRequests = allRequests.filter((r) => r.assignedProvider?.id === sessionId);
        if (reqRes.ok) setRequests(nextRequests);

        const allDisputes: Dispute[] = disputeRes.ok ? await disputeRes.json() : disputesRef.current;
        if (disputeRes.ok) setDisputes(allDisputes);

        const nextCredits: TechnicianCredit[] = creditsRes.ok
          ? await creditsRes.json()
          : creditsRef.current;
        if (creditsRes.ok) setCredits(nextCredits);

        if (summaryRes.ok) {
          setBalanceSummary(await summaryRes.json());
        }

        const nextSnapshot = buildSnapshot(
          reqRes.ok ? allRequests : [],
          disputeRes.ok ? allDisputes : [],
          nextCredits,
          sessionId
        );

        if (silent && !isInitialLoadRef.current && prevSnapshotRef.current) {
          const skipRequestIds = new Set(skipRequestIdsRef.current);
          skipRequestIdsRef.current.clear();
          const changes = detectTechnicianChanges(prevSnapshotRef.current, nextSnapshot, {
            skipRequestIds,
          });
          pushNotifications(changes);
        }

        prevSnapshotRef.current = nextSnapshot;
        isInitialLoadRef.current = false;
      } catch {
        setServerError(`Could not connect to the API server at ${API_BASE_URL}`);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [sessionId, router, pushNotifications]
  );

  useEffect(() => {
    if (!sessionId) return;
    fetchData();
    const interval = setInterval(() => fetchData(true), 4000);
    return () => clearInterval(interval);
  }, [sessionId, fetchData]);

  const activeJob = useMemo(() => {
    const sorted = [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const pipeline = sorted.find((r) => ACTIVE_STATUSES.includes(r.status));
    if (pipeline) return pipeline;
    const latest = sorted[0];
    return latest?.status === "disputed" ? latest : null;
  }, [requests]);

  const completedJobs = useMemo(
    () =>
      requests
        .filter((r) => r.status === "completed")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests]
  );

  const handleToggleAvailability = async () => {
    if (!provider || provider.status === "Dispatched" || provider.status === "Engaged") return;

    const newStatus = provider.status === "Available" ? "Offline" : "Available";
    try {
      const res = await apiFetch("/api/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: provider.id, status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProvider(updated);
      }
    } catch {
      setServerError("Failed to update availability.");
    }
  };

  const handleAdvanceStatus = async () => {
    if (!activeJob) return;
    const next = getNextStatus(activeJob.status);
    if (!next) return;

    setStatusUpdating(true);
    try {
      const res = await apiFetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeJob.id, status: next }),
      });
      if (res.ok) {
        const updated = await res.json();
        markSkipRequestStatus(activeJob.id);
        setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        await fetchData(true);
      }
    } catch {
      setServerError("Failed to update job status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSubmitQuote = async (
    technicianAssessment: string,
    quoteAmount: number
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!activeJob || !sessionId) {
      return { ok: false, error: "No active job to quote." };
    }

    setQuoteSubmitting(true);
    setServerError(null);
    try {
      const res = await apiFetch("/api/requests/submit-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeJob.id,
          providerId: sessionId,
          technicianAssessment,
          quoteAmount,
        }),
      });
      const updated = await parseApiResponse<RequestData>(res);
      markSkipRequestStatus(activeJob.id);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      await fetchData(true);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit quote.";
      setServerError(message);
      return { ok: false, error: message };
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeJob || !sessionId) return;

    setCompletionSubmitting(true);
    setServerError(null);
    try {
      const res = await apiFetch("/api/requests/mark-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeJob.id, providerId: sessionId }),
      });
      const updated = await parseApiResponse<RequestData>(res);
      markSkipRequestStatus(activeJob.id);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      await fetchData(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to mark job complete.");
    } finally {
      setCompletionSubmitting(false);
    }
  };

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  const handleNotificationNavigate = useCallback(
    (notification: TechnicianNotification) => {
      dismissNotification(notification.toastId);

      switch (notification.kind) {
        case "new_assignment":
        case "new_dispute":
        case "dispute_status":
        case "quote_approved":
        case "quote_paid":
          setActiveTab("job");
          break;
        case "payment_credited":
          setActiveTab("earnings");
          break;
      }
    },
    [dismissNotification]
  );

  const isOnline = provider ? provider.status === "Available" : false;
  const isDispatched = provider ? provider.status === "Dispatched" : false;
  const isEngaged = provider ? provider.status === "Engaged" : false;
  const isAvailabilityLocked = isDispatched || isEngaged;
  const nextStatus = activeJob ? getNextStatus(activeJob.status) : null;

  return {
    sessionId,
    activeTab,
    setActiveTab,
    provider,
    loading,
    serverError,
    sidebarOpen,
    setSidebarOpen,
    activeJob,
    completedJobs,
    credits,
    balanceSummary,
    disputes,
    notifications,
    dismissNotification,
    handleNotificationNavigate,
    isOnline,
    isDispatched,
    isEngaged,
    isAvailabilityLocked,
    nextStatus,
    statusUpdating,
    quoteSubmitting,
    completionSubmitting,
    handleToggleAvailability,
    handleAdvanceStatus,
    handleSubmitQuote,
    handleMarkComplete,
    handleSignOut,
  };
}
