import React, { useContext, useState } from 'react';
import { AppProvider, AppContext, formatRupiah } from './context/AppContext';

function AppContent() {
  const {
    currentUser,
    users,
    stores,
    products,
    cart,
    addresses,
    vouchers,
    orders,
    walletHistory,
    simTime,
    simLogs,
    notification,
    login,
    register,
    logout,
    switchUser,
    addToCart,
    updateCartQty,
    removeFromCart,
    topUpWallet,
    addAddress,
    deleteAddress,
    checkout,
    payOrder,
    cancelOrder,
    acceptOrderDriver,
    completeOrderDriver,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    advanceTime,
    showNotification
  } = useContext(AppContext);

  // View States
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Guest view states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form States
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrDetail, setNewAddrDetail] = useState('');

  // Checkout States
  const [selectedAddrId, setSelectedAddrId] = useState('');
  const [voucherInput, setVoucherInput] = useState('');

  // Wallet Top-up States
  const [topUpAmount, setTopUpAmount] = useState('');

  // Seller Inventory Forms
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', description: '' });

  // Reviews States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Letakkan di dekat baris 66-67
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);

  // Auth Form States
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRoles, setAuthRoles] = useState(['buyer']);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  // Clock widget collapse
  const [clockCollapsed, setClockCollapsed] = useState(false);

  const setDefaultTab = (role) => {
    if (role === 'driver') {
      setActiveTab('driver-jobs');
    } else if (role === 'seller') {
      setActiveTab('inventory');
    } else if (role === 'admin') {
      setActiveTab('analytics');
    } else {
      setActiveTab('shop');
    }
    setSelectedProductId(null);
    setShowLoginModal(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (!authName || !authUsername || !authEmail || !authPassword) {
        showNotification("Harap isi semua kolom pendaftaran.");
        return;
      }
      const profile = await register(authName, authUsername, authEmail, authPassword, authRoles);
      if (profile) {
        setDefaultTab(profile.role);
      }
    } else {
      if (!authUsername || !authPassword) {
        showNotification("Harap isi username dan password.");
        return;
      }
      const profile = await login(authUsername, authPassword);
      if (profile) {
        setDefaultTab(profile.role);
      }
    }
  };

  const handleDemoLogin = async (u) => {
    const profile = await login(u.username, u.password);
    if (profile) {
      setDefaultTab(profile.role);
    }
  };

  const handleRoleToggle = (role) => {
    if (authRoles.includes(role)) {
      if (authRoles.length > 1) {
        setAuthRoles(authRoles.filter(r => r !== role));
      }
    } else {
      setAuthRoles([...authRoles, role]);
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('shop');
    setSelectedProductId(null);
  };

  // Filter and Sort Products Logic
  const getFilteredProducts = () => {
    let result = [...products];

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Store filter
    if (selectedStoreId) {
      result = result.filter(p => p.storeId === selectedStoreId);
    }

    // Price range filters
    if (minPrice) {
      result = result.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    // Rating filter
    if (ratingFilter) {
      result = result.filter(p => p.rating >= Number(ratingFilter));
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  };

  // Navigation Items
  const getNavItems = () => {
    const items = [];
    if (currentUser.role === 'buyer' || currentUser.role === 'buyer-seller') {
      items.push({ id: 'shop', label: 'Marketplace', icon: 'storefront' });
      items.push({ id: 'cart', label: 'Keranjang', icon: 'shopping_cart', badge: cart.reduce((acc, i) => acc + i.quantity, 0) });
      items.push({ id: 'orders', label: 'Pesanan Saya', icon: 'receipt_long' });
      items.push({ id: 'wallet', label: 'Dompet Saya', icon: 'payments' });
      items.push({ id: 'addresses', label: 'Daftar Alamat', icon: 'map' });
    }

    if (currentUser.role === 'seller' || currentUser.role === 'buyer-seller') {
      items.push({ id: 'inventory', label: 'Kelola Produk', icon: 'edit_document' });
      items.push({ id: 'admin-orders', label: 'Pesanan Toko', icon: 'pending_actions' });
      items.push({ id: 'analytics', label: 'Statistik Toko', icon: 'monitoring' });
    }

    if (currentUser.role === 'admin') {
      items.push({ id: 'analytics', label: 'Sistem Analytics', icon: 'admin_panel_settings' });
      items.push({ id: 'admin-orders', label: 'Semua Pesanan', icon: 'list_alt' });
    }

    if (currentUser.role === 'driver') {
      items.push({ id: 'driver-jobs', label: 'Pekerjaan Kirim', icon: 'local_shipping' });
      items.push({ id: 'wallet', label: 'Dompet Driver', icon: 'payments' });
    }

    return items;
  };

  const currentStore = stores.find(s => s.id === currentUser?.storeId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // --- RENDERING TABS ---

  const renderShop = () => {
    const filteredProducts = getFilteredProducts();

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Browse the Marketplace</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Discover high-quality logistics equipment and supplies from verified sellers globally.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-lg">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 sticky top-24">
              <h2 className="font-title-lg text-title-lg text-primary mb-md border-b border-outline-variant/30 pb-sm">Filters</h2>

              {/* Search */}
              <div className="mb-md border-b border-outline-variant/30 pb-md">
                <h3 className="font-label-md text-label-md text-primary mb-sm">Cari Produk</h3>
                <div className="flex items-center bg-surface-container-low rounded-lg px-3 py-2 border border-outline-variant/50">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">search</span>
                  <input
                    type="text"
                    placeholder="Nama/deskripsi..."
                    className="bg-transparent border-none text-on-background focus:ring-0 text-body-md w-full p-0 placeholder:text-on-surface-variant/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Store Filter */}
              <div className="mb-md border-b border-outline-variant/30 pb-md">
                <h3 className="font-label-md text-label-md text-primary mb-sm">Pilih Toko</h3>
                <select
                  className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                >
                  <option value="">Semua Toko</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-md border-b border-outline-variant/30 pb-md">
                <h3 className="font-label-md text-label-md text-primary mb-sm">Rentang Harga (Rp)</h3>
                <div className="flex items-center gap-2">
                  <input
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-2 py-1.5 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-on-surface-variant">-</span>
                  <input
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-2 py-1.5 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Store Rating */}
              <div className="mb-md pb-xs">
                <h3 className="font-label-md text-label-md text-primary mb-sm">Minimal Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input
                      type="radio"
                      name="ratingFilter"
                      className="text-secondary focus:ring-secondary/20 bg-transparent h-4 w-4"
                      checked={ratingFilter === ''}
                      onChange={() => setRatingFilter('')}
                    />
                    <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-primary transition-colors">Semua Bintang</span>
                  </label>
                  {[5, 4, 3].map(stars => (
                    <label key={stars} className="flex items-center gap-sm cursor-pointer group">
                      <input
                        type="radio"
                        name="ratingFilter"
                        className="text-secondary focus:ring-secondary/20 bg-transparent h-4 w-4"
                        checked={Number(ratingFilter) === stars}
                        onChange={() => setRatingFilter(stars.toString())}
                      />
                      <div className="flex text-amber-500 items-center">
                        {[...Array(5)].map((_, idx) => (
                          <span key={idx} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${idx < stars ? 1 : 0}` }}>star</span>
                        ))}
                      </div>
                      <span className="font-body-md text-body-md text-on-surface-variant ml-1">{stars}.0 & Up</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStoreId('');
                  setMinPrice('');
                  setMaxPrice('');
                  setRatingFilter('');
                }}
                className="w-full mt-2 bg-surface-container-high hover:bg-outline-variant/30 text-primary font-label-md text-label-md py-2 rounded-lg transition-colors font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-md gap-3">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Showing <strong className="text-primary">{filteredProducts.length}</strong> products
              </span>
              <div className="flex items-center gap-sm w-full sm:w-auto">
                <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Sort by:</span>
                <select
                  className="bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-outline text-5xl mb-4">search_off</span>
                <p className="text-on-surface-variant font-medium text-lg">Tidak ada produk yang sesuai dengan kriteria filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                {filteredProducts.map(p => {
                  const store = stores.find(s => s.id === p.storeId);
                  return (
                    <article key={p.id} className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl overflow-hidden store-glow-card group flex flex-col h-full shadow-sm">
                      {/* Product Image Fallback placeholder */}
                      <div className="relative h-44 w-full bg-slate-50 flex items-center justify-center border-b border-outline-variant/10 overflow-hidden bg-store-grid">
                        <span className="material-symbols-outlined text-[64px] text-secondary/35">package_2</span>
                        <div className="absolute top-3 right-3 bg-secondary/80 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm">
                          STOK: {p.stock}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] bg-gradient-to-r from-secondary-container to-secondary text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2.5 inline-block w-fit shadow-sm">{store?.name}</span>
                        <h3 className="font-body-md text-body-md font-bold text-primary mb-2 line-clamp-2 min-h-[48px]">{p.name}</h3>

                        <div className="flex items-center gap-1 mb-4">
                          <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-sm font-bold text-primary">{p.rating}</span>
                          <span className="text-xs text-on-surface-variant">({p.reviewsCount} Ulasan)</span>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-outline-variant/20">
                          <div className="font-title-lg text-title-lg text-secondary font-bold">{formatRupiah(p.price)}</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedProductId(p.id); setActiveTab('product-detail'); }}
                              className="text-primary bg-surface-container-high hover:bg-outline-variant/30 font-label-md text-label-md px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => addToCart(p, 1)}
                              disabled={p.stock === 0}
                              className="bg-secondary hover:bg-secondary-container text-white font-label-md text-label-md px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                            >
                              Beli
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    const store = stores.find(s => s.id === selectedProduct.storeId);

    return (
      <div>
        <button
          className="bg-surface-container-lowest border border-outline-variant/30 text-primary font-semibold hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg flex items-center gap-2 mb-6"
          onClick={() => { setActiveTab('shop'); setSelectedProductId(null); }}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Katalog
        </button>

        <div className="bg-surface-container-lowest rounded-xl p-md md:p-lg border border-outline-variant/30 mb-6">
          <div className="flex flex-col md:flex-row gap-lg">
            <div className="w-full md:w-80 h-64 bg-slate-100 rounded-lg flex items-center justify-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-[96px] text-slate-300">package_2</span>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-secondary-fixed text-on-secondary-fixed text-xs px-3 py-1 rounded-full font-bold uppercase">
                  {store?.name}
                </span>
                <div className="flex text-amber-500 items-center">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-bold text-primary ml-1">{selectedProduct.rating} ({selectedProduct.reviewsCount} Ulasan)</span>
                </div>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-primary mb-4 leading-tight">{selectedProduct.name}</h1>

              <div className="font-display-lg text-2xl text-secondary font-bold mb-6">
                {formatRupiah(selectedProduct.price)}
              </div>

              <div className="border-t border-b border-outline-variant/30 py-4 mb-6">
                <h3 className="font-label-md text-label-md text-primary mb-2">Deskripsi Produk</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-6">
                <div>
                  <span className="text-xs text-on-surface-variant block mb-1">Status Ketersediaan</span>
                  <strong className="text-primary font-bold">{selectedProduct.stock > 0 ? `Tersedia: ${selectedProduct.stock} unit` : 'Stok Habis'}</strong>
                </div>
                <button
                  onClick={() => addToCart(selectedProduct, 1)}
                  disabled={selectedProduct.stock === 0}
                  className="bg-primary text-on-primary hover:bg-primary-container font-semibold px-8 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                  Masukkan Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30">
          <h2 className="font-title-lg text-title-lg text-primary mb-6 border-b border-outline-variant/20 pb-3">
            Ulasan Pembeli ({selectedProduct.reviews?.length || 0})
          </h2>
          <div className="space-y-4">
            {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
              selectedProduct.reviews.map((r, i) => (
                <div key={i} className="border-b border-outline-variant/20 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-primary text-body-md">{r.author}</span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <span key={idx} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: `'FILL' ${idx < r.rating ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low/30 p-3 rounded-lg">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant text-center py-6">Belum ada ulasan untuk produk ini.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Keranjang Belanja</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Tinjau item belanjaan Anda sebelum melanjutkan ke proses checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">shopping_cart</span>
            <p className="text-on-surface-variant font-medium text-lg mb-6">Keranjang Anda kosong.</p>
            <button className="bg-primary text-on-primary hover:bg-primary-container px-6 py-2.5 rounded-lg font-semibold transition-colors" onClick={() => setActiveTab('shop')}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Cart List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-outline-variant/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-slate-400">package_2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary text-body-md line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">Toko: {stores.find(s => s.id === item.product.storeId)?.name}</p>
                      <span className="text-sm font-bold text-secondary block mt-1">{formatRupiah(item.product.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant/20">
                    <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-surface">
                      <button
                        className="px-3 py-1 hover:bg-surface-container-high text-primary font-bold transition-colors"
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-primary text-body-md">{item.quantity}</span>
                      <button
                        className="px-3 py-1 hover:bg-surface-container-high text-primary font-bold transition-colors"
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-red-600 hover:bg-red-55/10 p-2 rounded-full border border-red-200 transition-colors flex items-center justify-center"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
              <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">Ringkasan Belanja</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                  <span>Subtotal ({cart.length} barang)</span>
                  <span className="font-medium text-primary">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                  <span>Biaya Pengiriman</span>
                  <span className="text-green-600 font-bold">GRATIS</span>
                </div>
                <div className="border-t border-outline-variant/30 pt-4 flex justify-between font-bold text-lg text-primary">
                  <span>Total Estimasi</span>
                  <span className="text-secondary">{formatRupiah(subtotal)}</span>
                </div>
              </div>
              <button
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-lg font-bold transition-colors shadow-md"
                onClick={() => {
                  setSelectedAddrId(addresses[0]?.id || '');
                  setActiveTab('checkout');
                }}
              >
                Lanjut ke Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCheckout = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    // Voucher Logic
    let discount = 0;
    const appliedVoucher = vouchers.find(v => v.code === voucherInput && v.active);
    if (appliedVoucher && subtotal >= (appliedVoucher.minPurchase || 0)) {
      if (appliedVoucher.discountType === 'percent') {
        discount = Math.min(appliedVoucher.maxDiscount, (subtotal * appliedVoucher.value) / 100);
      } else {
        discount = appliedVoucher.value;
      }
    }

    const total = subtotal - discount;

    const handleCheckoutSubmit = async () => {
      if (!selectedAddrId) {
        showNotification("Pilih alamat pengiriman terlebih dahulu!");
        return;
      }
      const orderId = await checkout(selectedAddrId, voucherInput);
      if (orderId) {
        setActiveTab('orders');
        setVoucherInput('');
      }
    };

    return (
      <div>
        <button
          className="bg-surface-container-lowest border border-outline-variant/30 text-primary font-semibold hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg flex items-center gap-2 mb-6"
          onClick={() => setActiveTab('cart')}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Keranjang
        </button>

        <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Proses Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 space-y-6">
            {/* Alamat Pengiriman */}
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30">
              <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">1. Alamat Pengiriman</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-on-surface-variant font-medium mb-4">Belum ada alamat terdaftar.</p>
                  <button className="bg-surface-container-high hover:bg-outline-variant/30 text-primary font-semibold px-4 py-2 rounded-lg transition-colors" onClick={() => setActiveTab('addresses')}>
                    Tambah Alamat Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedAddrId === addr.id ? 'border-secondary bg-secondary-fixed/10' : 'border-outline-variant/40 hover:bg-surface-container-low'}`}
                    >
                      <input
                        type="radio"
                        name="checkout_address"
                        value={addr.id}
                        checked={selectedAddrId === addr.id}
                        onChange={() => setSelectedAddrId(addr.id)}
                        className="text-secondary focus:ring-secondary/20 h-4 w-4 mt-1"
                      />
                      <div>
                        <strong className="block text-primary text-body-md font-bold">{addr.title}</strong>
                        <span className="text-sm text-on-surface-variant">{addr.detail}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Voucher Diskon */}
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30">
              <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">2. Voucher Diskon</h2>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Masukkan kode voucher..."
                  className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                />
              </div>
              {appliedVoucher ? (
                <p className="text-green-600 font-bold text-sm bg-green-50 p-2.5 rounded-lg border border-green-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Voucher "{appliedVoucher.code}" berhasil dipasang! Diskon: {formatRupiah(discount)}
                </p>
              ) : voucherInput ? (
                <p className="text-red-600 text-sm font-medium">
                  Voucher tidak valid atau minimal belanja tidak tercapai.
                </p>
              ) : (
                <div>
                  <span className="text-xs text-on-surface-variant block mb-2 font-medium">Voucher Tersedia (Klik untuk salin):</span>
                  <div className="flex gap-2 flex-wrap">
                    {vouchers.map(v => (
                      <button
                        key={v.code}
                        onClick={() => setVoucherInput(v.code)}
                        className="bg-surface-container-high hover:bg-outline-variant/30 text-primary border border-outline-variant/35 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                      >
                        {v.code} ({v.discountType === 'percent' ? `${v.value}%` : formatRupiah(v.value)} off)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rincian Harga & Bayar */}
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
            <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">Rincian Pembayaran</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal Produk</span>
                <span className="font-medium text-primary">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Biaya Pengiriman</span>
                <span className="text-green-600 font-bold">GRATIS</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-body-md text-body-md text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                  <span>Potongan Voucher</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
              <div className="border-t border-outline-variant/30 pt-4 flex justify-between font-bold text-lg text-primary">
                <span>Total Pembayaran</span>
                <span className="text-secondary">{formatRupiah(total)}</span>
              </div>
            </div>

            <button
              className="w-full bg-secondary hover:bg-secondary-container text-white py-3 rounded-lg font-bold transition-colors shadow-md"
              onClick={handleCheckoutSubmit}
            >
              Buat Pesanan
            </button>
            <p className="text-[11px] text-on-surface-variant/80 text-center mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              Dengan membuat pesanan, status order akan berubah menjadi UNPAID. Lakukan pembayaran dari tab 'Pesanan Saya' menggunakan Saldo Dompet Anda.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const buyerOrders = orders.filter(o => o.buyerId === currentUser.id);

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Pesanan Saya</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Pantau status transaksi, lakukan pembayaran saldo, dan lacak pengiriman driver.</p>
        </div>

        {buyerOrders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">list_alt</span>
            <p className="text-on-surface-variant font-medium text-lg mb-6">Belum ada riwayat transaksi.</p>
            <button className="bg-primary text-on-primary hover:bg-primary-container px-6 py-2.5 rounded-lg font-semibold transition-colors" onClick={() => setActiveTab('shop')}>
              Belanja Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {buyerOrders.map(order => {
              const statusColors = {
                'UNPAID': 'bg-amber-100 text-amber-800 border-amber-250',
                'PAID': 'bg-blue-100 text-blue-800 border-blue-200',
                'SHIPPING': 'bg-sky-100 text-sky-800 border-sky-200',
                'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
                'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
              };

              const deadline = new Date(order.paymentDeadline);
              const isOverdue = simTime >= deadline;

              return (
                <div key={order.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
                  {/* Order Top Bar */}
                  <div className="bg-slate-55/40 px-md py-4 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-xs text-on-surface-variant font-medium">ID Pesanan</span>
                      <strong className="block text-primary text-body-md font-extrabold">{order.id}</strong>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-on-surface-variant">Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-md grid grid-cols-1 lg:grid-cols-3 gap-lg">
                    {/* Left: Products & Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="font-label-md text-label-md text-primary">Item Pesanan:</h4>
                      <ul className="divide-y divide-outline-variant/20 border-t border-b border-outline-variant/15 py-1">
                        {order.items.map(item => (
                          <li key={item.product.id} className="py-2.5 flex justify-between text-body-md font-body-md text-on-background">
                            <span className="font-medium">{item.product.name} <strong className="text-secondary ml-1">x{item.quantity}</strong></span>
                            <span className="font-bold text-primary">{formatRupiah(item.product.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="space-y-1 text-xs text-on-surface-variant">
                        <p>📍 <strong>Alamat Kirim:</strong> {order.address}</p>
                        {order.driverName && <p>🚚 <strong>Driver Kurir:</strong> {order.driverName}</p>}
                        {order.cancellationReason && <p className="text-red-600 font-bold">❌ <strong>Alasan Batal:</strong> {order.cancellationReason}</p>}
                      </div>
                    </div>

                    {/* Right: Payment Billing & Actions */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-outline-variant/20 flex flex-col justify-between h-full">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-on-surface-variant">
                          <span>Subtotal:</span>
                          <span>{formatRupiah(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Diskon Voucher:</span>
                            <span>-{formatRupiah(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-body-md text-primary pt-2 border-t border-outline-variant/25">
                          <span>Total Tagihan:</span>
                          <span className="text-secondary">{formatRupiah(order.total)}</span>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      <div className="space-y-2 mt-auto">
                        {order.status === 'UNPAID' && (
                          <div className="space-y-2 text-center">
                            <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 leading-tight">
                              ⏰ Batas Bayar: <br />
                              <strong className="font-bold">{new Date(order.paymentDeadline).toLocaleString('id-ID')}</strong>
                            </div>
                            <button
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-colors"
                              onClick={() => payOrder(order.id)}
                            >
                              Bayar Sekarang
                            </button>
                            <button
                              className="w-full bg-transparent hover:bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-semibold text-xs transition-colors"
                              onClick={() => cancelOrder(order.id, 'Dibatalkan oleh pembeli')}
                            >
                              Batalkan Pesanan
                            </button>
                          </div>
                        )}

                        {order.status === 'DELIVERED' && (
                          <div className="space-y-3">
                            <p className="text-xs text-green-700 font-bold bg-green-50 p-2 rounded text-center border border-green-200 flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Paket belanjaan telah diterima!
                            </p>

                            {/* Reviews list input */}
                            {order.items.map(item => {
                              const alreadyReviewed = order.reviewedProductIds?.includes(item.product.id);

                              if (alreadyReviewed) {
                                return (
                                  <div key={item.product.id} className="text-xs text-on-surface-variant bg-slate-100 p-2 rounded text-center">
                                    ✓ Ulasan produk '{item.product.name}' terkirim.
                                  </div>
                                );
                              }

                              return (
                                <div key={item.product.id} className="bg-white p-3 rounded-lg border border-outline-variant/30 space-y-2">
                                  <span className="text-xs font-bold text-primary block leading-tight">Beri Ulasan: {item.product.name}</span>
                                  <div className="flex gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <span
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className="material-symbols-outlined text-[18px] cursor-pointer"
                                        style={{ fontVariationSettings: `'FILL' ${star <= reviewRating ? 1 : 0}` }}
                                      >
                                        star
                                      </span>
                                    ))}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Ulasan Anda..."
                                    className="w-full bg-transparent border border-outline-variant rounded px-2 py-1 text-xs text-primary focus:ring-1 focus:ring-secondary/20"
                                    onChange={(e) => setReviewComment(e.target.value)}
                                  />
                                  <button
                                    className="w-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold py-1.5 rounded transition-colors"
                                    onClick={() => {
                                      addProductReview(order.id, item.product.id, reviewRating, reviewComment || 'Bagus sekali!');
                                      setReviewComment('');
                                    }}
                                  >
                                    Kirim Ulasan
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderWallet = () => {
    const userWalletTx = walletHistory.filter(h => h.userId === currentUser.id);

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Dompet Digital</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Simulasikan pengisian saldo dan lihat riwayat detail mutasi keuangan transaksi Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Transaction History */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
            <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">Riwayat Transaksi</h2>
            {userWalletTx.length === 0 ? (
              <p className="text-on-surface-variant text-center py-10 font-medium">Belum ada riwayat transaksi keuangan.</p>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {userWalletTx.map(tx => (
                  <div key={tx.id} className="py-3 flex justify-between items-center">
                    <div>
                      <strong className="block text-primary text-body-md font-bold">{tx.description}</strong>
                      <span className="text-xs text-on-surface-variant">{new Date(tx.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <strong className={`text-body-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatRupiah(tx.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance & Topup card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary to-slate-900 text-white rounded-xl p-6 border border-outline/20 shadow-md">
              <span className="text-sm opacity-80 block mb-1">Total Saldo Dompet</span>
              <h1 className="text-3xl font-black text-green-400 mb-4">
                {formatRupiah(currentUser.walletBalance)}
              </h1>
              <span className="text-xs opacity-60">ID Rekening Dompet: WALLET-{currentUser.id}</span>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30">
              <h3 className="font-title-lg text-title-lg text-primary mb-4">Isi Saldo (Top-Up)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Pilih Nominal Instan:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 500000].map(val => (
                      <button
                        key={val}
                        className="bg-surface-container-high hover:bg-outline-variant/35 text-primary text-xs font-bold py-2 rounded-lg transition-colors border border-outline-variant/20"
                        onClick={() => setTopUpAmount(val)}
                      >
                        {formatRupiah(val)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Jumlah Custom (Rp):</label>
                  <input
                    type="number"
                    placeholder="Masukkan jumlah saldo..."
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
                <button
                  className="w-full bg-secondary hover:bg-secondary-container text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md"
                  onClick={() => {
                    if (topUpAmount > 0) {
                      topUpWallet(topUpAmount);
                      setTopUpAmount('');
                    }
                  }}
                >
                  Isi Saldo Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAddresses = () => {
    const userAddresses = addresses.filter(a => a.userId === currentUser.id);

    const handleAddAddrSubmit = (e) => {
      e.preventDefault();
      if (!newAddrTitle || !newAddrDetail) return;
      addAddress(newAddrTitle, newAddrDetail);
      setNewAddrTitle('');
      setNewAddrDetail('');
    };

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Alamat Pengiriman</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Simpan alamat-alamat pengiriman Anda untuk mempermudah proses checkout pembelian barang.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Address List */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
            <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">Daftar Alamat Saya</h2>
            {userAddresses.length === 0 ? (
              <p className="text-on-surface-variant text-center py-10 font-medium">Belum ada alamat terdaftar.</p>
            ) : (
              <div className="space-y-4">
                {userAddresses.map(addr => (
                  <div key={addr.id} className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/20 flex justify-between items-center gap-4">
                    <div>
                      <strong className="block text-primary text-body-md font-bold">{addr.title}</strong>
                      <span className="text-sm text-on-surface-variant block mt-0.5">{addr.detail}</span>
                    </div>
                    <button
                      className="text-red-650 hover:bg-red-50 p-2 rounded-full border border-red-200 transition-colors flex items-center justify-center flex-shrink-0"
                      onClick={() => deleteAddress(addr.id)}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Address Form */}
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
            <h3 className="font-title-lg text-title-lg text-primary mb-4">Tambah Alamat Baru</h3>
            <form onSubmit={handleAddAddrSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Label Alamat</label>
                <input
                  type="text"
                  placeholder="e.g. Rumah, Kantor, Kosan..."
                  className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Alamat Lengkap</label>
                <textarea
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kota..."
                  className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={newAddrDetail}
                  onChange={(e) => setNewAddrDetail(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md">
                Simpan Alamat
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- SELLER / ADMIN VIEWS ---

  const renderInventory = () => {
    const sellerProducts = products.filter(p => p.storeId === currentUser.storeId);

    const handleProductSubmit = (e) => {
      e.preventDefault();
      if (!productForm.name || !productForm.price || !productForm.stock) return;

      if (editingProductId) {
        updateProduct(editingProductId, productForm);
        setEditingProductId(null);
      } else {
        addProduct(productForm);
      }

      setProductForm({ name: '', price: '', stock: '', description: '' });
    };

    const handleEditProductClick = (p) => {
      setEditingProductId(p.id);
      setProductForm({
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description
      });
    };

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Kelola Produk Toko</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Toko: <strong className="text-secondary">{currentStore?.name}</strong>. Atur katalog penawaran logistik Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Products List */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
            <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">Daftar Produk Toko</h2>
            {sellerProducts.length === 0 ? (
              <p className="text-on-surface-variant text-center py-10 font-medium">Toko Anda belum memiliki produk untuk dipasarkan.</p>
            ) : (
              <div className="divide-y divide-outline-variant/15">
                {sellerProducts.map(p => (
                  <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <strong className="block text-primary text-body-md font-bold">{p.name}</strong>
                      <div className="flex gap-3 text-xs text-on-surface-variant mt-1">
                        <span>Harga: <strong className="text-secondary">{formatRupiah(p.price)}</strong></span>
                        <span>Stok: <strong>{p.stock}</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-surface-container-high hover:bg-outline-variant/30 text-primary text-xs font-semibold px-3.5 py-1.5 rounded transition-all"
                        onClick={() => handleEditProductClick(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-transparent hover:bg-red-50 text-red-650 border border-red-200 text-xs font-semibold px-3.5 py-1.5 rounded transition-all"
                        onClick={() => deleteProduct(p.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Edit Product Form */}
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 h-fit">
            <h3 className="font-title-lg text-title-lg text-primary mb-4">
              {editingProductId ? 'Edit Data Produk' : 'Pasarkan Produk Baru'}
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Nama Produk</label>
                <input
                  type="text"
                  placeholder="e.g. Standard 20ft Container..."
                  className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Harga (Rp)</label>
                  <input
                    type="number"
                    placeholder="Nominal rupiah..."
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">Stok Awal</label>
                  <input
                    type="number"
                    placeholder="Unit..."
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-2">Deskripsi Spesifikasi</label>
                <textarea
                  placeholder="Rincian dimensi, material, sertifikasi..."
                  className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="w-full bg-primary hover:bg-primary-container text-on-primary py-2 rounded-lg font-bold text-sm transition-colors shadow-md">
                  {editingProductId ? 'Simpan Edit' : 'Pasarkan Barang'}
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    className="bg-surface-container-high hover:bg-outline-variant/35 text-primary px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({ name: '', price: '', stock: '', description: '' });
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminOrders = () => {
    const filteredOrders = currentUser.role === 'admin'
      ? orders
      : orders.filter(o => o.storeIds.includes(currentUser.storeId));

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">
            {currentUser.role === 'admin' ? 'Monitoring Semua Pesanan' : 'Kelola Order Masuk Toko'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {currentUser.role === 'admin' ? 'Pemantauan alur transaksi global seapedia.' : `Pesanan logistik masuk untuk toko ${currentStore?.name}`}
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">pending_actions</span>
            <p className="text-on-surface-variant font-medium text-lg">Belum ada order masuk.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => {
              const statusColors = {
                'UNPAID': 'bg-amber-100 text-amber-800 border-amber-250',
                'PAID': 'bg-blue-100 text-blue-800 border-blue-200',
                'SHIPPING': 'bg-sky-100 text-sky-800 border-sky-200',
                'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
                'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
              };

              return (
                <div key={order.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-md py-4 border-b border-outline-variant/20 flex justify-between items-center">
                    <div>
                      <strong className="text-primary text-body-md font-extrabold">{order.id}</strong>
                      <span className="text-xs text-on-surface-variant block mt-0.5">Pemesan: {order.buyerName}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="p-md grid grid-cols-1 lg:grid-cols-3 gap-lg">
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="font-label-md text-label-md text-primary">Barang Dipesan:</h4>
                      <ul className="divide-y divide-outline-variant/20">
                        {order.items.map(item => (
                          <li key={item.product.id} className="py-2 flex justify-between text-body-md">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span className="font-bold text-primary">{formatRupiah(item.product.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-xs text-on-surface-variant">
                        <p>📍 <strong>Alamat Kirim:</strong> {order.address}</p>
                        {order.driverName && <p className="mt-1">🚚 <strong>Driver Kurir:</strong> {order.driverName}</p>}
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                      <div className="mb-4">
                        <span className="text-xs text-on-surface-variant block mb-1">Total Tagihan:</span>
                        <strong className="text-lg text-secondary font-bold">{formatRupiah(order.total)}</strong>
                      </div>

                      {/* Control buttons */}
                      <div className="space-y-2 mt-auto">
                        {order.status === 'PAID' && (
                          <button
                            className="w-full bg-primary hover:bg-primary-container text-on-primary py-2 rounded-lg font-bold text-xs transition-colors"
                            onClick={() => acceptOrderDriver(order.id, { id: 'u-4', name: 'Driver Satu' })}
                          >
                            Kirim Barang (Assign Driver)
                          </button>
                        )}
                        {order.status === 'SHIPPING' && (
                          <button
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-xs transition-colors"
                            onClick={() => completeOrderDriver(order.id)}
                          >
                            Konfirmasi Sampai (Delivered)
                          </button>
                        )}
                        {(order.status === 'UNPAID' || order.status === 'PAID') && (
                          <button
                            className="w-full bg-transparent hover:bg-red-50 text-red-600 border border-red-200 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                            onClick={() => cancelOrder(order.id, 'Dibatalkan oleh Penjual/Admin')}
                          >
                            Batalkan Pesanan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    const storeOrders = currentUser.role === 'admin'
      ? orders.filter(o => o.status !== 'CANCELLED')
      : orders.filter(o => o.storeIds.includes(currentUser.storeId) && o.status !== 'CANCELLED');

    const totalSales = storeOrders.reduce((sum, o) => sum + (o.status !== 'UNPAID' ? o.total : 0), 0);
    const totalTransactions = storeOrders.length;
    const pendingOrders = storeOrders.filter(o => o.status === 'PAID' || o.status === 'SHIPPING').length;

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Analisis Toko</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Statistik penjualan riil dan efektivitas transaksi.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="text-xs text-on-surface-variant font-medium block mb-2">Total Penjualan Bersih</span>
            <h2 className="text-2xl font-black text-green-600">{formatRupiah(totalSales)}</h2>
            <p className="text-[10px] text-on-surface-variant/70 mt-2">*Hanya menghitung order yang telah lunas</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="text-xs text-on-surface-variant font-medium block mb-2">Transaksi Sukses</span>
            <h2 className="text-2xl font-black text-secondary">{totalTransactions} Order</h2>
            <p className="text-[10px] text-on-surface-variant/70 mt-2">Menghitung pesanan terbayar, dikirim, & sampai</p>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="text-xs text-on-surface-variant font-medium block mb-2">Order Aktif Diproses</span>
            <h2 className="text-2xl font-black text-amber-600">{pendingOrders} Paket</h2>
            <p className="text-[10px] text-on-surface-variant/70 mt-2">Sedang dalam proses pengantaran kurir</p>
          </div>
        </div>

        {/* Recent logs */}
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30">
          <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">Log Penjualan Terakhir</h2>
          {storeOrders.length === 0 ? (
            <p className="text-on-surface-variant text-center py-6">Belum ada aktivitas penjualan.</p>
          ) : (
            <div className="divide-y divide-outline-variant/15">
              {storeOrders.map(o => (
                <div key={o.id} className="py-3 flex justify-between items-center text-body-md">
                  <div>
                    <strong className="block text-primary font-bold">{o.id}</strong>
                    <span className="text-xs text-on-surface-variant">Buyer: {o.buyerName} | Status: {o.status}</span>
                  </div>
                  <strong className="text-primary font-extrabold">{formatRupiah(o.total)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- DRIVER VIEWS ---

  const renderDriverJobs = () => {
    const availableJobs = orders.filter(o => o.status === 'PAID');
    const myJobs = orders.filter(o => o.status === 'SHIPPING' && o.driverId === currentUser.id);

    return (
      <div>
        <div className="mb-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">Pengantaran Driver</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Terima pesanan logistik dari pelanggan dan kirim ke alamat tujuan.</p>
        </div>

        {/* Active job */}
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 mb-lg h-fit">
          <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">
            📦 Tugas Aktif Pengiriman ({myJobs.length})
          </h2>
          {myJobs.length === 0 ? (
            <p className="text-on-surface-variant text-center py-6 font-medium">Anda tidak memiliki tugas pengiriman saat ini.</p>
          ) : (
            <div className="space-y-4">
              {myJobs.map(job => (
                <div key={job.id} className="bg-sky-55/15 p-4 rounded-xl border border-sky-200">
                  <div className="flex justify-between items-center mb-3">
                    <strong className="text-primary font-bold text-body-md">{job.id}</strong>
                    <span className="bg-sky-100 text-sky-800 border border-sky-200 text-xs px-2.5 py-1 rounded-full font-bold">SHIPPING</span>
                  </div>
                  <div className="space-y-1 text-sm text-on-surface-variant mb-4">
                    <p>📍 <strong>Alamat Tujuan:</strong> {job.address}</p>
                    <p>👤 <strong>Penerima:</strong> {job.buyerName}</p>
                  </div>
                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-md"
                    onClick={() => completeOrderDriver(job.id)}
                  >
                    ✓ Konfirmasi Selesai Kirim (Paket Sampai)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available jobs */}
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30">
          <h2 className="font-title-lg text-title-lg text-primary mb-4 border-b border-outline-variant/20 pb-3">
            🚀 Daftar Order Siap Diambil ({availableJobs.length})
          </h2>
          {availableJobs.length === 0 ? (
            <p className="text-on-surface-variant text-center py-6 font-medium">Belum ada order logistik yang siap diambil saat ini.</p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {availableJobs.map(job => (
                <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <strong className="block text-primary text-body-md font-bold">Order: {job.id}</strong>
                    <div className="space-y-0.5 text-xs text-on-surface-variant mt-1">
                      <p>📍 Alamat Kirim: {job.address}</p>
                      <p>Pelanggan: {job.buyerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded border border-green-200">Ongkir: Rp10.000</span>
                    <button
                      className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      onClick={() => acceptOrderDriver(job.id, currentUser)}
                    >
                      Ambil Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- MAIN APP RENDER ---

  // GUEST / GUEST LANDING VIEW (Mockup 2)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-background bg-store-grid relative overflow-x-hidden">
        {/* Background Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-400/10 blur-[130px] animate-blob-1"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-blue-400/10 blur-[150px] animate-blob-2"></div>
        </div>

        {/* Guest Header */}
        <header className="bg-primary/95 backdrop-blur-md shadow-md sticky top-0 z-50 transition-all duration-300 relative z-10">
          <div className="flex justify-between items-center h-[72px] px-md max-w-container-max mx-auto w-full">
            <div className="flex items-center gap-sm">
              <span className="text-title-lg font-title-lg font-bold text-on-primary tracking-tight">SEAPEDIA</span>
            </div>

            <nav className="hidden md:flex items-center gap-md">
              <button onClick={() => setShowLoginModal(true)} className="font-label-md text-label-md text-on-primary opacity-80 hover:opacity-100 transition-opacity px-sm py-xs rounded-lg">
                Marketplace
              </button>
              <button onClick={() => setShowLoginModal(true)} className="font-label-md text-label-md text-on-primary opacity-80 hover:opacity-100 transition-opacity px-sm py-xs rounded-lg">
                Services
              </button>
              <button onClick={() => setShowLoginModal(true)} className="font-label-md text-label-md text-on-primary opacity-80 hover:opacity-100 transition-opacity px-sm py-xs rounded-lg">
                Help
              </button>
            </nav>

            <div className="flex items-center gap-md">
              <button
                onClick={() => { setIsSignUp(false); setShowLoginModal(true); }}
                className="hidden md:flex font-label-md text-label-md text-white border border-white/30 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                Log In / Register
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-on-primary hover:bg-primary-container/50 p-2 rounded-full transition-colors flex items-center justify-center relative"
                aria-label="shopping_cart"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_cart</span>
              </button>
            </div>
          </div>
        </header>

        {/* Guest Hero Section */}
        <main className="flex-grow">
          <section className="relative bg-surface-container-lowest overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-primary-fixed-dim/20 pointer-events-none"></div>
            <div className="max-w-container-max mx-auto px-gutter py-xl md:py-[100px] grid grid-cols-1 lg:grid-cols-12 gap-lg items-center relative z-10">

              {/* Hero Text */}
              <div className="lg:col-span-5 flex flex-col items-start space-y-md">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm rounded-full mb-1">
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  Global Reach, Local Feel
                </div>
                <h1 className="font-display-lg text-4xl md:text-5xl text-primary font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-indigo-600 select-none">
                  The All-in-One Marketplace for Everyone
                </h1>
                <p className="font-body-lg text-body-md text-on-surface-variant max-w-md">
                  Connect with reliable global logistics and a vast consumer e-commerce ecosystem. Seamlessly switch between buying and selling with enterprise-grade reliability.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => { setIsSignUp(true); setShowLoginModal(true); }}
                    className="bg-primary text-on-primary hover:bg-primary-container transition-colors font-semibold px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
                  >
                    Join the Ecosystem
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => { setIsSignUp(false); setShowLoginModal(true); }}
                    className="bg-transparent text-secondary border border-secondary hover:bg-secondary/5 transition-colors font-semibold px-6 py-3 rounded-lg flex items-center"
                  >
                    Explore Marketplace
                  </button>
                </div>
              </div>

              {/* Hero Image / Design Graphic Placeholder */}
              <div className="lg:col-span-7 relative h-[360px] md:h-[450px] w-full mt-lg lg:mt-0">
                <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-outline-variant bg-white/80 backdrop-blur-sm bg-store-grid flex flex-col items-center justify-center p-8">
                  <span className="material-symbols-outlined text-[96px] text-secondary/40 mb-4 animate-pulse">hub</span>
                  <h3 className="text-xl font-bold text-primary mb-2">Simulasi Transaksi Logistik Terpadu</h3>
                  <p className="text-sm text-on-surface-variant text-center max-w-md">
                    Mengintegrasikan Akun Pembeli, Penjual (Toko), Driver Pengantar, dan Admin Sistem dalam satu database transaksi real-time.
                  </p>
                  <div className="mt-6 flex gap-3 text-xs bg-slate-200/50 px-4 py-2.5 rounded-full border border-slate-300">
                    <span className="font-semibold text-primary">✓ Buyer</span>
                    <span className="font-semibold text-primary">✓ Seller</span>
                    <span className="font-semibold text-primary">✓ Driver</span>
                    <span className="font-semibold text-primary">✓ Admin</span>
                  </div>
                </div>

                {/* Floating Info Stats Widget */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-surface-variant shadow-lg flex items-center gap-3 max-w-xs hidden md:flex">
                  <div className="bg-secondary-fixed text-on-secondary-fixed p-2.5 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">package_2</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-primary">100% Digital</div>
                    <div className="text-xs text-on-surface-variant">Real-Time Event Logs Clock</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Categories Bento Grid */}
          <section className="bg-surface py-xl">
            <div className="max-w-container-max mx-auto px-gutter">
              <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="font-headline-lg text-2xl md:text-3xl text-primary font-bold mb-xs">Featured Categories</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">Discover the core pillars of the SEAPEDIA ecosystem.</p>
                </div>
                <button onClick={() => setShowLoginModal(true)} className="text-secondary font-semibold flex items-center gap-1 hover:underline group">
                  View All Categories
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-md h-auto md:h-[420px]">
                {/* Bento Item 1: Marketplace */}
                <div
                  onClick={() => setShowLoginModal(true)}
                  className="md:col-span-2 relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-slate-900 border border-outline-variant flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white/50 select-none">
                    <span className="material-symbols-outlined text-white/10 text-9xl">storefront</span>
                  </div>
                  <div className="absolute bottom-0 left-0 p-8 w-full z-20">
                    <div className="bg-white/20 backdrop-blur-sm w-fit p-1.5 rounded-lg mb-3 border border-white/10">
                      <span className="material-symbols-outlined text-white text-[20px] block" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                    </div>
                    <h3 className="font-headline-md text-2xl font-bold text-white mb-2">Marketplace Katalog</h3>
                    <p className="text-sm text-white/80 max-w-md hidden md:block">Beli peti kemas grade ekspor, alat berat forklift, dan kebutuhan cargo dari supplier terverifikasi.</p>
                  </div>
                </div>

                {/* Bento Stacked Side */}
                <div className="grid grid-rows-2 gap-md h-full">
                  {/* Bento Item 2: Services */}
                  <div
                    onClick={() => setShowLoginModal(true)}
                    className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-slate-800 border border-outline-variant flex flex-col justify-end p-6 text-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
                    <span className="material-symbols-outlined text-white/5 text-8xl absolute top-4 right-4 select-none">handshake</span>
                    <div className="relative z-20">
                      <h3 className="font-title-lg text-lg font-bold mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">handshake</span>
                        Mitra Services
                      </h3>
                      <p className="text-xs text-white/80">Hubungkan bisnis dengan penyedia cargo surveyor.</p>
                    </div>
                  </div>

                  {/* Bento Item 3: Delivery */}
                  <div
                    onClick={() => setShowLoginModal(true)}
                    className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-slate-800 border border-outline-variant flex flex-col justify-end p-6 text-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10"></div>
                    <span className="material-symbols-outlined text-white/5 text-8xl absolute top-4 right-4 select-none">local_shipping</span>
                    <div className="relative z-20">
                      <h3 className="font-title-lg text-lg font-bold mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                        Logistik Delivery
                      </h3>
                      <p className="text-xs text-white/80">Lacak pengantaran instan oleh driver terdaftar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-surface-container-low py-xl border-y border-outline-variant">
            <div className="max-w-container-max mx-auto px-gutter">
              <div className="text-center mb-lg">
                <h2 className="font-headline-lg text-2xl md:text-3xl text-primary font-bold mb-xs">Trusted by Thousands</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">See what our community has to say about the SEAPEDIA experience.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">

                {/* Review 1 */}
                <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between h-full hover:-translate-y-1 transition-transform duration-300">
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="font-body-md text-sm text-on-surface italic mb-4">
                      "Fitur pergantian persona multi-role sangat mempermudah saya menguji alur jual-beli barang secara instan tanpa perlu repot logout berulang kali!"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">A</div>
                    <div>
                      <p className="text-xs font-bold text-primary">Adit Pratama</p>
                      <p className="text-[10px] text-on-surface-variant">QA Specialist</p>
                    </div>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between h-full hover:-translate-y-1 transition-transform duration-300">
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="font-body-md text-sm text-on-surface italic mb-4">
                      "Simulation Engine Clock-nya bekerja dengan sangat baik. Menguji deadline pembayaran pesanan 2 jam berjalan lancar dengan memajukan jam simulasi."
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">R</div>
                    <div>
                      <p className="text-xs font-bold text-primary">Rian D.</p>
                      <p className="text-[10px] text-on-surface-variant">Frontend Developer</p>
                    </div>
                  </div>
                </div>

                {/* Review 3 */}
                <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between h-full hover:-translate-y-1 transition-transform duration-300">
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="font-body-md text-sm text-on-surface italic mb-4">
                      "Integrasi wallet history dan pemesanan driver kurir berfungsi 100%. Desain visual baru ini jauh lebih bersih dan sangat premium."
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">M</div>
                    <div>
                      <p className="text-xs font-bold text-primary">Mega P.</p>
                      <p className="text-[10px] text-on-surface-variant">Product Designer</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </main>

        {/* Guest Footer */}
        <footer className="bg-surface-container-low border-t border-outline-variant full-width mt-auto">
          <div className="max-w-container-max mx-auto px-gutter py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-outline-variant/20 pb-8 mb-8">
              <div>
                <span className="text-title-lg font-title-lg font-bold text-primary block">SEAPEDIA</span>
                <p className="font-body-md text-sm text-on-surface-variant mt-2 max-w-sm">Empowering global logistics through a unified marketplace system.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowLoginModal(true)} className="text-xs text-on-surface-variant hover:text-secondary font-semibold">Terms of Service</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => setShowLoginModal(true)} className="text-xs text-on-surface-variant hover:text-secondary font-semibold">Privacy Policy</button>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant text-center">© 2026 SEAPEDIA Logistics Ecosystem. All rights reserved.</p>
          </div>
        </footer>

        {/* Modal Auth Dialog */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 max-w-md w-full shadow-2xl relative">

              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:bg-slate-100 p-1.5 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="text-center mb-6">
                <h2 className="font-display-lg text-2xl font-black text-primary mb-1">
                  {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke SEAPEDIA'}
                </h2>
                <p className="text-xs text-on-surface-variant">Simulasi Platform Logistik Terintegrasi</p>
              </div>

              {/* Login/Register Selector */}
              <div className="flex bg-slate-100 rounded-lg p-1 mb-5 border border-outline-variant/20">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!isSignUp ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Masuk Sesi
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${isSignUp ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Daftar Baru
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        placeholder="Nama lengkap..."
                        className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="user@domain.com"
                        className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="Username..."
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Password..."
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-primary focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">Peran Akun (Multi-Role)</label>
                    <div className="flex gap-2">
                      {['buyer', 'seller', 'driver'].map(role => {
                        const active = authRoles.includes(role);
                        return (
                          <button
                            type="button"
                            key={role}
                            onClick={() => handleRoleToggle(role)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-transparent text-on-surface-variant border-outline-variant'}`}
                          >
                            {role === 'buyer' ? 'Pembeli' : role === 'seller' ? 'Penjual' : 'Kurir'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary-container text-white py-2.5 rounded-lg font-bold text-xs transition-colors shadow-md mt-2"
                >
                  {isSignUp ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
                </button>
              </form>

              {/* Instant Demo Accounts Selector */}
              <div className="mt-5 pt-4 border-t border-outline-variant/20">
                <span className="text-[10px] text-on-surface-variant/80 font-bold tracking-wider uppercase block text-center mb-2.5">
                  Pilih Akun Demo Instan
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleDemoLogin(u)}
                      className="bg-slate-50 hover:bg-secondary-fixed/30 border border-outline-variant/30 rounded-lg p-2 text-left transition-all flex flex-col"
                    >
                      <strong className="text-[11px] text-primary leading-tight font-extrabold">{u.name}</strong>
                      <span className="text-[9px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-wide">
                        {u.role === 'buyer-seller' ? 'Multi-Role' : u.role === 'driver' ? 'Kurir' : u.role === 'buyer' ? 'Pembeli' : u.role === 'seller' ? 'Penjual' : u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // --- LOGGED IN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background bg-store-grid relative overflow-x-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-400/5 blur-[120px] animate-blob-1"></div>
        <div className="absolute bottom-20 right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[150px] animate-blob-2"></div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 bg-slate-900 border border-secondary text-white rounded-xl px-5 py-3.5 shadow-2xl z-[9999] flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-green-400">notifications_active</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-primary sticky top-0 z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-[72px] px-6 w-full">
          {/* Logo */}
          <div className="flex items-center gap-sm">
            <span className="text-title-lg font-title-lg font-bold text-on-primary tracking-tight">SEAPEDIA</span>
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded border border-white/15 ml-2 hidden sm:inline-block">Logged In</span>
          </div>

          {/* Quick Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Wallet Info */}
            {currentUser.role !== 'admin' && (
              <div className="hidden sm:flex items-center bg-white/10 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 text-xs gap-1.5">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <span>Saldo: <strong className="text-white font-extrabold">{formatRupiah(currentUser.walletBalance)}</strong></span>
              </div>
            )}

            {/* Sim Clock Display */}
            <div className="hidden sm:flex items-center bg-white/10 text-white/80 px-3 py-1.5 rounded-lg border border-white/10 text-xs gap-1.5">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Waktu: <strong className="text-white font-extrabold">{simTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong></span>
            </div>

            {/* Switch User dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-all rounded-lg px-3 py-2 border border-white/15 text-white text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[16px] text-white/70">switch_account</span>
                <span>
                  {currentUser.username === 'buyer1' && 'Pembeli (Buyer)'}
                  {currentUser.username === 'seller1' && 'Penjual (Seller)'}
                  {currentUser.username === 'driver1' && 'Kurir (Driver)'}
                  {currentUser.username === 'admin' && 'System Admin'}
                  {currentUser.username === 'multiuser' && 'Multi-Role User'}
                </span>
                <span className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${showPersonaDropdown ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {/* Dropdown Menu Box */}
              {showPersonaDropdown && (
                <>
                  {/* Backdrop click close */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowPersonaDropdown(false)} />
                  
                  {/* Options list */}
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/35 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in text-primary">
                    {[
                      { username: 'buyer1', label: 'Buyer Satu (Pembeli)', role: 'Buyer', icon: 'person' },
                      { username: 'seller1', label: 'Seller Satu (Penjual)', role: 'Seller', icon: 'storefront' },
                      { username: 'driver1', label: 'Driver Satu (Kurir)', role: 'Driver', icon: 'local_shipping' },
                      { username: 'admin', label: 'System Admin', role: 'Admin', icon: 'shield' },
                      { username: 'multiuser', label: 'Multi-Role User', role: 'Buyer + Seller', icon: 'group' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.username}
                        onClick={() => {
                          switchUser(item.username);
                          const selectedUser = users.find(u => u.username === item.username);
                          setDefaultTab(selectedUser?.role || 'buyer');
                          setShowPersonaDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors hover:bg-slate-50 ${currentUser.username === item.username ? 'bg-secondary-fixed/30 text-secondary font-bold' : 'text-on-surface-variant'}`}
                      >
                        <span className="material-symbols-outlined text-[16px] opacity-70">{item.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-primary">{item.label}</div>
                          <div className="text-[9px] text-on-surface-variant/80 font-medium uppercase mt-0.5">{item.role}</div>
                        </div>
                        {currentUser.username === item.username && (
                          <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center justify-center"
              title="Logout Sesi"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-grow flex w-full">

        {/* Left Navigation Sidebar */}
        <aside className={`transition-all duration-300 ${sidebarCollapsed ? 'w-20 pr-2' : 'w-64 pr-md'} flex-shrink-0 border-r border-outline-variant/30 hidden md:block py-lg`}>
          <div className="sticky top-24 space-y-6">

            {/* Tombol Toggle untuk Expand/Collapse */}
            <div className={`flex ${sidebarCollapsed ? 'justify-center' : 'justify-end'} px-2`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-lg transition-colors flex items-center justify-center border border-outline-variant/20"
                title={sidebarCollapsed ? "Perlebar Sidebar" : "Menciutkan Sidebar"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {sidebarCollapsed ? 'menu' : 'menu_open'}
                </span>
              </button>
            </div>

            {/* User Profile Overview */}
            <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold flex-shrink-0">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Sembunyikan detail user jika sidebar sedang mengecil */}
              {!sidebarCollapsed && (
                <div className="overflow-hidden animate-fade-in">
                  <h4 className="font-bold text-primary text-sm truncate leading-tight">{currentUser.name}</h4>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mt-0.5 truncate">{currentUser.role}</span>
                </div>
              )}
            </div>

            {/* Nav tabs list */}
            <nav className="space-y-1">
              {getNavItems().map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedProductId(null);
                  }}
                  className={`relative w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-4 py-2.5'} rounded-lg text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-primary'}`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <span className="material-symbols-outlined text-[20px] flex-shrink-0">{item.icon}</span>

                  {/* Tampilkan label teks hanya jika sidebar terbuka */}
                  {!sidebarCollapsed && (
                    <span className="flex-grow text-left truncate">{item.label}</span>
                  )}

                  {/* Atur Badge agar tetap presisi */}
                  {item.badge > 0 && (
                    <span className={`${sidebarCollapsed ? 'absolute top-1 right-1 px-1 py-0.5 text-[8px] leading-none' : 'ml-auto px-2 py-0.5 text-[10px]'} bg-primary text-white font-bold rounded-full`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Dashboard Main Content Panel */}
        <main className="flex-1 py-lg px-8 min-w-0 relative z-10">
          {/* Welcome Banner */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary via-slate-900 to-primary border border-white/10 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 top-[-50%] w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="text-[9px] text-green-400 font-extrabold uppercase tracking-widest bg-green-950/40 border border-green-800/30 px-2 py-0.5 rounded-md inline-block mb-2">SEAPEDIA PORTAL</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none">Selamat datang kembali, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200">{currentUser.name}</span>!</h1>
              <p className="text-xs text-white/70 mt-2 font-medium leading-relaxed">Simulasikan ekosistem logistik peti kemas, kurir pengiriman instan, dan alur pembayaran digital terpadu.</p>
            </div>
            
            {currentUser.role !== 'admin' && (
              <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl backdrop-blur-sm self-start sm:self-auto relative z-10 flex items-center gap-2.5 flex-shrink-0">
                <span className="material-symbols-outlined text-green-400 text-[20px]">payments</span>
                <div>
                  <span className="text-[10px] text-white/60 block leading-none mb-1 font-semibold">Saldo Dompet Anda</span>
                  <strong className="text-sm font-extrabold text-white block leading-none">{formatRupiah(currentUser.walletBalance)}</strong>
                </div>
              </div>
            )}
          </div>

          {activeTab === 'shop' && renderShop()}
          {activeTab === 'product-detail' && renderProductDetail()}
          {activeTab === 'cart' && renderCart()}
          {activeTab === 'checkout' && renderCheckout()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'wallet' && renderWallet()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'admin-orders' && renderAdminOrders()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'driver-jobs' && renderDriverJobs()}
        </main>
      </div>

      {/* Floating Simulation Engine clock (Widget 13) */}
      <div
        className="fixed bottom-6 right-6 w-80 bg-primary/95 text-white border border-secondary rounded-xl shadow-2xl z-50 backdrop-blur-md transition-all duration-300 overflow-hidden"
        style={{ transform: clockCollapsed ? 'translateY(calc(100% - 48px))' : 'translateY(0)' }}
      >
        {/* Widget Header */}
        <div
          onClick={() => setClockCollapsed(!clockCollapsed)}
          className="bg-slate-900 px-4 py-3 flex justify-between items-center cursor-pointer border-b border-white/10 hover:bg-slate-850"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 text-[18px] animate-pulse">schedule</span>
            <strong className="text-xs font-bold uppercase tracking-wider">Simulation Clock</strong>
          </div>
          <span className="text-xs font-semibold opacity-75">{clockCollapsed ? '▲ Buka' : '▼ Tutup'}</span>
        </div>

        {/* Widget Body */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] opacity-60 block">Hari Simulasi</span>
              <strong className="text-xs font-bold">
                {simTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] opacity-60 block">Sim Jam</span>
              <strong className="text-sm font-extrabold text-green-400">
                {simTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-xs transition-colors border border-white/10"
              onClick={() => advanceTime(1)}
            >
              +1 Jam
            </button>
            <button
              className="flex-1 bg-secondary hover:bg-secondary-container text-white font-bold py-2 rounded-lg text-xs transition-colors shadow"
              onClick={() => advanceTime(24)}
            >
              +24 Jam
            </button>
          </div>

          {/* Logs console */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Simulation Engine Logs:</span>
            <div className="h-28 overflow-y-auto bg-black/40 rounded-lg p-2.5 font-mono text-[9px] text-green-300 border border-white/5 space-y-1">
              {simLogs.map((log, idx) => (
                <div key={idx} className="leading-normal break-all">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
