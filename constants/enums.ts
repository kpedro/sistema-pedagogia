export const USER_ROLE = {
  ADMIN: "ADMIN",
  GESTOR: "GESTOR",
  SUBGESTOR: "SUBGESTOR",
  PEDAGOGO: "PEDAGOGO",
  PROFESSOR: "PROFESSOR"
} as const;
export const USER_ROLES = Object.values(USER_ROLE);
export type UserRole = (typeof USER_ROLES)[number];

export const OCCURRENCE_CATEGORY = {
  INDISCIPLINA: "INDISCIPLINA",
  ATRASO_FALTA: "ATRASO_FALTA",
  CONFLITO: "CONFLITO",
  PEDAGOGICA: "PEDAGOGICA",
  PATRIMONIO: "PATRIMONIO",
  SAUDE_BEM_ESTAR: "SAUDE_BEM_ESTAR"
} as const;
export const OCCURRENCE_CATEGORIES = Object.values(OCCURRENCE_CATEGORY);
export type OccurrenceCategory = (typeof OCCURRENCE_CATEGORIES)[number];

export const OCCURRENCE_STATUS_ENUM = {
  OPEN: "OPEN",
  IN_REVIEW: "IN_REVIEW",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED"
} as const;
export const OCCURRENCE_STATUS = Object.values(OCCURRENCE_STATUS_ENUM);
export type OccurrenceStatus = (typeof OCCURRENCE_STATUS)[number];

export const DOCUMENT_STATUS_ENUM = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  APPROVED: "APPROVED",
  ARCHIVED: "ARCHIVED"
} as const;
export const DOCUMENT_STATUS = Object.values(DOCUMENT_STATUS_ENUM);
export type DocumentStatus = (typeof DOCUMENT_STATUS)[number];

export const INTERVENTION_STATUS_ENUM = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;
export const INTERVENTION_STATUS = Object.values(INTERVENTION_STATUS_ENUM);
export type InterventionStatus = (typeof INTERVENTION_STATUS)[number];

export const BOOKING_TYPE = {
  LESSON: "LESSON",
  EVENT: "EVENT",
  RESERVATION: "RESERVATION"
} as const;
export const BOOKING_TYPES = Object.values(BOOKING_TYPE);
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUS_ENUM = {
  CONFIRMED: "CONFIRMED",
  CONFLICT: "CONFLICT",
  OVERRIDDEN: "OVERRIDDEN",
  CANCELLED: "CANCELLED"
} as const;
export const BOOKING_STATUS = Object.values(BOOKING_STATUS_ENUM);
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const AUDIT_ACTION = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  OVERRIDE: "OVERRIDE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  RUN_RISK_RULES: "RUN_RISK_RULES",
  IMPORT: "IMPORT",
  SEND: "SEND",
  UPLOAD: "UPLOAD",
  STATUS_CHANGE: "STATUS_CHANGE"
} as const;
export const AUDIT_ACTIONS = Object.values(AUDIT_ACTION);
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const RISK_ALERT_STATUS_ENUM = {
  OPEN: "OPEN",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  RESOLVED: "RESOLVED"
} as const;
export const RISK_ALERT_STATUS = Object.values(RISK_ALERT_STATUS_ENUM);
export type RiskAlertStatus = (typeof RISK_ALERT_STATUS)[number];

export const CONTENT_STATUS_ENUM = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  READY: "READY",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
} as const;
export const CONTENT_STATUS = Object.values(CONTENT_STATUS_ENUM);
export type ContentStatus = (typeof CONTENT_STATUS)[number];

export const MEDIA_TYPE = {
  AUDIO: "AUDIO",
  VIDEO: "VIDEO"
} as const;
export const MEDIA_TYPES = Object.values(MEDIA_TYPE);
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_PROCESSING_STATUS_ENUM = {
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED"
} as const;
export const MEDIA_PROCESSING_STATUS = Object.values(MEDIA_PROCESSING_STATUS_ENUM);
export type MediaProcessingStatus = (typeof MEDIA_PROCESSING_STATUS)[number];
