'use server';

import { apiFetch } from '@/client-lib/api';
import { revalidatePath } from 'next/cache';

export async function createMenuItem(data: any) {
    try {
        const res = await apiFetch('/api/v1/menu', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to create menu item' };
        }

        const menuItem = await res.json();
        revalidatePath('/dashboard/menu');
        return { success: true, data: menuItem };
    } catch (error) {
        console.error('Error creating menu item:', error);
        return { success: false, error: 'Failed to create menu item' };
    }
}

export async function updateMenuItem(id: string, data: any) {
    try {
        const res = await apiFetch(`/api/v1/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to update menu item' };
        }

        const menuItem = await res.json();
        revalidatePath('/dashboard/menu');
        return { success: true, data: menuItem };
    } catch (error) {
        console.error('Error updating menu item:', error);
        return { success: false, error: 'Failed to update menu item' };
    }
}

export async function deleteMenuItem(id: string) {
    try {
        const res = await apiFetch(`/api/v1/menu/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to delete menu item' };
        }

        revalidatePath('/dashboard/menu');
        return { success: true };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return { success: false, error: 'Failed to delete menu item' };
    }
}

export async function toggleMenuItemAvailability(id: string) {
    try {
        const res = await apiFetch(`/api/v1/menu/${id}/toggle`, {
            method: 'PATCH',
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to toggle availability' };
        }

        const result = await res.json();
        revalidatePath('/dashboard/menu');
        revalidatePath('/table/[restaurantId]/[tableId]', 'page');
        return { success: true, isAvailable: result.isAvailable };
    } catch (error) {
        console.error('Error toggling availability:', error);
        return { success: false, error: 'Failed to toggle availability' };
    }
}

