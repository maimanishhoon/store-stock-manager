import React, { useState, useEffect } from 'react';
import { publicApi } from '../../api/publicApi';
import { getImageUrl } from '../../utils/imageUrl';
import {
  Sparkles,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Phone,
  User,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertCircle,
  ChevronRight,
  Flame,
  ArrowRight,
  RefreshCw,
  Gift,
} from 'lucide-react';

const CustomerStorePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state: map of productId -> quantity
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('diwali_shop_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Placed Order state
  const [placedOrder, setPlacedOrder] = useState(null);

  // Track order modal
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedOrders, setTrackedOrders] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('diwali_shop_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage failed:', e);
    }
  }, [cart]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        publicApi.getCategories(),
        publicApi.getProducts({
          categoryId: selectedCategory || undefined,
          query: searchQuery.trim() || undefined,
        }),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery]);

  // Cart Helpers
  const addToCart = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.availableStock <= 0) return;

    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current >= product.availableStock) return prev;
      return { ...prev, [productId]: current + 1 };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const deleteItem = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartItemsList = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === Number(id));
      if (!product) return null;
      return {
        product,
        quantity: qty,
        unitPrice: parseFloat(product.finalSellingPrice || product.sellingPrice),
        originalPrice: parseFloat(product.sellingPrice),
        subtotal: parseFloat(product.finalSellingPrice || product.sellingPrice) * qty,
      };
    })
    .filter(Boolean);

  const cartSubtotal = cartItemsList.reduce((sum, item) => sum + item.subtotal, 0);
  const originalSubtotal = cartItemsList.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );
  const totalSavings = Math.max(0, originalSubtotal - cartSubtotal);

  // Submit Order (No OTP)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);

    const cleanPhone = customerPhone.trim();
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setOrderError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (cartItemsList.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const payload = {
        customerPhone: cleanPhone,
        customerName: customerName.trim(),
        notes: orderNotes.trim() || undefined,
        items: cartItemsList.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const newOrder = await publicApi.placeOrder(payload);
      setPlacedOrder(newOrder);
      clearCart();
      setIsCartOpen(false);
    } catch (err) {
      setOrderError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to place order. Please check item availability.'
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Poll placed order status
  useEffect(() => {
    if (!placedOrder) return;
    const interval = setInterval(async () => {
      try {
        const fresh = await publicApi.getOrder(placedOrder.orderNumber);
        if (fresh && fresh.status !== placedOrder.status) {
          setPlacedOrder(fresh);
        }
      } catch (e) {
        // quiet catch
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [placedOrder]);

  const handleTrackSearch = async (e) => {
    e?.preventDefault();
    if (!trackPhone || !/^[0-9]{10}$/.test(trackPhone.trim())) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      setTrackingLoading(true);
      const orders = await publicApi.trackOrdersByPhone(trackPhone.trim());
      setTrackedOrders(orders);
    } catch (err) {
      console.error('Failed to track orders:', err);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/60 via-orange-50/30 to-white text-gray-900 flex flex-col font-sans pb-24">
      {/* Top Banner / Navigation */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-amber-900 to-orange-900 border-b border-amber-700/50 shadow-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
              <span className="text-base sm:text-xl">🪔</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
                  Diwali Express
                </h1>
                <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/40 text-amber-100 border border-amber-400/40 whitespace-nowrap">
                  In-Store QR
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-amber-200 font-medium">
                Browse catalog, place order & pick up at shop counter
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-400/50 text-amber-100 bg-amber-800/50 hover:bg-amber-700/60 transition flex items-center space-x-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Track</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white shadow-md transition flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
        {/* Festive Welcome Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 p-4 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-white mb-2">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>🪔 Festive Diwali Collection 2026</span>
            </span>
            <h2 className="text-lg sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow">
              Order Directly from Your Phone
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed font-medium line-clamp-2 sm:line-clamp-none">
              Skip counter rush! Add sparklers, diyas, flower pots & lights to cart. Enter mobile number (no OTP) to send order to counter!
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 sm:w-60 h-40 sm:h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Search & Category Filter Section */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sparklers, chakkar, anar, diyas, string lights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === null
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-medium">Lighting up festive products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8 space-y-3">
            <Flame className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">No products found</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search query or filter category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {products.map((product) => {
              const qtyInCart = cart[product.id] || 0;
              const hasDiscount =
                product.discountType &&
                product.discountType !== 'NONE' &&
                parseFloat(product.discountValue) > 0;
              const isOutOfStock = product.availableStock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
                >
                  {/* Image container */}
                  <div className="relative aspect-4/3 bg-amber-50/50 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300">
                        <Flame className="w-12 h-12" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {hasDiscount && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        {product.discountType === 'PERCENTAGE'
                          ? `${parseFloat(product.discountValue)}% OFF`
                          : `₹${parseFloat(product.discountValue)} OFF`}
                      </span>
                    )}

                    {/* Stock status indicator */}
                    <span
                      className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-800'
                          : product.availableStock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOutOfStock
                        ? 'Sold Out'
                        : product.availableStock <= 5
                        ? `Only ${product.availableStock} left`
                        : 'In Stock'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {product.productCode} • {product.category?.name || 'Diwali Special'}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Add Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-lg font-black text-emerald-700">
                            ₹{parseFloat(product.finalSellingPrice || product.sellingPrice).toFixed(0)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{parseFloat(product.sellingPrice).toFixed(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block">inclusive of taxes</span>
                      </div>

                      {/* Cart Action Buttons */}
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      ) : qtyInCart > 0 ? (
                        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="p-1 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-emerald-900 w-4 text-center">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => addToCart(product.id)}
                            disabled={qtyInCart >= product.availableStock}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && !isCartOpen && !placedOrder && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-gray-900 text-white p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm">
                {totalItemsCount}
              </div>
              <div>
                <div className="text-xs text-gray-300">Total Cart Value</div>
                <div className="text-base font-black text-emerald-400">
                  ₹{cartSubtotal.toFixed(2)}
                  {totalSavings > 0 && (
                    <span className="text-[10px] text-amber-300 font-semibold ml-2">
                      (Saved ₹{totalSavings.toFixed(0)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart & Checkout Slide-Over Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">Your Diwali Cart</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  {totalItemsCount} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error message */}
            {orderError && (
              <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Item list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItemsList.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-sm font-semibold">Your cart is empty.</p>
                  <p className="text-xs">Browse the catalog to add Diwali items!</p>
                </div>
              ) : (
                cartItemsList.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div className="flex-1 pr-3">
                      <div className="font-bold text-gray-900">{item.product.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {item.product.productCode} • ₹{item.unitPrice.toFixed(2)} each
                      </div>
                      <div className="text-xs font-bold text-emerald-700 mt-1">
                        ₹{item.subtotal.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-gray-900 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item.product.id)}
                          disabled={item.quantity >= item.product.availableStock}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => deleteItem(item.product.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form Section */}
            {cartItemsList.length > 0 && (
              <form onSubmit={handlePlaceOrder} className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
                {/* Price summary */}
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Items Subtotal</span>
                    <span>₹{originalSubtotal.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Festive Discount Savings</span>
                      <span>-₹{totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-gray-100">
                    <span>Estimated Total</span>
                    <span className="text-emerald-700">₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    * Shop counter admin may apply additional seasonal discounts upon order approval.
                  </p>
                </div>

                {/* Customer Name - REQUIRED */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Mobile number input (NO OTP) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number <span className="text-rose-600">* (No OTP required)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <input
                    type="text"
                    placeholder="Remarks / Special instructions (optional)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Order to Counter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Place Order & Pay at Counter</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Placed Success Modal */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Order Received by Shop
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                Order #{placedOrder.orderNumber}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Linked to Mobile: <span className="font-mono font-bold text-gray-800">{placedOrder.customerPhone}</span>
              </p>
            </div>

            {/* Live Status Tracker Box */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Current Status:</span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    placedOrder.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800'
                      : placedOrder.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800'
                      : placedOrder.status === 'PACKING'
                      ? 'bg-indigo-100 text-indigo-800'
                      : placedOrder.status === 'READY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : placedOrder.status === 'DISPATCHED'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {placedOrder.status === 'PENDING_APPROVAL' && '⏳ Awaiting Counter Review'}
                  {placedOrder.status === 'APPROVED' && '📦 Approved / Queued for Packing'}
                  {placedOrder.status === 'ACCEPTED' && '👷 Packing Accepted'}
                  {placedOrder.status === 'PACKING' && '🎁 Packing in Progress'}
                  {placedOrder.status === 'READY' && '🎉 Packed & Ready for Pickup!'}
                  {placedOrder.status === 'DISPATCHED' && '🚚 Dispatched / Ready'}
                  {placedOrder.status === 'DELIVERED' && '✅ Completed & Picked Up'}
                </span>
              </div>

              {/* Step Flow indicator */}
              <div className="grid grid-cols-4 gap-1 pt-1 text-[9px] text-center font-bold">
                <div
                  className={`p-1.5 rounded-md ${
                    placedOrder.status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  1. Placed
                </div>
                <div
                  className={`p-1.5 rounded-md ${
                    placedOrder.status !== 'PENDING_APPROVAL'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  2. Counter
                </div>
                <div
                  className={`p-1.5 rounded-md ${
                    ['PACKING', 'READY', 'DISPATCHED', 'DELIVERED'].includes(placedOrder.status)
                      ? 'bg-emerald-600 text-white'
                      : placedOrder.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  3. Packing
                </div>
                <div
                  className={`p-1.5 rounded-md ${
                    ['READY', 'DISPATCHED', 'DELIVERED'].includes(placedOrder.status)
                      ? 'bg-emerald-600 text-white animate-bounce'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  4. Collect
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between text-xs">
                <span className="text-gray-500">Items: {placedOrder.items?.length || 0}</span>
                <span className="font-bold text-gray-900">
                  Amount: ₹{parseFloat(placedOrder.finalPayableAmount || placedOrder.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-left text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">👉 Next Steps:</span>
              Please proceed to the shop billing counter. The cashier will review Order #{placedOrder.orderNumber}, apply any seasonal discounts, collect payment (Cash, Online UPI, or Skip), and dispatch your package to the packing warehouse!
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setPlacedOrder(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition"
              >
                Place Another Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Orders Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-gray-900">Track Orders by Mobile</h3>
              </div>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTrackSearch} className="flex space-x-2">
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                {trackingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3">
              {trackedOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Enter your mobile number to view active orders placed today.
                </div>
              ) : (
                trackedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{ord.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>{new Date(ord.createdAt).toLocaleTimeString()}</span>
                      <span className="font-bold text-emerald-700">
                        ₹{parseFloat(ord.finalPayableAmount || ord.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {ord.items?.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerStorePage;
