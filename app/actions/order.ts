'use server';

import { apiFetch } from '@/client-lib/api';
import { revalidatePath } from 'next/cache';

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const res = await apiFetch(`/api/v1/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to update order status' };
        }

        const order = await res.json();
        revalidatePath('/dashboard/orders');
        return { success: true, data: order };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Failed to update order status' };
    }
}

/**
 * Create a new order (customer-facing)
 */
export async function createOrder(data: any) {
    try {
        const res = await apiFetch('/api/v1/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to create order' };
        }

        const order = await res.json();
        return { success: true, data: order };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: 'Failed to create order' };
    }
}

/**
 * Get all orders for the current restaurant
 */
export async function getOrders() {
    try {
        const res = await apiFetch('/api/v1/orders');

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to fetch orders' };
        }

        const orders = await res.json();
        return { success: true, data: orders };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId: string, paymentStatus: 'pending' | 'paid') {
    try {
        const res = await apiFetch(`/api/v1/orders/${orderId}/payment`, {
            method: 'PATCH',
            body: JSON.stringify({ paymentStatus }),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to update payment status' };
        }

        const order = await res.json();
        revalidatePath('/dashboard/orders');
        return { success: true, data: order };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: 'Failed to update payment status' };
    }
}

