import type {
  TechnicianNotification,
  TechnicianNotificationKind,
} from "@/lib/technicianNotifications";
import styles from "./TechnicianToastStack.module.css";

interface TechnicianToastStackProps {
  notifications: TechnicianNotification[];
  onDismiss: (toastId: string) => void;
  onNavigate: (notification: TechnicianNotification) => void;
}

const KIND_CONFIG: Record<
  TechnicianNotificationKind,
  { icon: string; accentClass: string }
> = {
  new_assignment: { icon: "🚨", accentClass: styles.accentAmber },
  new_dispute: { icon: "⚠️", accentClass: styles.accentDanger },
  dispute_status: { icon: "🔄", accentClass: styles.accentInfo },
  payment_credited: { icon: "💰", accentClass: styles.accentSuccess },
  quote_approved: { icon: "✅", accentClass: styles.accentAmber },
  quote_paid: { icon: "💳", accentClass: styles.accentSuccess },
};

export default function TechnicianToastStack({
  notifications,
  onDismiss,
  onNavigate,
}: TechnicianToastStackProps) {
  if (notifications.length === 0) return null;

  return (
    <div className={styles.stack} aria-live="polite" aria-relevant="additions">
      {notifications.map((notification) => {
        const config = KIND_CONFIG[notification.kind];
        return (
          <div
            key={notification.toastId}
            role="status"
            className={`${styles.toast} ${config.accentClass}`}
          >
            <button
              type="button"
              className={styles.toastBody}
              onClick={() => onNavigate(notification)}
            >
              <span className={styles.icon} aria-hidden>
                {config.icon}
              </span>
              <span className={styles.content}>
                <span className={styles.title}>{notification.title}</span>
                <span className={styles.message}>{notification.message}</span>
              </span>
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Dismiss notification"
              onClick={() => onDismiss(notification.toastId)}
            >
              ×
            </button>
            <span className={styles.progress} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}
