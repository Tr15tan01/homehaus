// Kept separate from lib/auth.ts on purpose: middleware.ts runs on the Edge
// runtime, which doesn't support Node builtins like `node:crypto`. Importing
// the full auth module from middleware would pull bcrypt/crypto into the
// edge bundle and break the build. Middleware only ever needs to check
// whether this cookie is present — everything else stays in lib/auth.ts.
export const SESSION_COOKIE_NAME = "homehaus_session";
