import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import type { Tab } from "@/hooks/useTechnicianDashboard";
import styles from "@/app/dashboard/Dashboard.module.css";

interface DashboardHeaderProps {
  activeTab: Tab;
  completedJobCount: number;
}

export default function DashboardHeader({ activeTab, completedJobCount }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.pageTitle}>
          {activeTab === "job" && "Active Job"}
          {activeTab === "history" && "Job History"}
          {activeTab === "profile" && "Your Profile"}
        </h1>
        <p className={styles.pageSub}>
          {activeTab === "job" && "View and update your current rescue assignment."}
          {activeTab === "history" && `${completedJobCount} completed job${completedJobCount !== 1 ? "s" : ""} on record.`}
          {activeTab === "profile" && "Your fleet credentials and performance stats."}
        </p>
      </div>
      <div className={styles.headerActions}>
        <ThemeToggle className={styles.desktopThemeToggle} />
        <div className={styles.liveBadge}>
          <span className={styles.pulseDot} />
          Live sync · every 4s
        </div>
      </div>
    </header>
  );
}
