'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cart } from './Cart';
import { getSessionId } from '@/lib/session';
import { createOrder } from '@/app/actions/order';
import { toast } from 'react-hot-toast';
import { ShoppingCartIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
}

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    logoUrl?: string;
    themeColor?: string;
    fontFamily?: string;
    colorScheme?: string;
}

interface Table {
    _id: string;
    tableNumber: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export function CustomerMenu({
    restaurant,
    table,
    menuItems,
}: {
    restaurant: Restaurant;
    table: Table;
    menuItems: MenuItem[];
}) {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const accent = restaurant.themeColor || '#38bdf8';
    const font = restaurant.fontFamily || 'inter';
    const scheme = restaurant.colorScheme || 'light';

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

    const schemes: Record<string, { bg: string; cardBg: string; headerBg: string; text: string; subtext: string; border: string }> = {
        light: { bg: '#f8fafc', cardBg: '#ffffff', headerBg: 'rgba(255,255,255,0.9)', text: '#0f172a', subtext: '#64748b', border: '#e2e8f0' },
        dark: { bg: '#0f172a', cardBg: '#1e293b', headerBg: 'rgba(15,23,42,0.9)', text: '#f8fafc', subtext: '#94a3b8', border: '#334155' },
        warm: { bg: '#fffbeb', cardBg: '#ffffff', headerBg: 'rgba(255,251,235,0.9)', text: '#451a03', subtext: '#78350f', border: '#fde68a' },
        cool: { bg: '#f0f9ff', cardBg: '#ffffff', headerBg: 'rgba(240,249,255,0.9)', text: '#0c4a6e', subtext: '#0369a1', border: '#bae6fd' },
    };

    const t = schemes[scheme] || schemes.light;
    const fontFamily = fontMap[font] || fontMap.inter;

    // Normalize category names to Title Case for casing consistency
    const titleCase = (str: string) => str.trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    const normalizedMenuItems = menuItems.map(item => ({
        ...item,
        category: titleCase(item.category)
    }));

    const categories = ['all', ...Array.from(new Set(normalizedMenuItems.map((item) => item.category)))];

    const filteredItems = normalizedMenuItems.filter((item) =>
        selectedCategory === 'all' ? true : item.category === selectedCategory
    );

    const addToCart = (item: MenuItem) => {
        setCart((prevCart) => {
            const existing = prevCart.find((i) => i._id === item._id);
            if (existing) {
                return prevCart.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
        toast.success(`${item.name} added to cart`);
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
        } else {
            setCart((prevCart) =>
                prevCart.map((item) => (item._id === itemId ? { ...item, quantity } : item))
            );
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const placeOrder = async (details: { name: string; phone: string; instructions: string }) => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setIsPlacingOrder(true);

        try {
            const sessionId = getSessionId();

            const result = await createOrder({
                tableId: table._id,
                restaurantId: restaurant._id,
                sessionId,
                items: cart.map((item) => ({
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                customerName: details.name,
                customerPhone: details.phone,
                notes: details.instructions,
            });

            if (result.success) {
                toast.success('Order placed successfully!');
                setCart([]);
                setShowCart(false);
                router.push(`/table/${restaurant._id}/${table._id}/order-status`);
            } else {
                toast.error(result.error || 'Failed to place order');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <>
            <link rel="stylesheet" href={fontUrlMap[font] || fontUrlMap.inter} />

            <div className="min-h-[100dvh] pb-24 transition-colors duration-300" style={{ backgroundColor: t.bg, fontFamily, color: t.text }}>

                {/* Header */}
                <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md border-b transition-all duration-300"
                    style={{ backgroundColor: t.headerBg, borderColor: t.border }}>
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            {restaurant.logoUrl ? (
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0 border" style={{ borderColor: t.border }}>
                                    <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border"
                                    style={{ backgroundColor: `${accent}15`, color: accent, borderColor: t.border }}>
                                    {restaurant.name.charAt(0)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-base font-bold leading-tight truncate" style={{ color: t.text }}>{restaurant.name}</h1>
                                <p className="text-xs truncate" style={{ color: t.subtext }}>Table {table.tableNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="overflow-x-auto no-scrollbar pb-3 px-4 flex gap-2 max-w-3xl mx-auto snap-x">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start"
                                style={selectedCategory === category
                                    ? { backgroundColor: accent, color: '#fff', boxShadow: `0 2px 8px -2px ${accent}66` }
                                    : { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', color: t.subtext, border: `1px solid ${t.border}` }
                                }
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Main Content */}
                <main className="pt-32 px-4 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item._id}
                                className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                                style={{ backgroundColor: t.cardBg, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: `1px solid ${t.border}` }}
                            >
                                <div className="flex p-3 gap-3 h-full">
                                    {item.imageUrl && (
                                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0 justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-sm leading-snug line-clamp-2" style={{ color: t.text }}>{item.name}</h3>
                                                <span className="font-bold text-sm shrink-0" style={{ color: accent }}>
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: t.subtext }}>{item.description}</p>
                                        </div>

                                        <div className="mt-3 flex justify-end">
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 text-white shadow-sm"
                                                style={{ backgroundColor: accent, boxShadow: `0 2px 6px -1px ${accent}66` }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100/50">
                                <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium" style={{ color: t.text }}>No items found</h3>
                            <p className="text-sm mt-1" style={{ color: t.subtext }}>Try selecting a different category</p>
                        </div>
                    )}
                </main>

                {/* Floating Cart Button */}
                {cart.length > 0 && (
                    <div className="fixed bottom-6 left-0 right-0 px-4 z-30 flex justify-center pointer-events-none">
                        <button
                            onClick={() => setShowCart(true)}
                            className="pointer-events-auto rounded-2xl p-1 pr-5 shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 backdrop-blur-xl max-w-md w-full mx-auto"
                            style={{ backgroundColor: accent, color: '#fff' }}
                        >
                            <div className="bg-white/20 p-3 rounded-xl">
                                <ShoppingCartIcon className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="text-xs font-medium opacity-90">{cart.reduce((a, b) => a + b.quantity, 0)} items in cart</span>
                                <span className="text-sm font-bold">View Cart</span>
                            </div>
                            <span className="font-bold text-lg">{formatCurrency(total)}</span>
                        </button>
                    </div>
                )}

                {/* Cart Drawer */}
                {showCart && (
                    <Cart
                        cart={cart}
                        onClose={() => setShowCart(false)}
                        onUpdateQuantity={updateQuantity}
                        onPlaceOrder={placeOrder}
                        isPlacingOrder={isPlacingOrder}
                        accent={accent} // Pass accent color to Cart
                        theme={t} // Pass theme object to Cart
                    />
                )}
            </div>
        </>
    );
}
