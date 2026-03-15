import { defineConfig, type Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev proxy for /api/ai — mimics the Vercel serverless function
function apiProxy(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const token = process.env.GITHUB_AI_TOKEN || '';
        if (!token) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Set GITHUB_AI_TOKEN in .env.local' }));
          return;
        }

        let body = '';
        for await (const chunk of req) body += chunk;
        const { messages, max_tokens = 500 } = JSON.parse(body);

        try {
          const apiRes = await fetch('https://models.inference.ai.azure.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens }),
          });
          const data = await apiRes.text();
          res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
          res.end(data);
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'AI proxy error' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GITHUB_AI_TOKEN = env.GITHUB_AI_TOKEN || '';
  return {
    plugins: [react(), apiProxy()],
  };
})
