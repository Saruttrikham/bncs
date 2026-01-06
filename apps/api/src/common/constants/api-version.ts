/**
 * API Version constants
 * Use semantic versioning: v1, v2, etc.
 */
export const API_VERSION = {
  V1: "1",
} as const;

export type ApiVersion = (typeof API_VERSION)[keyof typeof API_VERSION];

