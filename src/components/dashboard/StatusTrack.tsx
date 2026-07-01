import { STATUS_DISPLAY_FLOW, STATUS_LABELS } from "@/lib/constants";
import type { RequestStatus } from "@/lib/types";
import styles from "@/app/dashboard/Dashboard.module.css";

interface StatusTrackProps {
  currentStatus: RequestStatus;
}

export default function StatusTrack({ currentStatus }: StatusTrackProps) {
  return (
    <div className={styles.statusTrack}>
      {STATUS_DISPLAY_FLOW.map((step) => {
        const stepIdx = STATUS_DISPLAY_FLOW.indexOf(step);
        const currentIdx = STATUS_DISPLAY_FLOW.indexOf(
          currentStatus as (typeof STATUS_DISPLAY_FLOW)[number]
        );
        const isDone = currentIdx >= 0 && stepIdx < currentIdx;
        const isActive = step === currentStatus;
        return (
          <div
            key={step}
            className={`${styles.statusStep} ${isDone ? styles.statusStepDone : ""} ${isActive ? styles.statusStepActive : ""}`}
          >
            {STATUS_LABELS[step]}
          </div>
        );
      })}
    </div>
  );
}
