import "server-only";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// Allow the app to boot without Stripe configured (e.g. local dev before
// keys are added) — routes that need it check for null and respond clearly
// instead of crashing the whole server on import.
// No explicit apiVersion pinned here — Stripe's SDK type defs are tied to a
// specific version string that changes over time. Pin one explicitly once
// you've set up your Stripe account and confirmed the version in the
// dashboard, so upgrades are a deliberate choice rather than automatic.
export const stripe = key ? new Stripe(key) : null;
