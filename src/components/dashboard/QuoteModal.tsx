"use client";

import { useEffect, useState } from "react";
import styles from "@/app/dashboard/Dashboard.module.css";

interface QuoteModalProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (assessment: string, amount: number) => Promise<{ ok: boolean; error?: string }>;
}

export default function QuoteModal({ open, submitting, onClose, onSubmit }: QuoteModalProps) {
  const [assessment, setAssessment] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setAssessment("");
    setAmount("");
    setError("");
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmed = assessment.trim();
    const parsed = Number(amount);
    if (trimmed.length < 20) {
      setError("Please describe the situation in at least 20 characters.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid quote amount greater than zero.");
      return;
    }
    setError("");
    const result = await onSubmit(trimmed, Math.round(parsed));
    if (!result.ok && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className={styles.quoteOverlay} onClick={() => !submitting && onClose()} role="presentation">
      <div
        className={styles.quoteModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
      >
        <div className={styles.quoteModalHeader}>
          <h2 id="quote-modal-title" className={styles.quoteModalTitle}>
            Submit Service Quote
          </h2>
          <button
            type="button"
            className={styles.quoteCloseBtn}
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.quoteModalBody}>
          <div className={styles.quoteField}>
            <label className="form-label" htmlFor="quote-assessment">
              Describe situation in detail
            </label>
            <textarea
              id="quote-assessment"
              className="form-input"
              rows={5}
              placeholder="Explain what you found on site, work required, parts needed, etc."
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.quoteField}>
            <label className="form-label" htmlFor="quote-amount">
              Quote amount (₦)
            </label>
            <input
              id="quote-amount"
              className="form-input"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              disabled={submitting}
            />
          </div>

          {error && (
            <p className={styles.quoteError} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.quoteModalFooter}>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="dot-pulse">
                <span />
                <span />
                <span />
              </span>
            ) : (
              "Submit quote for approval"
            )}
          </button>
          <button type="button" className="btn btn-outline w-full" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
