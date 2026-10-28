/**
 * Package-manager guard. This project is pnpm-only.
 *
 * A stray `npm install` creates a package-lock.json, flattens the dependency
 * tree differently from pnpm's strict node_modules, and silently produces a
 * build that does not match the lockfile. Cheaper to refuse than to debug.
 *
 * Wired to `preinstall`, so it runs before anything is written to disk.
 */
const userAgent = process.env.npm_config_user_agent ?? '';

if (!userAgent.startsWith('pnpm/')) {
  const attempted = userAgent.split('/')[0] || 'unknown';
  console.error('');
  console.error(`  ✗  This project is pnpm-only. Blocked "${attempted}".`);
  console.error('');
  console.error('     pnpm install');
  console.error('');
  console.error('     (also: pnpm dev · pnpm build · pnpm add <pkg>)');
  console.error('');
  process.exit(1);
}
