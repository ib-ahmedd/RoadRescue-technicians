import { SERVICE_DETAILS, SERVICE_ICONS } from "@/lib/constants";
import type { RequestData } from "@/lib/types";
import EmptyState from "./EmptyState";
import styles from "@/app/dashboard/Dashboard.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface JobHistoryTabProps {
  completedJobs: RequestData[];
}

export default function JobHistoryTab({ completedJobs }: JobHistoryTabProps) {
  return (
    <div className={styles.panel}>
      {completedJobs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No completed jobs yet"
          subtitle="Completed rescue assignments will appear here."
        />
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
  );
}
