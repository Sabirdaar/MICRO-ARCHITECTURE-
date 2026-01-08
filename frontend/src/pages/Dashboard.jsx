import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckoutModal from '../component/CheckoutModal';

export default function Dashboard() {
  const { currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // 🔽 New filter & sort states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortOption, setSortOption] = useState("");

  // Modal state
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);


  // Fetch products from Python service (when ready)
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && currentUser) {
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/products`);
      console.log("🔗 Fetching from:", response.url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Products from backend:", data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`${product.name} added to cart!`);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSearch = async (e) => {
    // Prevent form reload
    if (e && e.preventDefault) e.preventDefault();

    // If search box is empty, reload all products
    if (searchQuery.trim() === "") {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Searching for:", searchQuery);

      // Send request to FastAPI search endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_GATEWAY_URL}/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 Search results:", result);

      // Set products to search results
      if (result.results && Array.isArray(result.results)) {
        setProducts(result.results);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Search failed:", error);
    } finally {
      setLoading(false);
    }
  };




  // 🔽 Filter handler
  const handleFilter = async () => {
    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_API_GATEWAY_URL}/products/filter?`;

      // parse price range
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        url += `min_price=${min}&max_price=${max}&`;
      }

      // category
      if (selectedCategory) {
        url += `category_id=${selectedCategory}&`;
      }

      // sort
      if (sortOption) {
        url += `sort_by=${sortOption}&`;
      }

      console.log("🔗 Filter URL:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      console.log("📦 Filtered products:", data);
      setProducts(data);
    } catch (error) {
      console.error("❌ Filter failed:", error);
    } finally {
      setLoading(false);
    }
  };








  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleCheckoutConfirm = async (address) => {
    try {
      setCheckoutModalOpen(false); // Close modal first
      setLoading(true);

      // Get auth token from local storage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Prepare order data
      const orderData = {
        userId: currentUser.uid,
        address: address,
        items: cart.map(item => ({
          productId: item.id.toString(),
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log('📦 Creating order:', orderData);

      // Send to order-service via API Gateway
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
      }

      const createdOrder = await response.json();
      console.log('✅ Order created:', createdOrder);

      // Add to local orders list for immediate display
      setOrders(prev => [createdOrder, ...prev]);

      // Clear cart
      setCart([]);

      // Switch to orders tab to show the new order
      setActiveTab('orders');

      alert(`Order placed successfully! Order ID: ${createdOrder.id}\nStatus: ${createdOrder.status}`);
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      console.log('🔍 Fetching orders for user:', currentUser.uid);

      const response = await fetch(
        `${import.meta.env.VITE_API_GATEWAY_URL}/api/orders/user/${currentUser.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Orders from backend:', data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      // Don't show alert for fetch errors, just log them
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefreshProfile = async () => {
    const result = await refreshUserProfile();
    if (result.success) {
      alert('Profile refreshed!');
    } else {
      alert('Failed to refresh profile: ' + result.error);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Filter products based on search query
  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">🛍️ ShopEase</h1>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {['products', 'cart', 'orders', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${activeTab === tab
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium capitalize`}
                  >
                    {tab}
                    {tab === 'cart' && cart.length > 0 && (
                      <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Search
                  </button>
                </div>
              </form>

              <span className="text-sm text-gray-700">
                {userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile?.email
                }
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                {/* 🔽 Filter & Sort Controls */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="1">Electronics</option>
                    <option value="2">Clothing</option>
                    <option value="3">Home</option>
                    {/* Add more categories here if needed */}
                  </select>

                  {/* Price Range */}
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Prices</option>
                    <option value="0-50">$0 – $50</option>
                    <option value="50-200">$50 – $200</option>
                    <option value="200-500">$200 – $500</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Sort By</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="newest">Newest</option>
                  </select>

                  {/* Apply Button */}
                  <button
                    onClick={handleFilter}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Apply
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                <span className="text-gray-600">{filteredProducts.length} products</span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {product.category?.name || "Uncategorized"}
                          </span>

                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600 ml-1">
                              {product.rating} • In stock: {product.stock}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.price}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found.</p>
                </div>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600">${item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold w-20 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4 mt-6">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handleCheckoutClick}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkout Modal */}
          <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setCheckoutModalOpen(false)}
            onConfirm={handleCheckoutConfirm}
            totalAmount={cartTotal}
          />

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No orders yet</p>
                    <p className="text-gray-400 text-sm mt-2">Your orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-gray-600 text-sm">
                              {order.orderDate ? new Date(order.orderDate).toLocaleDateString() :
                                order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                            </p>
                            {order.shippingAddress && (
                              <p className="text-gray-500 text-xs mt-1">
                                📍 {order.shippingAddress}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-sm ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {order.status}
                            </span>
                            <p className="font-semibold mt-1">
                              ${(order.totalAmount || order.total || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                          {order.items && order.items.length > 0 && order.items[0].name && (
                            <span> • {order.items.map(item => item.name).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab - Simplified */}
          {activeTab === 'profile' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                  <button
                    onClick={handleRefreshProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Refresh Data
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                      {userProfile?.firstName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {userProfile?.firstName && userProfile?.lastName
                          ? `${userProfile.firstName} ${userProfile.lastName}`
                          : userProfile?.displayName || userProfile?.email
                        }
                      </h3>
                      <p className="text-gray-600">{userProfile?.email}</p>
                      {userProfile?.emailVerified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          ✅ Email Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          ⚠️ Email Not Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Details - Simplified */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">First Name</span>
                            <p className="text-gray-900 font-medium">
                              {userProfile?.firstName || 'Not set'}
                            </p>
                          </div>

                          <div>
                            <span className="text-sm text-gray-500">Last Name</span>
                            <p className="text-gray-900 font-medium">
                              {userProfile?.lastName || 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">Member Since</span>
                            <p className="text-gray-900 font-medium">
                              {userProfile?.createdAt
                                ? new Date(userProfile.createdAt).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>

                          <div>
                            <span className="text-sm text-gray-500">Last Login</span>
                            <p className="text-gray-900 font-medium">
                              {userProfile?.lastLogin
                                ? new Date(userProfile.lastLogin).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simple Status Indicator */}
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✅</span>
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Account Active</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your account is active and ready to use.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}