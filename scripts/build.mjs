import esbuild from 'esbuild';
import { build as viteBuild } from 'vite';

async function buildApp() {
  console.log('[Build] Starting unified client & server build...');

  // 1. Build Vite frontend SPA to dist/
  console.log('[Build] 1/2 Compiling Vite React frontend...');
  await viteBuild();

  // 2. Bundle Node.js Express server to dist/server.cjs
  console.log('[Build] 2/2 Bundling Express server with esbuild...');
  await esbuild.build({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
    outfile: 'dist/server.cjs',
  });

  console.log('[Build] ✨ Build completed successfully!');
}

buildApp().catch((err) => {
  console.error('[Build Error]', err?.message || err);
  process.exit(1);
});
