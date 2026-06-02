'use server';

import { apiFetch } from '@/client-lib/api';

export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { success: false, error: 'Invalid file type. Please upload an image.' };
        }

        // Convert file to buffer and then to base64 data URI
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Forward to the backend upload endpoint
        const res = await apiFetch('/api/v1/upload', {
            method: 'POST',
            body: JSON.stringify({ file: dataURI }),
        });

        if (!res.ok) {
            const errData = await res.json();
            return { success: false, error: errData.error || 'Failed to upload file' };
        }

        return await res.json(); // Returns { success: true, url: dataURI }
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: 'Failed to upload file' };
    }
}



