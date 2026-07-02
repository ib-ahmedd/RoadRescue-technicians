"use client";

import { useState } from "react";
import { SERVICE_DETAILS, SERVICE_ICONS, STATUS_LABELS } from "@/lib/constants";
import type { Provider, RequestData, RequestStatus } from "@/lib/types";
import EmptyState from "./EmptyState";
import JobDetailGrid from "./JobDetailGrid";
import QuoteModal from "./QuoteModal";
import StatusTrack from "./StatusTrack";
import styles from "@/app/dashboard/Dashboard.module.css";

const QUOTE_STATUS_LABELS: Record<NonNullable<RequestData["quoteStatus"]>, string> = {
  none: "",
  pending: "Pending admin review",
  approved: "Approved — awaiting customer payment",
  rejected: "Rejected — submit a revised quote",
  paid: "Quote paid by customer",
};

interface ActiveJobTabProps {
  provider: Provider;
  completedJobs: RequestData[];
  activeJob: RequestData | null;
  isOnline: boolean;
  isAvailabilityLocked: boolean;
  nextStatus: RequestStatus | null;
  statusUpdating: boolean;
  quoteSubmitting: boolean;
  completionSubmitting: boolean;
  onToggleAvailability: () => void;
  onAdvanceStatus: () => void;
  onSubmitQuote: (assessment: string, amount: number) => Promise<{ ok: boolean; error?: string }>;
  onMarkComplete: () => void;
}

export default function ActiveJobTab({
  provider,
  completedJobs,
  activeJob,
  isOnline,
  isAvailabilityLocked,
  nextStatus,
  statusUpdating,
  quoteSubmitting,
  completionSubmitting,
  onToggleAvailability,
  onAdvanceStatus,
  onSubmitQuote,
  onMarkComplete,
}: ActiveJobTabProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const quoteStatus = activeJob?.quoteStatus ?? "none";
  const canSubmitQuote = quoteStatus === "none" || quoteStatus === "rejected";

  return (
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
          <EmptyState
            icon="📡"
            title={isOnline ? "Waiting for dispatch" : "You are offline"}
            subtitle={
              isOnline
                ? "Stay available — dispatch will assign matching rescue requests to you in real time."
                : "Go online to receive new job assignments from the operations center."
            }
          >
            {!isOnline && !isAvailabilityLocked && (
              <button type="button" className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={onToggleAvailability}>
                Go Online
              </button>
            )}
          </EmptyState>
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
              <span
                className={`badge ${activeJob.status === "disputed" ? "badge-danger" : "badge-info"}`}
              >
                {activeJob.status === "in-progress" && activeJob.technicianMarkedComplete
                  ? "Awaiting customer review"
                  : STATUS_LABELS[activeJob.status] ?? activeJob.status}
              </span>
            </div>

            <StatusTrack currentStatus={activeJob.status} />
            <JobDetailGrid job={activeJob} />

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
                  onClick={onAdvanceStatus}
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
                  Waiting for the customer to confirm your arrival on their tracking page. Once they
                  acknowledge you are on site, you can assess the situation and submit a quote.
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
            ) : activeJob.status === "assessing" ? (
              <>
                <div className={styles.assessBox}>
                  <p className={styles.assessTitle}>Assess the situation on site</p>
                  <p className={styles.assessSub}>
                    Inspect the vehicle and describe the work required, then submit a quote for admin approval
                    before the customer is charged.
                  </p>
                  {quoteStatus !== "none" && (
                    <span className={styles.quoteStatusBadge}>
                      {QUOTE_STATUS_LABELS[quoteStatus]}
                    </span>
                  )}
                </div>

                <div className={styles.actionRow}>
                  {canSubmitQuote && (
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowQuoteModal(true)}
                      disabled={quoteSubmitting}
                    >
                      Make quote
                    </button>
                  )}
                  {quoteStatus === "pending" && (
                    <p className={styles.waitingNote}>
                      Your quote is awaiting admin approval. The customer will be notified once it is approved.
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeJob.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    Open in Maps ↗
                  </a>
                </div>
              </>
            ) : activeJob.status === "awaiting-payment" ? (
              <div className={styles.actionRow}>
                <p className={styles.waitingNote}>
                  Quote approved. Waiting for the customer to pay on their tracking page.
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
            ) : activeJob.status === "in-progress" && activeJob.technicianMarkedComplete ? (
              <div className={styles.actionRow}>
                <p className={styles.waitingNote}>
                  Waiting for the customer to confirm or dispute completion on their tracking page.
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
            ) : activeJob.status === "in-progress" ? (
              <div className={styles.actionRow}>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={onMarkComplete}
                  disabled={completionSubmitting}
                >
                  {completionSubmitting ? (
                    <span className="dot-pulse"><span /><span /><span /></span>
                  ) : (
                    "Mark job complete"
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
            ) : activeJob.status === "disputed" ? (
              <div className={styles.actionRow}>
                <p
                  className={styles.waitingNote}
                  style={{
                    borderColor: "rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#f87171",
                  }}
                >
                  The customer raised a dispute on this job. Operations is reviewing the case — you
                  may be contacted for follow-up.
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

      <QuoteModal
        open={showQuoteModal}
        submitting={quoteSubmitting}
        onClose={() => !quoteSubmitting && setShowQuoteModal(false)}
        onSubmit={async (assessment, amount) => {
          const result = await onSubmitQuote(assessment, amount);
          if (result.ok) setShowQuoteModal(false);
          return result;
        }}
      />
    </>
  );
}
