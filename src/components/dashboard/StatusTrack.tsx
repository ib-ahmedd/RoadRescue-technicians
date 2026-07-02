import { STATUS_DISPLAY_FLOW, STATUS_LABELS } from "@/lib/constants";
import type { RequestStatus } from "@/lib/types";
import styles from "@/app/dashboard/Dashboard.module.css";

interface StatusTrackProps {
  currentStatus: RequestStatus;
}

export default function StatusTrack({ currentStatus }: StatusTrackProps) {
  const isDisputed = currentStatus === "disputed";
  const effectiveStatus = isDisputed ? "completed" : currentStatus;
  const currentIdx = STATUS_DISPLAY_FLOW.indexOf(
    effectiveStatus as (typeof STATUS_DISPLAY_FLOW)[number]
  );

  return (
    <div className={styles.statusTrack}>
      {STATUS_DISPLAY_FLOW.map((step) => {
        const stepIdx = STATUS_DISPLAY_FLOW.indexOf(step);
        const isDone = currentIdx >= 0 && stepIdx < currentIdx;
        const isActive =
          step === effectiveStatus ||
          (step === "completed" && isDisputed);
        const label =
          step === "completed" && isDisputed
            ? STATUS_LABELS.disputed
            : STATUS_LABELS[step];
        const activeClass = isActive
          ? isDisputed
            ? styles.statusStepDisputed
            : styles.statusStepActive
          : "";
        return (
          <div
            key={step}
            className={`${styles.statusStep} ${isDone ? styles.statusStepDone : ""} ${activeClass}`}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
