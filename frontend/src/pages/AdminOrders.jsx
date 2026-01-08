import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminOrders() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        fetchOrders();
    }, [currentUser]);

    const fetchOrders = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/orders/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            const ordersData = Array.isArray(data) ? data : [];
            setOrders(ordersData);

            // Extract unique user IDs
            const userIds = [...new Set(ordersData.map(o => o.userId).filter(Boolean))];
            await fetchUserNames(userIds, token);

        } catch (error) {
            console.error("Error fetching orders:", error);
            alert("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserNames = async (userIds, token) => {
        const names = {};
        try {
            await Promise.all(userIds.map(async (uid) => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/users/${uid}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        names[uid] = userData.firstName + ' ' + userData.lastName;
                    } else {
                        names[uid] = 'Unknown User';
                    }
                } catch (e) {
                    names[uid] = 'Error loading name';
                }
            }));
            setUserNames(prev => ({ ...prev, ...names }));
        } catch (error) {
            console.error("Error fetching user names:", error);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/orders/${id}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedOrder = await response.json();
            setOrders(orders.map(o => o.id === id ? updatedOrder : o));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this order?")) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/orders/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete order');
            setOrders(orders.filter(o => o.id !== id));
        } catch (error) {
            alert("Failed to delete order");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Order Management</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id.substring(0, 8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                    <div className="text-xs text-gray-400">{new Date(order.orderDate).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {userNames[order.userId] || 'Loading...'}
                                    <div className="text-xs text-gray-400 font-normal">{order.userId ? order.userId.substring(0, 8) + '...' : 'Guest'}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs" title={order.shippingAddress}>{order.shippingAddress}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="mr-2 text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="text-red-600 hover:text-red-900 ml-4"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <div className="p-4 text-center text-gray-500">No orders found.</div>}
            </div>
        </div>
    );
}
