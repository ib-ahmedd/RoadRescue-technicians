"use client";

import ActiveJobTab from "@/components/dashboard/ActiveJobTab";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EarningsTab from "@/components/dashboard/EarningsTab";
import JobHistoryTab from "@/components/dashboard/JobHistoryTab";
import ProfileTab from "@/components/dashboard/ProfileTab";
import TechnicianToastStack from "@/components/notifications/TechnicianToastStack";
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
    isEngaged,
    isAvailabilityLocked,
    nextStatus,
    statusUpdating,
    handleToggleAvailability,
    handleAdvanceStatus,
    handleSubmitQuote,
    handleMarkComplete,
    handleSignOut,
    quoteSubmitting,
    completionSubmitting,
    credits,
    balanceSummary,
    notifications,
    dismissNotification,
    handleNotificationNavigate,
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
    <>
      <TechnicianToastStack
        notifications={notifications}
        onDismiss={dismissNotification}
        onNavigate={handleNotificationNavigate}
      />
      <DashboardShell
      provider={provider}
      activeTab={activeTab}
      activeJob={activeJob}
      completedJobCount={completedJobs.length}
      accountBalance={balanceSummary.accountBalance}
      serverError={serverError}
      sidebarOpen={sidebarOpen}
      isOnline={isOnline}
      isDispatched={isDispatched}
      isEngaged={isEngaged}
      isAvailabilityLocked={isAvailabilityLocked}
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
          isAvailabilityLocked={isAvailabilityLocked}
          nextStatus={nextStatus}
          statusUpdating={statusUpdating}
          quoteSubmitting={quoteSubmitting}
          completionSubmitting={completionSubmitting}
          onToggleAvailability={handleToggleAvailability}
          onAdvanceStatus={handleAdvanceStatus}
          onSubmitQuote={handleSubmitQuote}
          onMarkComplete={handleMarkComplete}
        />
      )}
      {activeTab === "history" && <JobHistoryTab completedJobs={completedJobs} />}
      {activeTab === "earnings" && (
        <EarningsTab credits={credits} balanceSummary={balanceSummary} />
      )}
      {activeTab === "profile" && <ProfileTab provider={provider} />}
    </DashboardShell>
    </>
  );
}
