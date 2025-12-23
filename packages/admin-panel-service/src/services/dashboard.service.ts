import { AnalyticsClientService } from './analyticsClient.service';
import { PropertiesService } from './properties.service';
import { ROLES } from '../utils/permissions';
// import { AnalyticsService } from '../../analytics-service/src/services/analytics.service'; // Removed invalid import

// Correct approach: Dependency Injection or direct instantiation of clients
const analyticsClient = new AnalyticsClientService();
const propertiesService = new PropertiesService();

export class DashboardService {
    async getSummary(adminRole: string, token: string) {
        // Parallel fetch for dashboard
        const [analytics, properties] = await Promise.allSettled([
            analyticsClient.getDashboardSummary(token),
            propertiesService.getAllProperties(token)
        ]);

        return {
            analytics: analytics.status === 'fulfilled' ? analytics.value : null,
            propertyCount: properties.status === 'fulfilled' ? properties.value.length : 0,
            propertiesStatus: properties.status === 'fulfilled' ? this.aggregatePropertyStatus(properties.value) : {},
            role: adminRole
        };
    }

    private aggregatePropertyStatus(properties: any[]) {
        return properties.reduce((acc: any, curr: any) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
    }

    async getMonthlyOverview(token: string) {
        return await analyticsClient.getMonthlyStats(token);
    }
}
