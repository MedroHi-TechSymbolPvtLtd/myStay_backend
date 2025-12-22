import { prisma } from '../prisma';
import { cacheService } from './cache.service';
import { calculatePercentage } from '../utils/number.utils';

const CACHE_TTL_SUMMARY = 120;
const CACHE_TTL_MONTHLY = 300;

export const analyticsService = {
    async getAdminSummary() {
        const cacheKey = 'admin:summary';
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        // Parallel execution for dashboard metrics
        const [
            totalRevenueAgg,
            totalExpensesAgg,
            totalProperties,
            totalRooms,
            occupiedRooms,
            totalEnrollments,
            totalActiveUsers
        ] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: { type: 'rent', status: 'paid' }
            }),
            prisma.expense.aggregate({
                _sum: { amount: true }
            }),
            prisma.property.count(),
            prisma.room.count(),
            prisma.room.count({ where: { status: 'occupied' } }),
            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { status: 'active' } })
        ]);

        const totalRevenue = Number(totalRevenueAgg._sum.amount || 0);
        const totalExpenses = Number(totalExpensesAgg._sum.amount || 0);
        const totalProfit = totalRevenue - totalExpenses;
        const vacantRooms = totalRooms - occupiedRooms;

        // Pending Dues
        const pendingDuesAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'due', status: 'pending' }
        });
        const pendingDues = Number(pendingDuesAgg._sum.amount || 0);

        const result = {
            totalRevenue,
            totalExpenses,
            totalProfit,
            totalProperties,
            totalRooms,
            occupiedRooms,
            vacantRooms,
            totalCustomers: totalActiveUsers, // Assuming active enrollments map to customers roughly
            pendingDues,
            occupancyRate: calculatePercentage(occupiedRooms, totalRooms)
        };

        await cacheService.set(cacheKey, result, CACHE_TTL_SUMMARY);
        return result;
    },

    async getMonthlyTrends(year?: number) {
        const currentYear = year || new Date().getFullYear();
        const cacheKey = `admin:monthly:${currentYear}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        // Use raw query for efficient date truncation and grouping
        // Note: This matches the structure of the schema defined.
        // Ensure postgres is used for date_trunc
        const revenueData = await prisma.$queryRaw`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(amount) as revenue
      FROM transactions
      WHERE type = 'rent' AND status = 'paid' AND EXTRACT(YEAR FROM created_at) = ${currentYear}
      GROUP BY month
      ORDER BY month ASC
    `;

        const expenseData = await prisma.$queryRaw`
      SELECT TO_CHAR(expense_date, 'YYYY-MM') as month, SUM(amount) as expenses
      FROM expenses
      WHERE EXTRACT(YEAR FROM expense_date) = ${currentYear}
      GROUP BY month
      ORDER BY month ASC
    `;

        // Merge data
        const monthlyMap = new Map<string, { revenue: number; expenses: number; profit: number }>();

        (revenueData as any[]).forEach((row) => {
            const month = row.month;
            const rev = Number(row.revenue);
            if (!monthlyMap.has(month)) monthlyMap.set(month, { revenue: 0, expenses: 0, profit: 0 });
            const entry = monthlyMap.get(month)!;
            entry.revenue = rev;
            entry.profit += rev;
        });

        (expenseData as any[]).forEach((row) => {
            const month = row.month;
            const exp = Number(row.expenses);
            if (!monthlyMap.has(month)) monthlyMap.set(month, { revenue: 0, expenses: 0, profit: 0 });
            const entry = monthlyMap.get(month)!;
            entry.expenses = exp;
            entry.profit -= exp;
        });

        // Convert map to array and sort
        const result = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month));

        await cacheService.set(cacheKey, result, CACHE_TTL_MONTHLY);
        return result;
    }
};
