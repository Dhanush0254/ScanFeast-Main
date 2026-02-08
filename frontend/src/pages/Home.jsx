import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const Home = () => {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeMessage, setTimeMessage] = useState('');
  const [showCartWidget, setShowCartWidget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const table = searchParams.get('table') || 1;

  useEffect(() => {
    localStorage.setItem('tableNo', table);

    // Load cart from localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);

    // Time Logic
    const h = new Date().getHours();
    let msg = "Welcome!";
    let filterCat = '';

    if (h >= 6 && h < 12) { msg = "Good Morning! Tiffins are ready 🥞"; filterCat = 'Tiffins'; }
    else if (h >= 12 && h < 16) { msg = "Good Afternoon! Lunch is served 🍛"; filterCat = 'Meals'; }
    else if (h >= 16 && h < 19) { msg = "Good Evening! Snack time ☕"; filterCat = 'Snacks'; }
    else { msg = "Good Evening! Dinner is ready 🥘"; filterCat = 'Meals'; }

    setTimeMessage(msg);

    axios.get(`${API_URL}/api/menu`).then(res => {
      setMenu(res.data);
      setFilteredMenu(res.data);
      setLoading(false);
      if (res.data.length > 0) {
        toast(`Suggestion: Try our ${filterCat}!`, { icon: '💡' });
      }
    }).catch(err => {
      console.error('Error loading menu:', err);
      setLoading(false);
      toast.error('Failed to load menu');
    });
  }, [table]);

  // Search and Filter Logic
  useEffect(() => {
    let filtered = menu;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredMenu(filtered);
  }, [searchQuery, selectedCategory, menu]);

  const categories = ['All', ...new Set(menu.map(i => i.category))];

  const addToCart = (item) => {
    const updatedCart = [...cart];
    const existing = updatedCart.find(i => i._id === item._id);

    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      updatedCart.push({ ...item, qty: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${item.name} added!`);
  };

  const updateCartQty = (itemId, delta) => {
    const updatedCart = cart.map(i => {
      if (i._id === itemId) {
        const newQty = (i.qty || 1) + delta;
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => i.qty > 0);

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const cartTotal = cart.reduce((acc, i) => acc + (i.price * (i.qty || 1)), 0);
  const cartItemCount = cart.reduce((acc, i) => acc + (i.qty || 1), 0);

  const trendingItems = menu.slice(0, 3); // Simple trending logic

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍔</div>
          <p className="text-xl font-bold text-gray-700">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      {/* Header */}
      <header className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">Table #{table}</h1>
        <p className="text-orange-100 font-medium">{timeMessage}</p>
      </header>

      {/* Search Bar - Sticky */}
      <div className="sticky top-16 bg-[#f3f4f6] z-30 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Search for idli, dosa, biryani..."
          className="w-full p-4 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg bg-white text-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${selectedCategory === cat
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-500'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Today's Trending */}
      {selectedCategory === 'All' && !searchQuery && trendingItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🔥 <span>Today's Trending</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trendingItems.map(item => (
              <div key={item._id} className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border-2 border-orange-200 shadow-md">
                <div className="h-32 bg-white rounded-lg mb-3 overflow-hidden">
                  <img src={item.image || "https://via.placeholder.com/300"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xl font-bold text-orange-600">₹{item.price}</span>
                  <button onClick={() => addToCart(item)} className="bg-orange-500 text-white px-4 py-1 rounded-lg font-bold text-sm hover:bg-orange-600">
                    ADD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <h2 className="text-2xl font-bold mb-4">All Items</h2>
      {filteredMenu.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-xl font-bold text-gray-700 mb-2">No items found</p>
          <p className="text-gray-500">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map(item => (
            <div key={item._id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col hover:shadow-xl transition">
              <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img src={item.image || "https://via.placeholder.com/300"} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl">{item.name}</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{item.category}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 flex-grow">{item.description || "Fresh & Tasty"}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xl font-bold">₹{item.price}</span>
                <button onClick={() => addToCart(item)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-orange-600 active:scale-95 transition">
                  ADD
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Widget */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-0 right-0 px-4 z-40">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Cart Summary Bar */}
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:from-green-700 hover:to-green-800 transition"
                onClick={() => setShowCartWidget(!showCartWidget)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white text-green-600 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {cartItemCount}
                  </div>
                  <span className="font-bold">View Cart</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">₹{cartTotal}</span>
                  <svg className={`w-5 h-5 transition-transform ${showCartWidget ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Cart */}
              {showCartWidget && (
                <div className="bg-white text-gray-800 p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item._id} className="flex justify-between items-center border-b pb-3">
                        <div className="flex-1">
                          <h4 className="font-bold">{item.name}</h4>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => updateCartQty(item._id, -1)}
                            className="px-3 py-1 font-bold bg-white rounded shadow text-red-500 hover:bg-red-50 active:scale-95 transition"
                          >
                            -
                          </button>
                          <span className="font-bold w-6 text-center">{item.qty || 1}</span>
                          <button
                            onClick={() => updateCartQty(item._id, 1)}
                            className="px-3 py-1 font-bold bg-white rounded shadow text-green-500 hover:bg-green-50 active:scale-95 transition"
                          >
                            +
                          </button>
                        </div>
                        <div className="ml-4 font-bold text-lg">
                          ₹{item.price * (item.qty || 1)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Item Total:</span>
                      <span className="font-bold">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-xl mb-4">
                      <span className="font-bold">Grand Total:</span>
                      <span className="font-bold text-green-600">₹{cartTotal}</span>
                    </div>

                    <button
                      onClick={() => navigate('/payment')}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-700 hover:to-green-800 active:scale-98 transition"
                    >
                      Place Order → ₹{cartTotal}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;