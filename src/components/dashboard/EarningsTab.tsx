import { formatNaira } from "@/lib/formatCurrency";
import type { TechnicianCredit } from "@/lib/types";
import type { TechnicianBalanceSummary } from "@/lib/types";
import styles from "@/app/dashboard/Dashboard.module.css";

const CREDIT_TYPE_LABELS: Record<TechnicianCredit["type"], string> = {
  booking_commission: "Booking commission (50%)",
  quote_commission: "Quote commission (70%)",
};

interface EarningsTabProps {
  credits: TechnicianCredit[];
  balanceSummary: TechnicianBalanceSummary;
}

export default function EarningsTab({ credits, balanceSummary }: EarningsTabProps) {
  return (
    <div className={styles.earningsLayout}>
      <div className={styles.earningsSummaryGrid}>
        <div className={`${styles.earningsSummaryCard} ${styles.earningsSummaryPrimary}`}>
          <span className={styles.earningsSummaryLabel}>Account balance</span>
          <p className={styles.earningsSummaryValue}>
            {formatNaira(balanceSummary.accountBalance)}
          </p>
          <span className={styles.earningsSummaryHint}>
            Includes 50% booking fees and 70% paid quote commissions
          </span>
        </div>
        <div className={styles.earningsSummaryCard}>
          <span className={styles.earningsSummaryLabel}>Quote commissions</span>
          <p className={styles.earningsSummaryValue} style={{ color: "var(--success)" }}>
            {formatNaira(balanceSummary.quoteCommissionTotal)}
          </p>
        </div>
        <div className={styles.earningsSummaryCard}>
          <span className={styles.earningsSummaryLabel}>Transactions</span>
          <p className={styles.earningsSummaryValue}>{balanceSummary.transactionCount}</p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.earningsListHeader}>
          <h2 className={styles.panelTitle}>Earnings ledger</h2>
          <span className="badge badge-info">{credits.length} credited</span>
        </div>

        {credits.length === 0 ? (
          <div className={styles.earningsEmpty}>
            <span style={{ fontSize: "2rem" }}>💰</span>
            <p>No earnings yet.</p>
            <p className={styles.earningsEmptySub}>
              You earn 50% of the booking fee when admin dispatches you, and 70% of a paid quote
              after the customer confirms job completion.
            </p>
          </div>
        ) : (
          <div className={styles.earningsList}>
            {credits.map((credit) => (
              <div key={credit.id} className={styles.earningsRow}>
                <div className={styles.earningsRowMain}>
                  <span
                    className={`badge ${
                      credit.type === "booking_commission" ? "badge-amber" : "badge-success"
                    }`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {CREDIT_TYPE_LABELS[credit.type]}
                  </span>
                  <p className={styles.earningsRowCustomer}>{credit.customerName}</p>
                  <span className={styles.earningsRequestId}>{credit.requestId}</span>
                </div>
                <div className={styles.earningsRowMeta}>
                  <p className={styles.earningsRowAmount}>{formatNaira(credit.amount)}</p>
                  <p className={styles.earningsRowSource}>
                    {formatNaira(credit.sourceAmount)} × {Math.round(credit.rate * 100)}%
                  </p>
                  <p className={styles.earningsRowTime}>
                    {new Date(credit.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
