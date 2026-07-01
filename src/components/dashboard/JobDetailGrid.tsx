import type { RequestData } from "@/lib/types";
import styles from "@/app/dashboard/Dashboard.module.css";

interface JobDetailGridProps {
  job: RequestData;
}

export default function JobDetailGrid({ job }: JobDetailGridProps) {
  return (
    <div className={styles.jobGrid}>
      <div>
        <h3 className="label" style={{ marginBottom: "1rem" }}>Customer</h3>
        <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
          <span className={styles.detailLabel}>Name</span>
          <span className={styles.detailValue}>{job.name}</span>
        </div>
        <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
          <span className={styles.detailLabel}>Phone</span>
          <span className={styles.detailValue}>
            <a href={`tel:${job.phone}`}>{job.phone}</a>
          </span>
        </div>
        {job.email && (
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{job.email}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="label" style={{ marginBottom: "1rem" }}>Location & Vehicle</h3>
        <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
          <span className={styles.detailLabel}>Location</span>
          <span className={styles.detailValue}>{job.location}</span>
        </div>
        {job.landmark && (
          <div className={styles.detailGroup} style={{ marginBottom: "0.85rem" }}>
            <span className={styles.detailLabel}>Landmark</span>
            <span className={styles.detailValue}>{job.landmark}</span>
          </div>
        )}
        <div className={styles.detailGroup}>
          <span className={styles.detailLabel}>Customer Vehicle</span>
          <span className={styles.detailValue}>
            {[job.vehicleColor, job.vehicleYear, job.vehicleMake, job.vehicleModel, job.vehicleType]
              .filter(Boolean)
              .join(" · ") || "Not specified"}
          </span>
        </div>
      </div>
    </div>
  );
}
