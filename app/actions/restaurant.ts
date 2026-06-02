'use server';

import { apiFetch } from '@/client-lib/api';
import { revalidatePath } from 'next/cache';

export async function getRestaurant() {
    try {
        const res = await apiFetch('/api/v1/restaurant/profile');
        if (!res.ok) {
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
}

export async function updateRestaurant(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const upiId = formData.get('upiId') as string;
        const upiPayeeName = formData.get('upiPayeeName') as string;
        const merchantCode = formData.get('merchantCode') as string;
        const appId = formData.get('appId') as string;
        const themeColor = formData.get('themeColor') as string || '#38bdf8';
        const fontFamily = formData.get('fontFamily') as string || 'inter';
        const colorScheme = formData.get('colorScheme') as string || 'light';

        const gstNumber = formData.get('gstNumber') as string;
        const gstPercentage = parseFloat(formData.get('gstPercentage') as string) || 0;
        const sgstPercentage = parseFloat(formData.get('sgstPercentage') as string) || 0;
        const phone = formData.get('phone') as string;

        let logoUrl = formData.get('logoUrl') as string;
        const logoFile = formData.get('logo') as File;

        if (!name) {
            throw new Error('Restaurant name is required');
        }

        if (logoFile && logoFile.size > 0 && logoFile.type.startsWith('image/')) {
            if (logoFile.size > 2 * 1024 * 1024) {
                return { success: false, error: 'Logo must be under 2MB' };
            }
            try {
                const arrayBuffer = await logoFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');
                logoUrl = `data:${logoFile.type};base64,${base64}`;
            } catch (error) {
                console.error("Error processing logo", error);
            }
        }

        const res = await apiFetch('/api/v1/restaurant/profile', {
            method: 'PUT',
            body: JSON.stringify({
                name,
                upiId,
                upiPayeeName,
                merchantCode,
                appId,
                themeColor,
                fontFamily,
                colorScheme,
                gstNumber,
                gstPercentage,
                sgstPercentage,
                logoUrl,
                phone,
            }),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to update restaurant' };
        }

        const restaurant = await res.json();
        revalidatePath('/dashboard/profile');
        revalidatePath('/table/[restaurantId]/[tableId]', 'page');
        return { success: true, restaurant };
    } catch (error: any) {
        console.error('Error updating restaurant:', error);
        return { success: false, error: error?.message || 'Failed to update restaurant' };
    }
}

export async function getPublicRestaurantInfo(restaurantId: string) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const res = await fetch(`${backendUrl}/api/v1/restaurant/public/${restaurantId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching public restaurant info:', error);
        return null;
    }
}

