# SBOM-Analyzer Integration Guide

## Overview

This document describes how VendorSoluce integrates with the external SBOM-Analyzer service while preserving the standalone nature of both applications.

## Architecture

```
┌─────────────────────────────────┐
│   VendorSoluce Platform        │
│   (vendorsoluce.com-main)      │
│                                 │
│  ┌───────────────────────────┐  │
│  │  SBOM Integration Service │  │
│  │  (sbomIntegrationService) │  │
│  └───────────────────────────┘  │
│           │                      │
│           │ HTTP/REST API        │
│           ▼                      │
└─────────────────────────────────┘
           │
           │ JWT Token
           │ API Calls
           │
┌─────────────────────────────────┐
│   SBOM-Analyzer API Layer       │
│   (External Service)            │
│                                 │
│  ┌───────────────────────────┐  │
│  │  API Endpoints             │  │
│  │  - /api/v1/analyze         │  │
│  │  - /api/v1/results/:id     │  │
│  │  - /api/v1/history         │  │
│  └───────────────────────────┘  │
│           │                      │
│           │ Uses existing        │
│           ▼                      │
│  ┌───────────────────────────┐  │
│  │  SBOM-Analyzer Core       │  │
│  │  (UNCHANGED)              │  │
│  │  - realAnalysisService    │  │
│  │  - sbomParser             │  │
│  │  - realOSVService         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Key Principles

1. **No Changes to SBOM-Analyzer Core**: The SBOM-Analyzer application remains completely standalone and unchanged.

2. **API-First Integration**: VendorSoluce communicates with SBOM-Analyzer via HTTP REST API only.

3. **Independent Deployments**: Both services can be deployed and updated independently.

4. **Usage Tracking**: VendorSoluce tracks SBOM scan usage in its own system before calling the SBOM-Analyzer API.

## Setup

### 1. Environment Configuration

Add the following environment variables to your `.env` file:

```env
# SBOM-Analyzer API Base URL
VITE_SBOM_ANALYZER_API_URL=https://sbom-api.technosoluce.com

# SBOM-Analyzer API Key (optional)
VITE_SBOM_ANALYZER_API_KEY=your_api_key_here
```

### 2. Authentication

The integration uses JWT tokens from VendorSoluce's Supabase authentication:

- VendorSoluce generates JWT tokens for authenticated users
- These tokens are passed to SBOM-Analyzer API in the `Authorization` header
- SBOM-Analyzer validates tokens using a shared secret

### 3. Usage Tracking

Before calling the SBOM-Analyzer API, VendorSoluce:

1. Checks if the user has available SBOM scan quota
2. Increments usage counter after successful API submission
3. Tracks overage charges if limits are exceeded

## Usage

### Basic Integration

```typescript
import { useSBOMAnalysis } from '../hooks/useSBOMAnalysis';

function MyComponent() {
  const { analyzeSBOM, loading, error, progress } = useSBOMAnalysis({
    vendorId: 'vendor-123',
    assessmentId: 'assessment-456'
  });

  const handleFileUpload = async (file: File) => {
    try {
      const result = await analyzeSBOM(file, {
        includeDependencies: true,
        severityThreshold: 'LOW'
      });
      console.log('Analysis complete:', result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div>
      {loading && progress && (
        <div>
          <p>{progress.message}</p>
          <progress value={progress.percentage} max={100} />
        </div>
      )}
      {error && <div className="error">{error}</div>}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );
}
```

### Using the Integration Component

```typescript
import SBOMAnalysisIntegration from '../components/sbom/SBOMAnalysisIntegration';

function VendorAssessmentPage() {
  return (
    <SBOMAnalysisIntegration
      vendorId="vendor-123"
      assessmentId="assessment-456"
      onAnalysisComplete={(result) => {
        console.log('Analysis complete:', result);
      }}
    />
  );
}
```

## API Endpoints

### POST /api/v1/analyze

Analyze an SBOM file.

**Request:**
- `file`: File (multipart/form-data)
- `options`: JSON string with analysis options
- `metadata`: JSON string with vendor/assessment IDs

**Response:**
```json
{
  "jobId": "job-123",
  "status": "queued",
  "estimatedTime": 30
}
```

### GET /api/v1/analyze/:jobId

Get analysis job status and results.

**Response:**
```json
{
  "jobId": "job-123",
  "status": "processing",
  "progress": {
    "stage": "vulnerability_check",
    "percentage": 65,
    "message": "Analyzing components..."
  }
}
```

### GET /api/v1/results/:analysisId

Get completed analysis result.

**Response:**
```json
{
  "id": "analysis-123",
  "userId": "user-456",
  "metadata": {
    "filename": "sbom.json",
    "totalComponents": 150,
    "totalVulnerabilities": 12
  },
  "result": { /* SBOM analysis result */ }
}
```

### GET /api/v1/history

List analysis history for a user.

**Query Parameters:**
- `userId`: User ID
- `vendorId`: Optional vendor ID filter
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

### DELETE /api/v1/results/:analysisId

Delete an analysis result.

### GET /api/v1/health

Health check endpoint.

## Error Handling

The integration service handles errors gracefully:

- **Network Errors**: Retries with exponential backoff
- **Authentication Errors**: Redirects to login
- **Usage Limit Errors**: Shows upgrade prompt
- **API Errors**: Displays user-friendly error messages

## Usage Limits

SBOM scan limits are enforced by VendorSoluce before calling the API:

- **Free Tier**: 5 scans/month
- **Starter**: 20 scans/month
- **Professional**: 100 scans/month
- **Enterprise**: Unlimited
- **Federal**: Unlimited

Overage charges apply when limits are exceeded.

## Security

1. **JWT Authentication**: All API calls require valid JWT tokens
2. **HTTPS Only**: All communication must use HTTPS in production
3. **API Keys**: Optional API key for additional security layer
4. **Rate Limiting**: SBOM-Analyzer API implements rate limiting
5. **Input Validation**: File types and sizes are validated before upload

## Troubleshooting

### Service Unavailable

If the SBOM-Analyzer service is unavailable:

1. Check `VITE_SBOM_ANALYZER_API_URL` is correct
2. Verify the service is running
3. Check network connectivity
4. Review service health endpoint: `GET /api/v1/health`

### Authentication Errors

If you receive authentication errors:

1. Verify user is logged in to VendorSoluce
2. Check JWT token is valid and not expired
3. Verify shared secret matches between services

### Usage Limit Errors

If usage limits are reached:

1. Check current usage in VendorSoluce dashboard
2. Upgrade subscription tier
3. Purchase additional scan capacity

## Development

### Local Development

For local development, you can run SBOM-Analyzer API locally:

```bash
# In SBOM-Analyzer project
cd SBOM-Analyzer/api
npm run dev
# Service runs on http://localhost:3001
```

Then configure VendorSoluce:

```env
VITE_SBOM_ANALYZER_API_URL=http://localhost:3001
```

### Testing

The integration can be tested independently:

```typescript
import { SBOMIntegrationService } from '../services/sbomIntegrationService';

const service = new SBOMIntegrationService({
  apiBaseUrl: 'http://localhost:3001'
});

// Test health check
const health = await service.healthCheck();
console.log('Service health:', health);
```

## Future Enhancements

- [ ] WebSocket support for real-time progress updates
- [ ] Batch analysis support
- [ ] Analysis result caching
- [ ] Webhook notifications for completed analyses
- [ ] Integration with VendorSoluce assessment workflow

## Support

For issues or questions:

1. Check this documentation
2. Review API endpoint documentation
3. Contact support: support@vendorsoluce.com

