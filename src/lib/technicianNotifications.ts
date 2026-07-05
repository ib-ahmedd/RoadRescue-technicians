import { SERVICE_DETAILS } from "@/lib/constants";
import type { Dispute, RequestData, TechnicianCredit } from "@/lib/types";

export type TechnicianNotificationKind =
  | "new_assignment"
  | "new_dispute"
  | "dispute_status"
  | "payment_credited"
  | "quote_approved"
  | "quote_paid";

export interface TechnicianNotification {
  toastId: string;
  kind: TechnicianNotificationKind;
  title: string;
  message: string;
  entityId?: string;
}

export type TechnicianNotificationInput = Omit<TechnicianNotification, "toastId">;

export interface TechnicianDataSnapshot {
  requests: Map<
    string,
    {
      status: RequestData["status"];
      name: string;
      service: string;
      quoteStatus: NonNullable<RequestData["quoteStatus"]>;
      quoteAmount: number;
    }
  >;
  disputes: Map<
    string,
    {
      requestId: string;
      customerName: string;
      reason: string;
      status: Dispute["status"];
    }
  >;
  credits: Map<
    string,
    {
      type: TechnicianCredit["type"];
      amount: number;
      customerName: string;
      requestId: string;
    }
  >;
}

function formatDisputeStatus(status: Dispute["status"]): string {
  const labels: Record<Dispute["status"], string> = {
    open: "Open",
    reviewing: "Reviewing",
    resolved: "Resolved",
  };
  return labels[status] ?? status;
}

export function buildSnapshot(
  requests: RequestData[],
  disputes: Dispute[],
  credits: TechnicianCredit[],
  providerId: string
): TechnicianDataSnapshot {
  const assignedRequests = requests.filter((r) => r.assignedProvider?.id === providerId);
  const requestIds = new Set(assignedRequests.map((r) => r.id));

  return {
    requests: new Map(
      assignedRequests.map((r) => [
        r.id,
        {
          status: r.status,
          name: r.name,
          service: r.service,
          quoteStatus: r.quoteStatus ?? "none",
          quoteAmount: r.quoteAmount ?? 0,
        },
      ])
    ),
    disputes: new Map(
      disputes
        .filter((d) => requestIds.has(d.requestId))
        .map((d) => [
          d.id,
          {
            requestId: d.requestId,
            customerName: d.customerName,
            reason: d.reason,
            status: d.status,
          },
        ])
    ),
    credits: new Map(
      credits
        .filter((c) => c.providerId === providerId)
        .map((c) => [
          c.id,
          {
            type: c.type,
            amount: c.amount,
            customerName: c.customerName,
            requestId: c.requestId,
          },
        ])
    ),
  };
}

export function detectTechnicianChanges(
  prev: TechnicianDataSnapshot,
  next: TechnicianDataSnapshot,
  options?: { skipRequestIds?: Set<string> }
): TechnicianNotificationInput[] {
  const notifications: TechnicianNotificationInput[] = [];
  const skipRequestIds = options?.skipRequestIds ?? new Set<string>();

  for (const [id, req] of next.requests) {
    if (!prev.requests.has(id) && !skipRequestIds.has(id)) {
      const serviceLabel = SERVICE_DETAILS[req.service] || req.service;
      notifications.push({
        kind: "new_assignment",
        title: "New job assignment",
        message: `${req.name} • ${serviceLabel} • ${id}`,
        entityId: id,
      });
    }
  }

  for (const [id, dispute] of next.disputes) {
    if (!prev.disputes.has(id)) {
      notifications.push({
        kind: "new_dispute",
        title: "Dispute filed on your job",
        message: `${dispute.customerName} • ${dispute.requestId} • ${dispute.reason}`,
        entityId: dispute.requestId,
      });
    }
  }

  for (const [id, dispute] of next.disputes) {
    const previous = prev.disputes.get(id);
    if (!previous || previous.status === dispute.status) continue;

    notifications.push({
      kind: "dispute_status",
      title: "Dispute status updated",
      message: `${dispute.requestId}: ${formatDisputeStatus(previous.status)} → ${formatDisputeStatus(dispute.status)}`,
      entityId: dispute.requestId,
    });
  }

  for (const [id, req] of next.requests) {
    const previous = prev.requests.get(id);
    if (!previous) continue;

    if (previous.quoteStatus !== "approved" && req.quoteStatus === "approved") {
      const amount = req.quoteAmount > 0 ? ` • ₦${req.quoteAmount.toLocaleString("en-NG")}` : "";
      notifications.push({
        kind: "quote_approved",
        title: "Quote approved",
        message: `${req.name} • ${id}${amount}`,
        entityId: id,
      });
    }

    if (previous.quoteStatus !== "paid" && req.quoteStatus === "paid") {
      const amount = req.quoteAmount > 0 ? ` • ₦${req.quoteAmount.toLocaleString("en-NG")}` : "";
      notifications.push({
        kind: "quote_paid",
        title: "Quote payment received",
        message: `${req.name} • ${id}${amount}`,
        entityId: id,
      });
    }
  }

  for (const [id, credit] of next.credits) {
    if (!prev.credits.has(id)) {
      const typeLabel =
        credit.type === "booking_commission" ? "Booking commission" : "Quote commission";
      notifications.push({
        kind: "payment_credited",
        title: "Payment credited",
        message: `${typeLabel} • ₦${credit.amount.toLocaleString("en-NG")} • ${credit.customerName}`,
        entityId: credit.requestId,
      });
    }
  }

  return notifications;
}
