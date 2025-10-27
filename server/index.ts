import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupVite } from './vite';
import { registerRoutes } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup routes
registerRoutes(app);

// Vite setup for development
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  await setupVite(app, server);
} else {
  // Production setup
  const staticPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(staticPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📦 Environment: ${isDev ? 'development' : 'production'}`);
  console.log('🎯 Chat is available at /');
});