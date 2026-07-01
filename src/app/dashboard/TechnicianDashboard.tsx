"use client";

import ActiveJobTab from "@/components/dashboard/ActiveJobTab";
import DashboardShell from "@/components/dashboard/DashboardShell";
import JobHistoryTab from "@/components/dashboard/JobHistoryTab";
import ProfileTab from "@/components/dashboard/ProfileTab";
import { useTechnicianDashboard } from "@/hooks/useTechnicianDashboard";
import styles from "./Dashboard.module.css";

export default function TechnicianDashboard() {
  const {
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
    isOnline,
    isDispatched,
    nextStatus,
    statusUpdating,
    handleToggleAvailability,
    handleAdvanceStatus,
    handleSubmitQuote,
    handleSignOut,
    quoteSubmitting,
  } = useTechnicianDashboard();

  if (!sessionId || (loading && !provider)) {
    return (
      <div className={styles.loadingScreen}>
        <span className="dot-pulse"><span /><span /><span /></span>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <DashboardShell
      provider={provider}
      activeTab={activeTab}
      activeJob={activeJob}
      completedJobCount={completedJobs.length}
      serverError={serverError}
      sidebarOpen={sidebarOpen}
      isOnline={isOnline}
      isDispatched={isDispatched}
      onTabChange={setActiveTab}
      onSidebarOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
      onToggleAvailability={handleToggleAvailability}
      onSignOut={handleSignOut}
    >
      {activeTab === "job" && (
        <ActiveJobTab
          provider={provider}
          completedJobs={completedJobs}
          activeJob={activeJob}
          isOnline={isOnline}
          isDispatched={isDispatched}
          nextStatus={nextStatus}
          statusUpdating={statusUpdating}
          quoteSubmitting={quoteSubmitting}
          onToggleAvailability={handleToggleAvailability}
          onAdvanceStatus={handleAdvanceStatus}
          onSubmitQuote={handleSubmitQuote}
        />
      )}
      {activeTab === "history" && <JobHistoryTab completedJobs={completedJobs} />}
      {activeTab === "profile" && <ProfileTab provider={provider} />}
    </DashboardShell>
  );
}
