# Services Documentation

## TrendAnalysisService

The `TrendAnalysisService` analyzes question trends and concept importance based on historical GATE question data.

### Key Features

1. **Frequency Calculation**: Calculates how frequently each concept appears in the question bank
2. **Importance Scoring**: Computes importance based on frequency and recency (recent years weighted higher)
3. **Concept Ranking**: Ranks concepts by importance to help prioritize study topics
4. **Redis Caching**: Caches trend data for 24 hours to improve performance
5. **Automatic Updates**: Trends are automatically recalculated when new questions are added
6. **Scheduled Jobs**: Daily cron job at 2:00 AM recalculates all trends

### API Endpoints

- `GET /api/trends` - Get all trend data with rankings
- `GET /api/trends/rankings` - Get concept rankings only
- `GET /api/trends/concept/:conceptId` - Get trend data for specific concept
- `POST /api/trends/refresh` - Manually trigger trend recalculation (admin only)

### Methods

#### `analyzeTrends()`
Analyzes all concepts and calculates frequency, importance, and yearly distribution.

#### `getConceptRanking()`
Returns concepts ranked by importance score.

#### `getCachedTrends()`
Retrieves trend data from Redis cache or database if cache miss.

#### `updateTrendsWithNewData()`
Updates trends when new questions are added to the system.

#### `calculateImportance(frequency, yearlyDistribution)`
Calculates importance score using:
- Base frequency (70% weight)
- Recency bonus (30% weight) - exponential decay for older years

### Usage Example

```typescript
import { TrendAnalysisService } from './services/trendAnalysisService';

const trendService = new TrendAnalysisService();

// Get cached trends
const trends = await trendService.getCachedTrends();

// Manually trigger analysis
await trendService.analyzeTrends();

// Get rankings
const rankings = await trendService.getConceptRanking();
```

### Database Schema

The service uses the `concept_trends` table:
- `id`: UUID primary key
- `concept_id`: Foreign key to concepts table
- `frequency`: Decimal (0-1) representing question frequency
- `importance`: Decimal (0-1) representing calculated importance
- `yearly_distribution`: JSONB storing year -> count mapping
- `last_updated`: Timestamp of last calculation

### Caching Strategy

- Cache key: `trends:data`
- TTL: 24 hours
- Automatic invalidation on trend updates
- Fallback to database if Redis unavailable
