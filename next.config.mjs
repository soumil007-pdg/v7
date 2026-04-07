import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Walk up from this config file until we find a directory that owns
// node_modules/next. This pins Turbopack's workspace root so it does not
// silently pick a stray lockfile from a parent directory (e.g. $HOME).
function findWorkspaceRoot(start) {
  let dir = start;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'node_modules', 'next'))) return dir;
    dir = path.dirname(dir);
  }
  return start;
}

const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: findWorkspaceRoot(__dirname),
  },
};

export default withNextIntl(nextConfig);
