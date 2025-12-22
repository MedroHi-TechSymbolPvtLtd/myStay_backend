import { prisma } from '../prisma';
import { cacheService } from './cache.service';
import { calculatePercentage } from '../utils/number.utils';

const CACHE_TTL_PROPERTY = 180;

export const propertyService = {
    async getPropertyOverview(propertyId: bigint) {
        const cacheKey = `property:${propertyId}:overview`;
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        const [
            revenueAgg,
            expenseAgg,
            totalRooms,
            occupiedRooms,
            activeEnrollments
        ] = await Promise.all([
            // Revenue linked to property via enrollment -> room -> property ?
            // Schema: Transaction -> Enrollment -> Property. Yes.
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                    type: 'rent',
                    status: 'paid',
                    enrollment: { property_id: propertyId }
                }
            }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { property_id: propertyId }
            }),
            prisma.room.count({ where: { property_id: propertyId } }),
            prisma.room.count({ where: { property_id: propertyId, status: 'occupied' } }),
            prisma.enrollment.count({ where: { property_id: propertyId, status: 'active' } })
        ]);

        const revenue = Number(revenueAgg._sum.amount || 0);
        const expenses = Number(expenseAgg._sum.amount || 0);
        const profit = revenue - expenses;
        const vacantRooms = totalRooms - occupiedRooms;
        const occupancyRate = calculatePercentage(occupiedRooms, totalRooms);

        const result = {
            revenue,
            expenses,
            profit,
            occupancyRate,
            totalRooms,
            vacantRooms,
            activeEnrollments,
            averageRating: 0 // Placeholder as Ratings table not fully defined in requirements yet
        };

        await cacheService.set(cacheKey, result, CACHE_TTL_PROPERTY);
        return result;
    },

    async getOccupancy(propertyId: bigint) {
        const [totalRooms, occupiedRooms] = await Promise.all([
            prisma.room.count({ where: { property_id: propertyId } }),
            prisma.room.count({ where: { property_id: propertyId, status: 'occupied' } })
        ]);

        return {
            totalRooms,
            occupiedRooms,
            vacantRooms: totalRooms - occupiedRooms,
            occupancyRate: calculatePercentage(occupiedRooms, totalRooms)
        };
    },

    async getDues(propertyId: bigint) {
        const duesAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: 'due',
                status: 'pending',
                enrollment: { property_id: propertyId }
            }
        });

        return {
            pendingDues: Number(duesAgg._sum.amount || 0)
        };
    }
};
