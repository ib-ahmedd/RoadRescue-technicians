import { SERVICE_DETAILS, SERVICE_ICONS } from "@/lib/constants";
import type { Provider } from "@/lib/types";
import styles from "@/app/dashboard/Dashboard.module.css";

interface ProfileTabProps {
  provider: Provider;
}

export default function ProfileTab({ provider }: ProfileTabProps) {
  return (
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
  );
}
