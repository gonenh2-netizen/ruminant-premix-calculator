/**
 * Terms of Use / Liability Disclaimer metadata.
 *
 * Every user who signs up must tick the "I accept" checkbox. The
 * acceptance is recorded to Firestore at users/{uid} with:
 *   - disclaimerVersion       : the value of DISCLAIMER_VERSION below
 *   - disclaimerAcceptedAt    : ISO timestamp
 *   - disclaimerLang          : the language the text was shown in at accept time
 *   - disclaimerEmail         : user email (redundant copy for audit)
 *
 * Bump DISCLAIMER_VERSION whenever the legal text changes substantively.
 * Existing accounts are unaffected (their acceptance record keeps the
 * version they originally agreed to). If you ever need to force
 * re-acceptance of a new version, add a re-acceptance gate that compares
 * the user's stored disclaimerVersion to DISCLAIMER_VERSION on login.
 */
export const DISCLAIMER_VERSION = '1.0';
export const DISCLAIMER_EFFECTIVE_DATE = '2026-04-23';
