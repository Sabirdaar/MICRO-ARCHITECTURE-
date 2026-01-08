import React, { useState } from 'react';

export default function CheckoutModal({ isOpen, onClose, onConfirm, totalAmount }) {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!address.trim()) {
            alert('Please enter a shipping address');
            return;
        }
        setLoading(true);
        await onConfirm(address);
        setLoading(false);
        setAddress('');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Checkout</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500 mb-4">
                            Total Amount: <span className="font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                            Please enter your shipping address for this cash-on-delivery order.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                                rows="3"
                                placeholder="123 Main St, City, Country"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                            <div className="items-center px-4 py-3 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loading ? 'Processing...' : 'Confirm Order'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
