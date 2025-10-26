import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy endpoint for Cloudflare Worker
  // TODO: User needs to configure their actual Cloudflare Worker URL
  app.post("/api/chat", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "No query provided" });
      }

      // TODO: Replace with actual Cloudflare Worker endpoint
      // const workerUrl = process.env.CLOUDFLARE_WORKER_URL || 'https://your-worker.workers.dev/chat';
      
      // For now, return a mock response so the UI works
      // Once user provides their Worker URL, uncomment the fetch code below
      
      const mockResponse = {
        answer: "This is a demo response. To connect to your actual Cloudflare Worker, please configure the CLOUDFLARE_WORKER_URL environment variable with your Worker endpoint.",
        citations: [
          {
            key: "demo.md",
            title: "Demo Citation",
            url: "https://example.com/demo"
          }
        ]
      };
      
      return res.json(mockResponse);

      /* 
      // Uncomment this when ready to connect to actual Worker:
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      return res.json(data);
      */
    } catch (error: any) {
      console.error("Chat API error:", error);
      return res.status(500).json({ 
        error: error?.message || "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
