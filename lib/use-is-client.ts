import { useSyncExternalStore } from "react";

// The idiomatic zero-effect way to know "has this component hydrated on the
// client yet" — used for anything that must render the same markup on the
// server as on first client paint (e.g. reading localStorage or the user's
// OS theme), then switch over once hydrated. Avoids the classic
// useState(false) + useEffect(() => setState(true)) pattern, which causes
// an extra synchronous render pass.
function subscribe() {
  return () => {};
}

export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
