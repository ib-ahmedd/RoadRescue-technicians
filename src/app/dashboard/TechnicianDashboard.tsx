"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, apiFetch } from "@/lib/api";
import {
  SERVICE_DETAILS,
  SERVICE_ICONS,
  STATUS_FLOW,
  STATUS_DISPLAY_FLOW,
  STATUS_LABELS,
} from "@/lib/constants";
import { clearSession, getSessionProviderId } from "@/lib/session";
import type { Provider, RequestData, RequestStatus } from "@/lib/types";
import styles from "./Dashboard.module.css";

type Tab = "job" | "history" | "profile";

const ACTIVE_STATUSES: RequestStatus[] = ["matched", "en-route", "arrived"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNextStatus(current: RequestStatus): RequestStatus | null {
  const idx = STATUS_FLOW.indexOf(current as (typeof STATUS_FLOW)[number]);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export default function TechnicianDashboard() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("job");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const id = getSessionProviderId();
    if (!id) {
      router.replace("/login");
      return;
    }
    setSessionId(id);
  }, [router]);

  const fetchData = useCallback(async (silent = false) => {
    if (!sessionId) return;
    if (!silent) setLoading(true);
    setServerError(null);

    try {
      const [provRes, reqRes] = await Promise.all([
        apiFetch(`/api/providers?id=${sessionId}`, { bustCache: silent }),
        apiFetch("/api/requests", { bustCache: silent }),
      ]);

      if (!provRes.ok) {
        clearSession();
        router.replace("/login");
        return;
      }

      const prov: Provider = await provRes.json();
      setProvider(prov);

      if (reqRes.ok) {
        const all: RequestData[] = await reqRes.json();
        setRequests(all.filter((r) => r.assignedProvider?.id === sessionId));
      }
    } catch {
      setServerError(`Could not connect to the API server at ${API_BASE_URL}`);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (!sessionId) return;
    fetchData();
    const interval = setInterval(() => fetchData(true), 4000);
    return () => clearInterval(interval);
  }, [sessionId, fetchData]);

  const activeJob = useMemo(
    () => requests.find((r) => ACTIVE_STATUSES.includes(r.status)) ?? null,
    [requests]
  );

  const completedJobs = useMemo(
    () =>
      requests
        .filter((r) => r.status === "completed")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests]
  );

  const handleToggleAvailability = async () => {
    if (!provider || provider.status === "Dispatched") return;

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
        setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        await fetchData(true);
      }
    } catch {
      setServerError("Failed to update job status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  if (!sessionId || (loading && !provider)) {
    return (
      <div className={styles.loadingScreen}>
        <span className="dot-pulse"><span /><span /><span /></span>
      </div>
    );
  }

  if (!provider) return null;

  const isOnline = provider.status === "Available";
  const isDispatched = provider.status === "Dispatched";
  const nextStatus = activeJob ? getNextStatus(activeJob.status) : null;

  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <div className={styles.mobileHeader}>
        <button type="button" className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <span className={styles.brandName}>Technician Portal</span>
        <span className={`badge ${isOnline ? "badge-success" : isDispatched ? "badge-info" : "badge-danger"}`}>
          {provider.status}
        </span>
      </div>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M1 17l2-9h18l2 9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="7" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className={styles.brandName}>
            Road<span className="text-amber">Rescue</span>
          </span>
        </div>

        <div className={styles.techCard}>
          <div className={styles.avatar}>{provider.avatar}</div>
          <div>
            <div className={styles.techName}>{provider.name}</div>
            <div className={styles.techMeta}>{provider.id} · {SERVICE_DETAILS[provider.speciality] ?? provider.speciality}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "job" ? styles.navItemActive : ""}`}
            onClick={() => { setActiveTab("job"); setSidebarOpen(false); }}
          >
            🚨 Active Job
            {activeJob && <span className="badge badge-amber" style={{ marginLeft: "auto" }}>Live</span>}
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "history" ? styles.navItemActive : ""}`}
            onClick={() => { setActiveTab("history"); setSidebarOpen(false); }}
          >
            📋 Job History
          </button>
          <button
            type="button"
            className={`${styles.navItem} ${activeTab === "profile" ? styles.navItemActive : ""}`}
            onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }}
          >
            👤 Profile
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.availabilityToggle}>
            <div>
              <div className={styles.availabilityLabel}>Availability</div>
              <div className={`${styles.availabilityStatus} ${isOnline ? "text-amber" : ""}`}>
                {provider.status}
              </div>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${isOnline ? styles.toggleOn : ""}`}
              onClick={handleToggleAvailability}
              disabled={isDispatched}
              aria-label="Toggle availability"
              title={isDispatched ? "Cannot go offline while on a job" : undefined}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
          <button type="button" className="btn btn-ghost btn-sm w-full" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              {activeTab === "job" && "Active Job"}
              {activeTab === "history" && "Job History"}
              {activeTab === "profile" && "Your Profile"}
            </h1>
            <p className={styles.pageSub}>
              {activeTab === "job" && "View and update your current rescue assignment."}
              {activeTab === "history" && `${completedJobs.length} completed job${completedJobs.length !== 1 ? "s" : ""} on record.`}
              {activeTab === "profile" && "Your fleet credentials and performance stats."}
            </p>
          </div>
          <div className={styles.liveBadge}>
            <span className={styles.pulseDot} />
            Live sync · every 4s
          </div>
        </header>

        {serverError && <div className={styles.errorBanner}>{serverError}</div>}

        {activeTab === "job" && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Status</div>
                <div className={styles.statValue} style={{ fontSize: "1.25rem" }}>{provider.status}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Completed</div>
                <div className={styles.statValue}>{completedJobs.length}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Rating</div>
                <div className={styles.statValue}>{provider.rating.toFixed(1)} ★</div>
              </div>
            </div>

            <div className={styles.panel}>
              {!activeJob ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📡</div>
                  <h2 className={styles.emptyTitle}>
                    {isOnline ? "Waiting for dispatch" : "You are offline"}
                  </h2>
                  <p className={styles.emptySub}>
                    {isOnline
                      ? "Stay available — dispatch will assign matching rescue requests to you in real time."
                      : "Go online to receive new job assignments from the operations center."}
                  </p>
                  {!isOnline && !isDispatched && (
                    <button type="button" className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={handleToggleAvailability}>
                      Go Online
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.panelHeader}>
                    <div>
                      <span className="badge badge-amber">{activeJob.id}</span>
                      <h2 className={styles.panelTitle} style={{ marginTop: "0.5rem" }}>
                        {SERVICE_ICONS[activeJob.service] ?? "🛠️"}{" "}
                        {SERVICE_DETAILS[activeJob.service] ?? activeJob.service}
                      </h2>
                    </div>
                    <span className="badge badge-info">{STATUS_LABELS[activeJob.status] ?? activeJob.status}</span>
                  </div>

                  <div className={styles.statusTrack}>
                    {STATUS_DISPLAY_FLOW.map((step) => {
                      const stepIdx = STATUS_DISPLAY_FLOW.indexOf(step);
                      const currentIdx = STATUS_DISPLAY_FLOW.indexOf(
                        activeJob.status as (typeof STATUS_DISPLAY_FLOW)[number]
                      );
                      const isDone = currentIdx >= 0 && stepIdx < currentIdx;
                      const isActive = step === activeJob.status;
                      return (
                        <div
                          key={step}
                          className={`${styles.statusStep} ${isDone ? styles.statusStepDone : ""} ${isActive ? styles.statusStepActive : ""}`}
                        >
                          {STATUS_LABELS[step]}
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.jobGrid}>
                    <div>
                      <h3 className="label" style={{ marginBottom: "1rem" }}>Customer</h3>
                      <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
                        <span className={styles.detailLabel}>Name</span>
                        <span className={styles.detailValue}>{activeJob.name}</span>
                      </div>
                      <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
                        <span className={styles.detailLabel}>Phone</span>
                        <span className={styles.detailValue}>
                          <a href={`tel:${activeJob.phone}`}>{activeJob.phone}</a>
                        </span>
                      </div>
                      {activeJob.email && (
                        <div className={styles.detailGroup}>
                          <span className={styles.detailLabel}>Email</span>
                          <span className={styles.detailValue}>{activeJob.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="label" style={{ marginBottom: "1rem" }}>Location & Vehicle</h3>
                      <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
                        <span className={styles.detailLabel}>Location</span>
                        <span className={styles.detailValue}>{activeJob.location}</span>
                      </div>
                      {activeJob.landmark && (
                        <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
                          <span className={styles.detailLabel}>Landmark</span>
                          <span className={styles.detailValue}>{activeJob.landmark}</span>
                        </div>
                      )}
                      <div className={styles.detailGroup}>
                        <span className={styles.detailLabel}>Customer Vehicle</span>
                        <span className={styles.detailValue}>
                          {[activeJob.vehicleColor, activeJob.vehicleYear, activeJob.vehicleMake, activeJob.vehicleModel, activeJob.vehicleType]
                            .filter(Boolean)
                            .join(" · ") || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeJob.notes && (
                    <div className={styles.notesBox}>
                      <strong style={{ color: "var(--amber-light)" }}>Customer notes: </strong>
                      {activeJob.notes}
                    </div>
                  )}

                  {nextStatus ? (
                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleAdvanceStatus}
                        disabled={statusUpdating}
                      >
                        {statusUpdating ? (
                          <span className="dot-pulse"><span /><span /><span /></span>
                        ) : (
                          `Mark as ${STATUS_LABELS[nextStatus]} →`
                        )}
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeJob.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        Open in Maps ↗
                      </a>
                    </div>
                  ) : activeJob.status === "arrived" ? (
                    <div className={styles.actionRow}>
                      <p className={styles.waitingNote}>
                        Waiting for the customer to confirm completion on their tracking page.
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeJob.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        Open in Maps ↗
                      </a>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className={styles.panel}>
            {completedJobs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <h2 className={styles.emptyTitle}>No completed jobs yet</h2>
                <p className={styles.emptySub}>Completed rescue assignments will appear here.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {completedJobs.map((job) => (
                  <div key={job.id} className={styles.historyItem}>
                    <div className={styles.historyMain}>
                      <span className={styles.historyId}>{job.id}</span>
                      <span className={styles.historyCustomer}>{job.name}</span>
                      <span className={styles.historyMeta}>
                        {SERVICE_ICONS[job.service]} {SERVICE_DETAILS[job.service] ?? job.service} · {formatDate(job.createdAt)}
                      </span>
                    </div>
                    <span className="badge badge-success">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{provider.name}</h2>
              <span className="badge badge-amber">{provider.id}</span>
            </div>

            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>{provider.phone}</span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.detailLabel}>Speciality</span>
                <span className={styles.detailValue}>
                  {SERVICE_ICONS[provider.speciality]} {SERVICE_DETAILS[provider.speciality] ?? provider.speciality}
                </span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.detailLabel}>Service Vehicle</span>
                <span className={styles.detailValue}>{provider.vehicle}</span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.detailLabel}>License Plate</span>
                <span className={styles.detailValue}>{provider.plate}</span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.detailLabel}>Rating</span>
                <div className={styles.ratingRow}>
                  <span className={styles.ratingStars}>★ {provider.rating.toFixed(1)}</span>
                  <span className={styles.historyMeta}>({provider.reviews} reviews)</span>
                </div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.detailLabel}>Current Status</span>
                <span className={styles.detailValue}>{provider.status}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
