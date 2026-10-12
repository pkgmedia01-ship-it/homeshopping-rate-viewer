type RuntimeEnv = Record<string, string | undefined>;
export function isSyntheticMode(env: RuntimeEnv = process.env): boolean {
  return env.LOCAL_SYNTHETIC_MODE === 'true' && (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') && !env.VERCEL;
}
export function assertSyntheticMode(env: RuntimeEnv = process.env): void {
  if (env.LOCAL_SYNTHETIC_MODE === 'true' && !isSyntheticMode(env)) throw new Error('Synthetic bypass refused outside local development/test');
}

export function isPublicDemoMode(env: RuntimeEnv = process.env): boolean {
  return env.PUBLIC_DEMO_MODE === 'true';
}

export function isRuntimeDataMode(env: RuntimeEnv = process.env): boolean {
  return isSyntheticMode(env) || isPublicDemoMode(env);
}

export function assertRuntimeDataMode(env: RuntimeEnv = process.env): void {
  assertSyntheticMode(env);
  if (env.LOCAL_SYNTHETIC_MODE === 'true' && env.PUBLIC_DEMO_MODE === 'true') throw new Error('Local synthetic and public demo modes are mutually exclusive');
}
