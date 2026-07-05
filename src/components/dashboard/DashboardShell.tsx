import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import type { Provider, RequestData } from "@/lib/types";
import type { Tab } from "@/hooks/useTechnicianDashboard";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import styles from "@/app/dashboard/Dashboard.module.css";

interface DashboardShellProps {
  provider: Provider;
  activeTab: Tab;
  activeJob: RequestData | null;
  completedJobCount: number;
  accountBalance: number;
  serverError: string | null;
  sidebarOpen: boolean;
  isOnline: boolean;
  isDispatched: boolean;
  isEngaged: boolean;
  isAvailabilityLocked: boolean;
  onTabChange: (tab: Tab) => void;
  onSidebarOpen: () => void;
  onSidebarClose: () => void;
  onToggleAvailability: () => void;
  onSignOut: () => void;
  children: ReactNode;
}

export default function DashboardShell({
  provider,
  activeTab,
  activeJob,
  completedJobCount,
  accountBalance,
  serverError,
  sidebarOpen,
  isOnline,
  isDispatched,
  isEngaged,
  isAvailabilityLocked,
  onTabChange,
  onSidebarOpen,
  onSidebarClose,
  onToggleAvailability,
  onSignOut,
  children,
}: DashboardShellProps) {
  return (
    <div className={styles.layout}>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={onSidebarClose} aria-hidden />
      )}

      <div className={styles.mobileHeader}>
        <button type="button" className={styles.menuBtn} onClick={onSidebarOpen} aria-label="Open menu">
          ☰
        </button>
        <span className={styles.brandName}>Technician Portal</span>
        <div className={styles.mobileHeaderActions}>
          <ThemeToggle />
          <span
            className={`badge ${
              isOnline
                ? "badge-success"
                : isDispatched
                  ? "badge-info"
                  : isEngaged
                    ? "badge-danger"
                    : "badge-danger"
            }`}
          >
            {provider.status}
          </span>
        </div>
      </div>

      <DashboardSidebar
        provider={provider}
        activeTab={activeTab}
        activeJob={activeJob}
        accountBalance={accountBalance}
        isOnline={isOnline}
        isEngaged={isEngaged}
        isAvailabilityLocked={isAvailabilityLocked}
        sidebarOpen={sidebarOpen}
        onTabChange={onTabChange}
        onClose={onSidebarClose}
        onToggleAvailability={onToggleAvailability}
        onSignOut={onSignOut}
      />

      <main className={styles.content}>
        <DashboardHeader
          activeTab={activeTab}
          completedJobCount={completedJobCount}
          accountBalance={accountBalance}
        />
        {serverError && <div className={styles.errorBanner}>{serverError}</div>}
        {children}
      </main>
    </div>
  );
}
