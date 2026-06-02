'use server';

import { apiFetch } from '@/client-lib/api';

export interface AssociationRule {
    items: string[];
    frequency: number;
}

export async function getAssociationRules(
    restaurantId: string,
    timeRange?: { startDate: Date; endDate: Date }
): Promise<{ success: boolean; data?: AssociationRule[]; error?: string }> {
    try {
        const queryParams = new URLSearchParams();
        if (timeRange?.startDate) queryParams.set('startDate', timeRange.startDate.toISOString());
        if (timeRange?.endDate) queryParams.set('endDate', timeRange.endDate.toISOString());

        const res = await apiFetch(`/api/v1/analytics/associations?${queryParams.toString()}`);

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to fetch analytics' };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error calculating association rules:', error);
        return { success: false, error: 'Failed to calculate analytics' };
    }
}

export interface BusinessMetrics {
    revenue: {
        period: number;
        total: number;
    };
    orders: {
        period: number;
        total: number;
    };
    topItems: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
}

export async function getBusinessMetrics(
    restaurantId: string,
    timeRange?: { startDate: Date; endDate: Date }
): Promise<{ success: boolean; data?: BusinessMetrics; error?: string }> {
    try {
        const queryParams = new URLSearchParams();
        if (timeRange?.startDate) queryParams.set('startDate', timeRange.startDate.toISOString());
        if (timeRange?.endDate) queryParams.set('endDate', timeRange.endDate.toISOString());

        const res = await apiFetch(`/api/v1/analytics/metrics?${queryParams.toString()}`);

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to fetch metrics' };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching business metrics:', error);
        return { success: false, error: 'Failed to fetch metrics' };
    }
}

