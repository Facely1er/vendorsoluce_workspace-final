# SBOM-Analyzer API Backend Setup Guide

## Overview

This guide describes how to add an API backend layer to SBOM-Analyzer to enable integration with VendorSoluce while preserving the standalone nature of the application.

## Architecture

The API layer wraps the existing SBOM-Analyzer services without modifying them:

```
SBOM-Analyzer/
├── api/                    # NEW - API Layer
│   ├── server.ts          # Express/Fastify server
│   ├── routes/
│   │   ├── analyze.ts     # Analysis endpoints
│   │   ├── results.ts     # Results endpoints
│   │   └── health.ts      # Health check
│   ├── middleware/
│   │   ├── auth.ts        # JWT validation
│   │   └── rateLimit.ts   # Rate limiting
│   └── services/
│       └── analysisQueue.ts  # Job queue
├── src/                    # EXISTING - Unchanged
│   ├── services/          # All existing services
│   ├── components/        # All existing components
│   └── ...
└── package.json           # Add API dependencies
```

## Implementation Steps

### Step 1: Install Dependencies

Add to `SBOM-Analyzer/package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0"
  }
}
```

### Step 2: Create API Server Structure

#### `api/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import analyzeRoutes from './routes/analyze';
import resultsRoutes from './routes/results';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.use('/api/v1/health', healthRoutes);

