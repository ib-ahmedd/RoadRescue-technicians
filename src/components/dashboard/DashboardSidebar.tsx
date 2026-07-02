import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { SERVICE_DETAILS } from "@/lib/constants";
import type { Provider, RequestData } from "@/lib/types";
import type { Tab } from "@/hooks/useTechnicianDashboard";
import styles from "@/app/dashboard/Dashboard.module.css";

interface DashboardSidebarProps {
  provider: Provider;
  activeTab: Tab;
  activeJob: RequestData | null;
  isOnline: boolean;
  isEngaged: boolean;
  isAvailabilityLocked: boolean;
  sidebarOpen: boolean;
  onTabChange: (tab: Tab) => void;
  onClose: () => void;
  onToggleAvailability: () => void;
  onSignOut: () => void;
}

export default function DashboardSidebar({
  provider,
  activeTab,
  activeJob,
  isOnline,
  isEngaged,
  isAvailabilityLocked,
  sidebarOpen,
  onTabChange,
  onClose,
  onToggleAvailability,
  onSignOut,
}: DashboardSidebarProps) {
  const selectTab = (tab: Tab) => {
    onTabChange(tab);
    onClose();
  };

  return (
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
          onClick={() => selectTab("job")}
        >
          🚨 Active Job
          {activeJob && <span className="badge badge-amber" style={{ marginLeft: "auto" }}>Live</span>}
        </button>
        <button
          type="button"
          className={`${styles.navItem} ${activeTab === "history" ? styles.navItemActive : ""}`}
          onClick={() => selectTab("history")}
        >
          📋 Job History
        </button>
        <button
          type="button"
          className={`${styles.navItem} ${activeTab === "profile" ? styles.navItemActive : ""}`}
          onClick={() => selectTab("profile")}
        >
          👤 Profile
        </button>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.themeRow}>
          <span>Appearance</span>
          <ThemeToggle />
        </div>
        <div className={styles.availabilityToggle}>
          <div>
            <div className={styles.availabilityLabel}>Availability</div>
            <div className={`${styles.availabilityStatus} ${isOnline ? "text-amber" : isEngaged ? "" : ""}`} style={isEngaged ? { color: "#f87171" } : undefined}>
              {provider.status}
            </div>
          </div>
          <button
            type="button"
            className={`${styles.toggle} ${isOnline ? styles.toggleOn : ""}`}
            onClick={onToggleAvailability}
            disabled={isAvailabilityLocked}
            aria-label="Toggle availability"
            title={
              isAvailabilityLocked
                ? isEngaged
                  ? "Cannot change availability while a dispute is active"
                  : "Cannot go offline while on a job"
                : undefined
            }
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-sm w-full" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
