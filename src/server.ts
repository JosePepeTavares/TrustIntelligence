import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PORT } from './config/env';
import openaiRoutes from './routes/openai';

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Trust Intelligence API is running' });
});

// API routes
app.use('/api', openaiRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start server
const serverPort = parseInt(PORT, 10);
app.listen(serverPort, () => {
  console.log(`🚀 Trust Intelligence API server running on port ${serverPort}`);
  console.log(`📍 Health check: http://localhost:${serverPort}/health`);
  console.log(`📍 API endpoints: http://localhost:${serverPort}/api`);
});