// Protected routes
app.use('/api/v1/analyze', authMiddleware, rateLimitMiddleware, analyzeRoutes);
app.use('/api/v1/results', authMiddleware, resultsRoutes);
app.use('/api/v1/history', authMiddleware, resultsRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`SBOM-Analyzer API server running on port ${PORT}`);
});
```

#### `api/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    vendorSoluceUserId: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      req.user = {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        vendorSoluceUserId: decoded.vendorSoluceUserId || decoded.sub
      };
      
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
```

#### `api/middleware/rateLimit.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.id || req.ip;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + windowMs
    });
    return next();
  }

  if (userLimit.count >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.'
    });
  }

  userLimit.count++;
  next();
}
```

#### `api/routes/analyze.ts`

```typescript
import { Router } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth';
import { analysisQueue } from '../services/analysisQueue';
import { RealAnalysisService } from '../../src/services/realAnalysisService';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// POST /api/v1/analyze
router.post('/', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    // Create analysis job
    const jobId = await analysisQueue.enqueue({
      userId: req.user!.id,
      file: req.file,
      options,
      metadata: {
        ...metadata,
        vendorSoluceUserId: req.user!.vendorSoluceUserId
      }
    });

    res.status(202).json({
      jobId,
      status: 'queued',
      estimatedTime: 30 // seconds
    });
  } catch (error: any) {
    console.error('Error creating analysis job:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/analyze/:jobId
router.get('/:jobId', async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;
    const job = await analysisQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check authorization
    if (job.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error
    });
  } catch (error: any) {
    console.error('Error getting job status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### `api/routes/results.ts`

```typescript
import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analysisQueue } from '../services/analysisQueue';
// Import your database service here
// import { db } from '../services/database';

const router = Router();

// GET /api/v1/results/:analysisId
router.get('/:analysisId', async (req: AuthRequest, res) => {
  try {
    const { analysisId } = req.params;
    
    // Get result from database or job queue
    // This is a placeholder - implement based on your storage solution
    const result = await analysisQueue.getResult(analysisId);

    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check authorization
    if (result.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error getting result:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/history
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.query.userId as string || req.user!.id;
    const vendorId = req.query.vendorId as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get history from database
    // This is a placeholder - implement based on your storage solution
    const history = await analysisQueue.getHistory({
      userId,
      vendorId,
      limit,
      offset
    });

    res.json(history);
  } catch (error: any) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/results/:analysisId
router.delete('/:analysisId', async (req: AuthRequest, res) => {
  try {
    const { analysisId } = req.params;
    
    // Delete from database
    // This is a placeholder - implement based on your storage solution
    await analysisQueue.deleteResult(analysisId, req.user!.id);

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting result:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### `api/routes/health.ts`

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/v1/health
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

#### `api/services/analysisQueue.ts`

```typescript
import { RealAnalysisService } from '../../src/services/realAnalysisService';
import { File } from 'multer';

interface AnalysisJob {
  id: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: {
    stage: string;
    percentage: number;
    message: string;
    currentComponent?: string;
  };
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class AnalysisQueue {
  private jobs: Map<string, AnalysisJob> = new Map();
  private processing: Set<string> = new Set();

  async enqueue(data: {
    userId: string;
    file: File;
    options: any;
    metadata: any;
  }): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: AnalysisJob = {
      id: jobId,
      userId: data.userId,
      status: 'queued',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.set(jobId, job);

    // Process asynchronously
    this.processJob(jobId, data);

    return jobId;
  }

  private async processJob(
    jobId: string,
    data: {
      userId: string;
      file: File;
      options: any;
      metadata: any;
    }
  ) {
    if (this.processing.has(jobId)) {
      return;
    }

    this.processing.add(jobId);
    const job = this.jobs.get(jobId);
    
    if (!job) {
      this.processing.delete(jobId);
      return;
    }

    try {
      job.status = 'processing';
      job.updatedAt = new Date();

      // Convert multer file to File object
      const file = new File([data.file.buffer], data.file.originalname, {
        type: data.file.mimetype
      });

      // Use existing RealAnalysisService
      const result = await RealAnalysisService.analyzeSBOM(
        file,
        data.options,
        (progress) => {
          job.progress = {
            stage: progress.stage,
            percentage: progress.progress,
            message: progress.message,
            currentComponent: progress.currentComponent
          };
          job.updatedAt = new Date();
        }
      );

      job.status = 'completed';
      job.result = result;
      job.updatedAt = new Date();
    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
      job.updatedAt = new Date();
    } finally {
      this.processing.delete(jobId);
    }
  }

  async getJob(jobId: string): Promise<AnalysisJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async getResult(analysisId: string): Promise<any> {
    const job = this.jobs.get(analysisId);
    if (job && job.status === 'completed') {
      return {
        id: analysisId,
        userId: job.userId,
        metadata: job.result?.metadata,
        result: job.result,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString()
      };
    }
    return null;
  }

  async getHistory(options: {
    userId: string;
    vendorId?: string;
    limit: number;
    offset: number;
  }): Promise<any> {
    const jobs = Array.from(this.jobs.values())
      .filter(job => job.userId === options.userId)
      .filter(job => job.status === 'completed')
      .slice(options.offset, options.offset + options.limit);

    return {
      analyses: jobs.map(job => ({
        id: job.id,
        filename: job.result?.metadata?.filename || 'unknown',
        metadata: job.result?.metadata,
        createdAt: job.createdAt.toISOString()
      })),
      total: jobs.length,
      limit: options.limit,
      offset: options.offset
    };
  }

  async deleteResult(analysisId: string, userId: string): Promise<void> {
    const job = this.jobs.get(analysisId);
    if (job && job.userId === userId) {
      this.jobs.delete(analysisId);
    }
  }
}

export const analysisQueue = new AnalysisQueue();
```

### Step 3: Environment Configuration

Create `api/.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret (shared with VendorSoluce)
JWT_SECRET=your_shared_secret_key_here

# Database (if using Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### Step 4: Update package.json Scripts

Add to `SBOM-Analyzer/package.json`:

```json
{
  "scripts": {
    "api:dev": "ts-node api/server.ts",
    "api:build": "tsc api/server.ts --outDir dist/api",
    "api:start": "node dist/api/server.js"
  }
}
```

## Deployment

### Option 1: Standalone API Server

Deploy the API server separately:

```bash
cd SBOM-Analyzer
npm run api:build
npm run api:start
```

### Option 2: Integrated with Frontend

Use a reverse proxy (nginx) to serve both:

```nginx
server {
    listen 80;
    server_name sbom-api.technosoluce.com;

    location /api {
        proxy_pass http://localhost:3001;
    }

    location / {
        root /path/to/sbom-analyzer/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Analyze (with JWT token)
curl -X POST http://localhost:3001/api/v1/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sbom.json" \
  -F "options={\"includeDependencies\":true}"
```

## Security Considerations

1. **JWT Secret**: Use a strong, shared secret between VendorSoluce and SBOM-Analyzer
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **File Validation**: Validate file types and sizes
5. **Input Sanitization**: Sanitize all user inputs

## Notes

- This API layer does NOT modify any existing SBOM-Analyzer code
- All existing services remain unchanged
- The application can still run standalone without the API
- The API is an optional add-on for integration purposes

