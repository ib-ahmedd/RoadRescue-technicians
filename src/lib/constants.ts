export const SERVICE_DETAILS: Record<string, string> = {
  towing: "Towing",
  battery: "Battery Jump",
  "flat-tire": "Flat Tire Change",
  fuel: "Fuel Delivery",
  lockout: "Lockout Service",
  repair: "Minor Repair",
};

export const SERVICE_ICONS: Record<string, string> = {
  towing: "🚛",
  battery: "🔋",
  "flat-tire": "🔧",
  fuel: "⛽",
  lockout: "🔑",
  repair: "🔩",
};

export const STATUS_LABELS: Record<string, string> = {
  matched: "Matched",
  "en-route": "En Route",
  arrived: "Arrived",
  completed: "Completed",
};

export const STATUS_FLOW = ["matched", "en-route", "arrived"] as const;

/** Full lifecycle including customer-confirmed completion (display only). */
export const STATUS_DISPLAY_FLOW = ["matched", "en-route", "arrived", "completed"] as const;

export const SESSION_KEY = "roadrescue_technician_id";
