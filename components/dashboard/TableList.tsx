'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createTable, deleteTable } from '@/app/actions/table';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon, QrCodeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Table {
    _id: string;
    tableNumber: string;
    qrCodeDataUrl?: string;
    isActive: boolean;
}

export function TableList({ initialTables, restaurantId }: { initialTables: Table[]; restaurantId: string }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [selectedQR, setSelectedQR] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createTable(tableNumber);

            if (result.success) {
                toast.success('Table created successfully!');
                setTableNumber('');
                setShowAddForm(false);
            } else {
                toast.error(result.error || 'Failed to create table');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this table?')) return;

        const result = await deleteTable(id);
        if (result.success) {
            toast.success('Table deleted successfully');
        } else {
            toast.error('Failed to delete table');
        }
    };

    const handleDownloadQR = (qrCode: string, tableName: string) => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `table-${tableName}-qr.png`;
        link.click();
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white shadow-lg shadow-sky-400/20 transition-all hover:-translate-y-0.5"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Table
                </Button>
            </div>

            {showAddForm && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 font-display">
                        Add New Table
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Table Number"
                            placeholder="e.g., 1, A1, VIP-1"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            required
                            className="bg-sky-50 border-sky-100 text-gray-900 placeholder:text-gray-400 focus:ring-sky-500 focus:border-sky-500"
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                className="bg-sky-400 hover:bg-sky-500 text-white shadow-lg shadow-sky-400/20"
                            >
                                Add Table
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialTables.map((table) => (
                    <div
                        key={table._id}
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Table</h3>
                                <p className="text-3xl font-bold text-gray-900 font-display mt-1">{table.tableNumber}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(table._id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 -mr-2"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {table.qrCodeDataUrl ? (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-3 group-hover:bg-sky-50 group-hover:border-sky-100 transition-colors">
                                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                        <Image
                                            src={table.qrCodeDataUrl}
                                            alt={`QR Code for Table ${table.tableNumber}`}
                                            width={120}
                                            height={120}
                                            className="rounded-md"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadQR(table.qrCodeDataUrl!, table.tableNumber)}
                                        className="w-full justify-center text-sky-600 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
                                    >
                                        <QrCodeIcon className="h-4 w-4 mr-2" />
                                        Download QR
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-200">
                                    <p className="text-sm">QR Code Generating...</p>
                                </div>
                            )}

                            <a
                                href={`/table/${restaurantId}/${table._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-100 text-sm font-medium"
                            >
                                <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                                Open Table View
                            </a>
                        </div>
                    </div>
                ))}

                {initialTables.length === 0 && !showAddForm && (
                    <div className="col-span-full text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <div className="w-16 h-16 bg-sky-50 text-sky-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No tables yet</h3>
                        <p className="text-gray-500 mt-1 mb-6">
                            Start by adding your first table.
                        </p>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-sky-400 hover:bg-sky-500 text-white"
                        >
                            Add Table
                        </Button>
                    </div>
                )}
            </div>

            {
                selectedQR && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedQR(null)}
                    >
                        <div className="bg-white rounded-2xl p-8 max-w-md shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">QR Code</h3>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedQR(null)} className="text-gray-500 hover:text-gray-900">
                                    <span className="sr-only">Close</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner mb-6">
                                <Image
                                    src={selectedQR}
                                    alt="QR Code"
                                    width={400}
                                    height={400}
                                    className="mx-auto rounded-lg"
                                />
                            </div>
                            <p className="text-center text-sm text-gray-500">
                                Scan this code to view the menu and place an order.
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
