export type Category = "camera" | "lens" | "audio" | "lighting" | "grip" | "accessory";
export type Status = "available" | "booked" | "damaged" | "retired";
export type BookingStatus = "active" | "returned" | "cancelled";
export type Severity = "minor" | "major" | "unusable";
export type RelationType = "required" | "standard" | "optional";
export type Priority = "must-have" | "nice-to-have";
export type ProjectType =
  | "narrative"
  | "documentary"
  | "product"
  | "interview"
  | "event"
  | "bts"
  | "sports"
  | "other";

export const CATEGORIES: Category[] = ["camera", "lens", "audio", "lighting", "grip", "accessory"];
export const PROJECT_TYPES: ProjectType[] = [
  "narrative", "documentary", "product", "interview", "event", "bts", "sports", "other",
];

export const STATUS_LABELS: Record<Status, string> = {
  available: "Available",
  booked: "Booked",
  damaged: "Damaged",
  retired: "Retired",
};

export const STATUS_COLORS: Record<Status, string> = {
  available: "bg-sage/30 text-teal border-sage/50",
  booked:    "bg-orange/10 text-orange border-orange/20",
  damaged:   "bg-pink-soft/40 text-magenta border-pink-soft",
  retired:   "bg-rule/30 text-muted border-rule",
};
