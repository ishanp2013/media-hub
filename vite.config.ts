import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { moderateStory } from './server/moderate';

/**
 * Backend endpoint: POST /api/moderate-story
 * Runs server-side only — the AI API key stays in .env and never reaches browser code.
 */
function moderateStoryPlugin(): Plugin {
  return {
    name: 'moderate-story-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/moderate-story')) return next();
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        try {
          const env = loadEnv(server.config.mode, process.cwd(), '');
          let body = '';
          for await (const chunk of req) body += chunk;
          const data = JSON.parse(body || '{}');
          const result = await moderateStory(
            {
              title: typeof data.title === 'string' ? data.title : '',
              text: typeof data.text === 'string' ? data.text : '',
              transcript: typeof data.transcript === 'string' ? data.transcript : '',
              hasVideo: !!data.hasVideo,
            },
            env
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Moderation failed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  void loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), moderateStoryPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
