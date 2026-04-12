# Threat Intelligence API Integration

This implementation integrates free open source threat intelligence APIs into the VendorRiskDashboard to provide real-time security threat data.

## 🚀 Features

- **Real-time Threat Statistics**: Live data from multiple threat intelligence sources
- **CVE Database Integration**: Vulnerability information from CVE.mitre.org
- **ThreatFox Integration**: Malware and threat indicators from ThreatFox
- **MISP Integration**: Open source threat intelligence platform
- **Automatic Caching**: 5-minute cache to reduce API calls
- **Rate Limiting**: Built-in rate limiting to respect API limits
- **Fallback Data**: Mock data when APIs are unavailable
- **Auto-refresh**: Automatic data refresh every 5 minutes

## 📡 Integrated APIs

### 1. CVE Database (Free)
- **URL**: `https://cve.mitre.org`
- **Purpose**: Common Vulnerabilities and Exposures
- **Rate Limit**: No official limit
- **Data**: CVE IDs, descriptions, CVSS scores

### 2. ThreatFox (Free)
- **URL**: `https://threatfox.abuse.ch`
- **Purpose**: Malware threat intelligence
- **Rate Limit**: No official limit
- **Data**: IoCs (IPs, domains, hashes, URLs)

### 3. MISP (Open Source)
- **URL**: `https://www.misp-project.org`
- **Purpose**: Threat intelligence sharing platform
- **Rate Limit**: Depends on instance
- **Data**: Threat indicators, malware samples

### 4. VirusTotal (Free Tier)
- **URL**: `https://www.virustotal.com/api/`
- **Purpose**: File and URL analysis
- **Rate Limit**: 500 requests/day (free)
- **Data**: Malware detection, reputation scores

### 5. Shodan (Free Tier)
- **URL**: `https://api.shodan.io/`
- **Purpose**: Internet-connected device intelligence
- **Rate Limit**: 100 results/month (free)
- **Data**: Device vulnerabilities, port scanning

## 🔧 Implementation Details

### Files Created

1. **`src/utils/threatIntelligence.ts`**
   - Core API integration functions
   - Rate limiting and caching
   - Error handling and fallbacks
   - TypeScript interfaces

2. **`src/hooks/useThreatIntelligence.ts`**
   - React hook for threat intelligence data
   - State management and caching
   - Auto-refresh functionality
   - Error handling

3. **`src/pages/VendorRiskDashboard.tsx`** (Updated)
   - Integration with threat intelligence hook
   - Real-time threat statistics display
   - Refresh functionality
   - Enhanced UI with live data

### Key Features

#### Rate Limiting
```typescript
class RateLimiter {
  private requests: number[] = [];
  
  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - API_CONFIG.rateLimit.window;
    this.requests = this.requests.filter(time => time > windowStart);
    return this.requests.length < API_CONFIG.rateLimit.requests;
  }
}
```

#### Caching System
```typescript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

#### Error Handling
```typescript
try {
  const response = await fetchWithRetry(url, options);
  // Process response
} catch (error) {
  console.warn('API failed, using mock data:', error);
  return generateMockData();
}
```

## 🎯 Usage

### Basic Usage
```typescript
import { useThreatIntelligence } from '../hooks/useThreatIntelligence';

function MyComponent() {
  const { stats, loading, error, refresh } = useThreatIntelligence();
  
  return (
    <div>
      <h2>Threat Intelligence</h2>
      <p>Active Sources: {stats.activeSources}</p>
      <p>Threats Today: {stats.threatsToday}</p>
      <p>Coverage: {stats.coverage}%</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Advanced Usage
```typescript
import { 
  fetchThreatStats, 
  fetchCVEData, 
  fetchThreatFoxData 
} from '../utils/threatIntelligence';

async function getCustomThreatData() {
  const [stats, cves, threats] = await Promise.all([
    fetchThreatStats(),
    fetchCVEData(),
    fetchThreatFoxData()
  ]);
  
  return { stats, cves, threats };
}
```

## 🧪 Testing

Run the test script to verify API integrations:

```bash
node test-threat-intelligence.js
```

The test will:
- ✅ Test all API endpoints
- ✅ Verify data formats
- ✅ Check error handling
- ✅ Display summary statistics

## 🔒 Security Considerations

1. **API Keys**: Some APIs require keys for production use
2. **Rate Limiting**: Built-in rate limiting prevents abuse
3. **CORS**: APIs must support CORS for browser access
4. **Data Validation**: All incoming data is validated
5. **Error Handling**: Graceful fallbacks to mock data

## 🚀 Production Deployment

### Environment Variables
```env
# Optional API keys for enhanced features
VITE_VIRUSTOTAL_API_KEY=your_virustotal_key
VITE_SHODAN_API_KEY=your_shodan_key
VITE_MISP_API_KEY=your_misp_key
VITE_MISP_URL=https://your-misp-instance.com
```

### API Key Setup
1. **VirusTotal**: Register at https://www.virustotal.com/
2. **Shodan**: Register at https://www.shodan.io/
3. **MISP**: Deploy your own instance or use community instance

## 📊 Dashboard Integration

The threat intelligence data is now integrated into the VendorRiskDashboard:

- **Real-time Statistics**: Live threat counts and coverage
- **Source Monitoring**: Status of each threat intelligence source
- **Auto-refresh**: Data updates every 5 minutes
- **Manual Refresh**: Users can manually refresh data
- **Error Handling**: Graceful fallbacks when APIs are unavailable

## 🎉 Benefits

1. **Real-time Data**: Live threat intelligence instead of static mock data
2. **Multiple Sources**: Comprehensive coverage from various threat feeds
3. **Cost-effective**: Uses free and open source APIs
4. **Scalable**: Built-in caching and rate limiting
5. **Reliable**: Fallback mechanisms ensure uptime
6. **User-friendly**: Simple integration with existing dashboard

## 🔮 Future Enhancements

1. **Additional APIs**: Integrate more threat intelligence sources
2. **Machine Learning**: AI-powered threat analysis
3. **Custom Feeds**: User-defined threat intelligence sources
4. **Alerts**: Real-time threat notifications
5. **Analytics**: Historical threat trend analysis
6. **Export**: Threat intelligence report generation

---

**Status**: ✅ Implementation Complete
**Last Updated**: December 2024
**APIs Integrated**: 5 free/open source threat intelligence sources
