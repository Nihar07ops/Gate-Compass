import cron from 'node-cron';
import { TrendAnalysisService } from '../services/trendAnalysisService';

const trendService = new TrendAnalysisService();

/**
 * Schedule daily trend analysis recalculation
 * Runs every day at 2:00 AM
 */
export const scheduleTrendAnalysis = (): void => {
    // Run at 2:00 AM every day
    cron.schedule('0 2 * * *', async () => {
        console.log('Starting scheduled trend analysis...');
        try {
            await trendService.analyzeTrends();
            console.log('Trend analysis completed successfully');
        } catch (error) {
            console.error('Error during scheduled trend analysis:', error);
        }
    });

    console.log('Trend analysis cron job scheduled (daily at 2:00 AM)');
};

/**
 * Manually trigger trend analysis
 * Useful for admin operations
 */
export const triggerTrendAnalysis = async (): Promise<void> => {
    console.log('Manually triggering trend analysis...');
    await trendService.analyzeTrends();
    console.log('Trend analysis completed');
};
