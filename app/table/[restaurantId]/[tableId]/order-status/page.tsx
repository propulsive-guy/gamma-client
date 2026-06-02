'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSessionId } from '@/lib/session';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { getPublicRestaurantInfo } from '@/app/actions/restaurant';
import { getOrdersBySession } from '@/app/actions/order';
import QRCode from 'qrcode';

interface Order {
    _id: string;
    items: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
    total: number;
    status: string;
    paymentStatus?: 'pending' | 'paid';
    createdAt: string;
}

interface RestaurantInfo {
    name: string;
    upiId?: string;
    upiPayeeName?: string;
    merchantCode?: string;
    appId?: string;
    themeColor?: string;
    fontFamily?: string;
    colorScheme?: string;
    gstPercentage?: number;
    sgstPercentage?: number;
}

const statusSteps = ['pending', 'preparing', 'served', 'completed'];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    preparing: 'bg-blue-500',
    served: 'bg-purple-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
};

export default function OrderStatusPage() {
    const params = useParams();
    const restaurantId = params?.restaurantId as string;
    const tableId = params?.tableId as string;
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!restaurantId || !tableId) return;

        const fetchData = async () => {
            try {
                const sessionId = getSessionId();
                
                const [ordersResult, restaurantInfo] = await Promise.all([
                    getOrdersBySession(sessionId, tableId),
                    getPublicRestaurantInfo(restaurantId)
                ]);

                if (!ordersResult.success) {
                    throw new Error(ordersResult.error || 'Failed to fetch orders');
                }

                setOrders(ordersResult.orders);

                if (restaurantInfo) {
                    setRestaurant(restaurantInfo);
                }
                setError(null);
            } catch (err: any) {
                console.error('[fetchData] Error loading order status page:', err);
                setError(err.message || 'Failed to connect to the backend server.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Poll for orders via server action (avoids mixed-content blocking)
        const interval = setInterval(async () => {
            try {
                const sessionId = getSessionId();
                const result = await getOrdersBySession(sessionId, tableId);
                if (result.success) {
                    setOrders(result.orders);
                }
            } catch (err) {
                console.error('[Polling] Error fetching orders:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [tableId, restaurantId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const accent = restaurant?.themeColor || '#38bdf8';
    const font = restaurant?.fontFamily || 'inter';
    const scheme = restaurant?.colorScheme || 'light';

    const fontMap: Record<string, string> = {
        inter: "'Inter', sans-serif",
        outfit: "'Outfit', sans-serif",
        poppins: "'Poppins', sans-serif",
        roboto: "'Roboto', sans-serif",
        playfair: "'Playfair Display', serif",
    };
    const fontUrlMap: Record<string, string> = {
        inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        outfit: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
        poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
        roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
        playfair: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    };
    const schemes: Record<string, { bg: string; cardBg: string; text: string; subtext: string; border: string }> = {
        light: { bg: '#f9fafb', cardBg: '#ffffff', text: '#111827', subtext: '#6b7280', border: '#f3f4f6' },
        dark: { bg: '#111827', cardBg: '#1f2937', text: '#f9fafb', subtext: '#9ca3af', border: '#374151' },
        warm: { bg: '#fffbeb', cardBg: '#ffffff', text: '#78350f', subtext: '#92400e', border: '#fde68a' },
        cool: { bg: '#f0f9ff', cardBg: '#ffffff', text: '#0c4a6e', subtext: '#0369a1', border: '#bae6fd' },
    };
    const t = schemes[scheme] || schemes.light;
    const fontFamily = fontMap[font] || fontMap.inter;

    return (
        <>
            <link rel="stylesheet" href={fontUrlMap[font] || fontUrlMap.inter} />
            <div className="min-h-screen p-4" style={{ backgroundColor: t.bg, fontFamily, color: t.text }}>
                <div className="container mx-auto max-w-2xl">
                    <div className="mb-6">
                        <Link
                            href={`/table/${restaurantId}/${tableId}`}
                            className="font-medium"
                            style={{ color: accent }}
                        >
                            ← Back to Menu
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold mb-6" style={{ color: t.text }}>
                        Your Orders
                    </h1>

                    {error && (
                        <div className="rounded-xl shadow-md p-6 mb-6 text-center bg-red-50 border border-red-200 text-red-700">
                            <p className="font-semibold text-base">Connection Error</p>
                            <p className="text-sm mt-1">{error}</p>
                            <p className="text-xs mt-2 text-gray-500">
                                Attempted to connect to: <code>{process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}</code>. 
                                Make sure your Vercel project has the <strong>NEXT_PUBLIC_BACKEND_URL</strong> environment variable set to your EC2 instance IP.
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="rounded-xl shadow-md p-6"
                                style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm" style={{ color: t.subtext }}>
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusColors[order.status]}`}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                {order.status !== 'cancelled' && (
                                    <div className="mb-6">
                                        <div className="flex justify-between mb-2">
                                            {statusSteps.map((step) => {
                                                const isActive = statusSteps.indexOf(order.status) >= statusSteps.indexOf(step);
                                                return (
                                                    <div
                                                        key={step}
                                                        className={`text-xs capitalize ${isActive ? 'font-medium' : ''}`}
                                                        style={{ color: isActive ? accent : t.subtext }}
                                                    >
                                                        {step}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex gap-1">
                                            {statusSteps.map((step, idx) => {
                                                const isActive = statusSteps.indexOf(order.status) >= idx;
                                                return (
                                                    <div
                                                        key={step}
                                                        className="h-2 flex-1 rounded-full"
                                                        style={{ backgroundColor: isActive ? accent : (scheme === 'dark' ? '#374151' : '#e5e7eb') }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between" style={{ color: t.text }}>
                                            <span>
                                                {item.name} x{item.quantity}
                                            </span>
                                            <span>{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                                    {/* Tax Calculation */}
                                    {(() => {
                                        const subtotal = Number(order.total);
                                        const gstRate = Number(restaurant?.gstPercentage) || 0;
                                        const sgstRate = Number(restaurant?.sgstPercentage) || 0;
                                        const gstAmount = (subtotal * gstRate) / 100;
                                        const sgstAmount = (subtotal * sgstRate) / 100;
                                        const grandTotal = subtotal + gstAmount + sgstAmount;

                                        return (
                                            <>
                                                <div className="space-y-1 mb-4 text-sm" style={{ color: t.subtext }}>
                                                    <div className="flex justify-between">
                                                        <span>Subtotal</span>
                                                        <span>{formatCurrency(subtotal)}</span>
                                                    </div>
                                                    {gstRate > 0 && (
                                                        <div className="flex justify-between">
                                                            <span>CGST/IGST ({gstRate}%)</span>
                                                            <span>{formatCurrency(gstAmount)}</span>
                                                        </div>
                                                    )}
                                                    {sgstRate > 0 && (
                                                        <div className="flex justify-between">
                                                            <span>SGST ({sgstRate}%)</span>
                                                            <span>{formatCurrency(sgstAmount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-bold pt-2 text-base" style={{ color: t.text, borderTop: `1px solid ${t.border}` }}>
                                                        <span>Total</span>
                                                        <span>{formatCurrency(grandTotal)}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* UPI QR Code Generation */}
                                                    {restaurant && (
                                                        <UPIPaymentSection
                                                            restaurant={restaurant}
                                                            grandTotal={grandTotal}
                                                            orderId={order._id}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}

                                    {order.paymentStatus === 'paid' && (
                                        <div className="mt-2 w-full text-center py-3 px-4 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Payment Received
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {orders.length === 0 && (
                        <div className="rounded-xl shadow-md p-12 text-center" style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}` }}>
                            <p style={{ color: t.subtext }}>No orders yet</p>
                            <Link href={`/table/${restaurantId}/${tableId}`}>
                                <Button className="mt-4" style={{ backgroundColor: accent, color: '#fff' }}>Browse Menu</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function UPIPaymentSection({ restaurant, grandTotal, orderId }: { restaurant: RestaurantInfo, grandTotal: number, orderId: string }) {
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const [upiDeepLink, setUpiDeepLink] = useState<string>('');

    useEffect(() => {
        if (!restaurant?.upiId) return;

        // Build a minimal UPI URI matching Google Pay's proven format.
        // GPay QRs use only: pa, pn, (optionally am, cu)
        // CRITICAL: Use encodeURIComponent (encodes spaces as %20),
        // NOT URLSearchParams (encodes spaces as + which UPI apps reject).
        const pa = encodeURIComponent(restaurant.upiId.trim());
        // Use the banking name (account holder name) for pn, fall back to restaurant name
        const payeeName = restaurant.upiPayeeName?.trim() || restaurant.name.trim();
        const pn = encodeURIComponent(payeeName);
        const am = grandTotal.toFixed(2);

        // Minimal URI — only include what's strictly needed
        const upiUrl = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`;

        setUpiDeepLink(upiUrl);

        QRCode.toDataURL(upiUrl, {
            errorCorrectionLevel: 'M',
            margin: 2,
            scale: 8,
            width: 280,
        })
            .then(url => setQrCodeData(url))
            .catch(err => console.error('Error generating QR code', err));
    }, [restaurant, grandTotal, orderId]);

    if (!restaurant?.upiId) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400 text-sm">
                Please pay at the counter (UPI not configured)
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col items-center gap-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">Scan to Pay via UPI</h3>

            {qrCodeData ? (
                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                    <img src={qrCodeData} alt="UPI QR Code" className="w-52 h-52 object-contain" />
                </div>
            ) : (
                <div className="w-52 h-52 flex items-center justify-center bg-gray-50 rounded-2xl animate-pulse">
                    <span className="text-gray-400 text-sm">Generating QR...</span>
                </div>
            )}

            <div className="text-center space-y-1">
                <p className="text-xs text-gray-400 font-mono">{restaurant.upiId}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(grandTotal)}
                </p>
            </div>

            {/* Deep-link button for mobile users to open UPI app directly */}
            {upiDeepLink && (
                <a
                    href={upiDeepLink}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                    </svg>
                    Pay Now via UPI App
                </a>
            )}

            <p className="text-xs text-center text-gray-400">
                Scan with any UPI App — GPay, PhonePe, Paytm, etc.
            </p>
        </div>
    );
}
