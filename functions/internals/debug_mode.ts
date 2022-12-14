export function isDebugMode(env: Record<string, string>) {
  if (env.DEBUG_MODE) {
    return env.DEBUG_MODE === "true";
  }
  return true;
}
