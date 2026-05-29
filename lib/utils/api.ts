/**
 * lib/utils/api.ts — Client-side API Fetch Helper
 *
 * Centralises all client → Next.js API Route calls so that:
 *   1. The `/api` prefix is always prepended automatically
 *   2. `Content-Type: application/json` is always set
 *   3. Non-2xx responses consistently throw a typed Error
 *
 * Usage:
 *   const data = await apiCall('/appointments?patientId=xxx');
 *   const result = await apiCall('/appointments', { method: 'POST', body: JSON.stringify(payload) });
 *
 * Throws: Error with `response.statusText` on non-2xx — callers can catch and
 * display the message or swallow it depending on context.
 */
export const apiCall = async (
  endpoint: string,       // Path WITHOUT the /api prefix, e.g. '/appointments?patientId=abc'
  options: RequestInit = {} // Optional overrides: method, body, extra headers, etc.
) => {
  // Always prefix with /api — keeps call sites clean
  const url = `/api${endpoint}`;

  // Merge caller-supplied headers on top of the JSON default
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  // Throw on any non-2xx response so callers don't silently receive error HTML
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  // Automatically parse and return the JSON body
  return response.json();
};
