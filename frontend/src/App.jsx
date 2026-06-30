import React, { useContext, useState } from 'react';
import { AppProvider, AppContext, formatRupiah } from './context/AppContext';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Wallet, 
  MapPin, 
  Clock, 
  ClipboardList, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Star, 
  User, 
  TrendingUp, 
  Edit3, 
  Search, 
  ArrowLeft, 
  Activity,
  UserCheck,
  Shield,
  Truck
} from 'lucide-react';

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
    advanceTime
  } = useContext(AppContext);

  // View States
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
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

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');

  // Clock widget collapse
  const [clockCollapsed, setClockCollapsed] = useState(false);

  if (!currentUser) {
    return (
      <div className="login-screen" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#090d16',
        backgroundImage: 'radial-gradient(at 50% 50%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)'
      }}>
        <div className="card" style={{ width: '400px', padding: '40px' }}>
          <h2 style={{ marginBottom: '24px', textAlign: 'center', fontFamily: 'var(--font-heading)' }} className="text-gradient">
            Login Bazaar CompFest
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
            Pilih pengguna simulasi di bawah untuk langsung masuk:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map(u => (
              <button 
                key={u.id}
                className="btn btn-secondary" 
                onClick={() => login(u.username, u.password)}
                style={{ justifyContent: 'space-between', padding: '16px' }}
              >
                <span>{u.name} ({u.role.toUpperCase()})</span>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)' }}>{u.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Determine navbar items based on role
  const getNavItems = () => {
    const items = [];
    if (currentUser.role === 'buyer' || currentUser.role === 'buyer-seller') {
      items.push({ id: 'shop', label: 'Belanja', icon: <ShoppingBag size={20} /> });
      items.push({ id: 'cart', label: 'Keranjang', icon: <ShoppingCart size={20} />, badge: cart.length });
      items.push({ id: 'orders', label: 'Pesanan Saya', icon: <ClipboardList size={20} /> });
      items.push({ id: 'wallet', label: 'Dompet Saya', icon: <Wallet size={20} /> });
      items.push({ id: 'addresses', label: 'Alamat', icon: <MapPin size={20} /> });
    }
    
    if (currentUser.role === 'seller' || currentUser.role === 'buyer-seller') {
      items.push({ id: 'inventory', label: 'Kelola Produk', icon: <Edit3 size={20} /> });
      items.push({ id: 'admin-orders', label: 'Pesanan Toko', icon: <ClipboardList size={20} /> });
      items.push({ id: 'analytics', label: 'Statistik Toko', icon: <TrendingUp size={20} /> });
    }

    if (currentUser.role === 'admin') {
      items.push({ id: 'analytics', label: 'Analytics Panel', icon: <TrendingUp size={20} /> });
      items.push({ id: 'admin-orders', label: 'Semua Pesanan', icon: <ClipboardList size={20} /> });
    }

    if (currentUser.role === 'driver') {
      items.push({ id: 'driver-jobs', label: 'Order Pengantaran', icon: <Truck size={20} /> });
      items.push({ id: 'wallet', label: 'Dompet Driver', icon: <Wallet size={20} /> });
    }

    return items;
  };

  const currentStore = stores.find(s => s.id === currentUser.storeId);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // --- RENDERING VIEWS ---

  const renderShop = () => {
    const filteredProducts = products.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStore = selectedStoreId ? p.storeId === selectedStoreId : true;
      return matchQuery && matchStore;
    });

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="text-gradient">Katalog Produk</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Cari barang elektronik & jajanan lokal favorit Anda</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              className="form-control" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <select 
            className="form-control" 
            value={selectedStoreId} 
            onChange={(e) => setSelectedStoreId(e.target.value)}
            style={{ width: '220px' }}
          >
            <option value="">Semua Toko</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3">
          {filteredProducts.map(p => {
            const store = stores.find(s => s.id === p.storeId);
            return (
              <div key={p.id} className="card card-primary-glow" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-secondary)', fontWeight: 600 }}>{store?.name}</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>Stok: {p.stock}</span>
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{p.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
                  {p.description.substring(0, 80)}...
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                  <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{p.rating}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({p.reviewsCount} Ulasan)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{formatRupiah(p.price)}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setSelectedProductId(p.id); setActiveTab('product-detail'); }}
                    >
                      Detail
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => addToCart(p, 1)}
                      disabled={p.stock === 0}
                    >
                      Beli
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          className="btn btn-secondary btn-sm" 
          onClick={() => { setActiveTab('shop'); setSelectedProductId(null); }}
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </button>

        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--color-primary)' }}>
                  {store?.name}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>⭐ {selectedProduct.rating} ({selectedProduct.reviewsCount} Ulasan)</span>
              </div>
              <h1 style={{ fontSize: '32px', marginBottom: '16px' }} className="text-gradient">{selectedProduct.name}</h1>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                {selectedProduct.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-success)' }}>
                  {formatRupiah(selectedProduct.price)}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: 'var(--text-secondary)' }}>Tersedia: {selectedProduct.stock} unit</span>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => addToCart(selectedProduct, 1)}
                disabled={selectedProduct.stock === 0}
                style={{ padding: '16px 32px' }}
              >
                Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card">
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Ulasan Pembeli ({selectedProduct.reviews?.length || 0})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
              selectedProduct.reviews.map((r, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.author}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={14} 
                          fill={idx < r.rating ? 'var(--color-warning)' : 'transparent'} 
                          color="var(--color-warning)" 
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{r.comment}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Belum ada ulasan untuk produk ini.</p>
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
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Keranjang Belanja</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Tinjau item belanjaan Anda sebelum checkout</p>

        {cart.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <ShoppingCart size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Keranjang Anda kosong.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('shop')}>Belanja Sekarang</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Cart List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div key={item.product.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{item.product.name}</h3>
                    <span style={{ fontSize: '14px', color: 'var(--color-success)', fontWeight: 600 }}>{formatRupiah(item.product.price)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '2px 8px', borderRadius: '4px' }}
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '2px 8px', borderRadius: '4px' }}
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="btn btn-danger btn-sm" 
                      style={{ padding: '8px' }}
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Ringkasan Belanja</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({cart.length} barang)</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Estimasi</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatRupiah(subtotal)}</span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px' }}
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

    const handleCheckoutSubmit = () => {
      if (!selectedAddrId) {
        showNotification("Pilih alamat pengiriman terlebih dahulu!");
        return;
      }
      const orderId = checkout(selectedAddrId, voucherInput);
      if (orderId) {
        setActiveTab('orders');
        setVoucherInput('');
      }
    };

    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('cart')} style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Kembali ke Keranjang
        </button>

        <h1 className="text-gradient" style={{ marginBottom: '24px' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Alamat Pengiriman */}
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }} className="text-gradient">1. Pilih Alamat Pengiriman</h2>
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Belum ada alamat terdaftar.</p>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('addresses')}>Tambah Alamat</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {addresses.map(addr => (
                    <label 
                      key={addr.id} 
                      className="card" 
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '16px', 
                        cursor: 'pointer',
                        borderColor: selectedAddrId === addr.id ? 'var(--color-primary)' : 'var(--border-color)'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="checkout_address" 
                        value={addr.id} 
                        checked={selectedAddrId === addr.id}
                        onChange={() => setSelectedAddrId(addr.id)}
                        style={{ marginTop: '4px' }}
                      />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>{addr.title}</strong>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{addr.detail}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Voucher Diskon */}
            <div className="card">
              <h2 style={{ fontSize: '18px', marginBottom: '16px' }} className="text-gradient">2. Gunakan Voucher Diskon</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Masukkan kode voucher (e.g. SEAPEDIA10, PROMOAWAL)" 
                  className="form-control"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                />
              </div>
              {appliedVoucher ? (
                <p style={{ color: 'var(--color-success)', fontSize: '14px', marginTop: '12px', fontWeight: 600 }}>
                  Voucher Berhasil Digunakan! Diskon: {formatRupiah(discount)}
                </p>
              ) : voucherInput ? (
                <p style={{ color: 'var(--color-danger)', fontSize: '14px', marginTop: '12px' }}>
                  Voucher tidak valid atau minimal pembelian tidak terpenuhi.
                </p>
              ) : (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {vouchers.map(v => (
                    <button 
                      key={v.code}
                      className="btn btn-secondary btn-sm"
                      onClick={() => setVoucherInput(v.code)}
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      {v.code} (Potongan {v.discountType === 'percent' ? `${v.value}%` : formatRupiah(v.value)})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rincian Harga & Bayar */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Rincian Tagihan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                <span>Subtotal Produk</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between' }}>
                <span>Biaya Pengiriman</span>
                <span style={{ color: 'var(--color-success)' }}>GRATIS</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Diskon Voucher</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px' }}>
              <span>Total Bayar</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatRupiah(total)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', marginBottom: '12px' }}
              onClick={handleCheckoutSubmit}
            >
              Buat Pesanan
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Dengan menekan tombol, pesanan Anda akan dibuat dengan status UNPAID. Anda memiliki batas waktu 2 jam simulasi untuk membayar menggunakan Dompet.
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
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Pesanan Saya</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Lacak status pengiriman dan bayar tagihan Anda</p>

        {buyerOrders.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Belum ada riwayat pesanan.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('shop')}>Belanja Sekarang</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {buyerOrders.map(order => {
              // Calculate remaining payment time limit (2 hours from created)
              const deadline = new Date(order.paymentDeadline);
              const isOverdue = simTime >= deadline;
              
              return (
                <div key={order.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '18px', marginRight: '12px' }}>{order.id}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      {order.status === 'UNPAID' && <span className="badge badge-unpaid">Menunggu Pembayaran</span>}
                      {order.status === 'PAID' && <span className="badge badge-pending">Diproses Penjual</span>}
                      {order.status === 'SHIPPING' && <span className="badge badge-shipping">Sedang Dikirim</span>}
                      {order.status === 'DELIVERED' && <span className="badge badge-delivered">Selesai</span>}
                      {order.status === 'CANCELLED' && <span className="badge badge-cancelled">Dibatalkan</span>}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
                    <div>
                      <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Daftar Produk:</h4>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {order.items.map(item => (
                          <li key={item.product.id} style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span>{formatRupiah(item.product.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        📍 <strong>Alamat:</strong> {order.address}
                      </p>
                      {order.driverName && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          🚚 <strong>Driver:</strong> {order.driverName}
                        </p>
                      )}
                      {order.cancellationReason && (
                        <p style={{ fontSize: '14px', color: 'var(--color-danger)', fontWeight: 600 }}>
                          ❌ <strong>Alasan Batal:</strong> {order.cancellationReason}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>Subtotal:</span>
                          <span>{formatRupiah(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-success)', marginBottom: '8px' }}>
                            <span>Diskon:</span>
                            <span>-{formatRupiah(order.discount)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', marginTop: '12px' }}>
                          <span>Total:</span>
                          <span style={{ color: 'var(--color-success)' }}>{formatRupiah(order.total)}</span>
                        </div>
                      </div>

                      {/* Action buttons based on status */}
                      <div style={{ marginTop: '20px' }}>
                        {order.status === 'UNPAID' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-warning)', marginBottom: '4px', textAlign: 'center' }}>
                              ⏰ Batas Bayar: <br /><strong>{new Date(order.paymentDeadline).toLocaleString('id-ID')}</strong>
                            </div>
                            <button 
                              className="btn btn-success btn-sm" 
                              onClick={() => payOrder(order.id)}
                              style={{ width: '100%' }}
                            >
                              Bayar Sekarang
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => cancelOrder(order.id, 'Dibatalkan oleh pembeli')}
                              style={{ width: '100%' }}
                            >
                              Batalkan
                            </button>
                          </div>
                        )}

                        {order.status === 'DELIVERED' && (
                          <div>
                            <p style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
                              🎉 Paket telah Anda terima!
                            </p>
                            
                            {/* Review Box for Items */}
                            {order.items.map(item => {
                              const alreadyReviewed = order.reviewedProductIds?.includes(item.product.id);
                              
                              if (alreadyReviewed) {
                                return (
                                  <div key={item.product.id} style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                                    ✓ Ulasan {item.product.name} telah dikirim.
                                  </div>
                                );
                              }

                              return (
                                <div key={item.product.id} className="card" style={{ padding: '12px', marginTop: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Beri Ulasan: {item.product.name}</span>
                                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                    {[1,2,3,4,5].map(star => (
                                      <Star 
                                        key={star} 
                                        size={16} 
                                        fill={star <= reviewRating ? 'var(--color-warning)' : 'transparent'} 
                                        color="var(--color-warning)" 
                                        onClick={() => setReviewRating(star)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                    ))}
                                  </div>
                                  <input 
                                    type="text" 
                                    placeholder="Ulasan Anda..." 
                                    className="form-control" 
                                    style={{ fontSize: '12px', padding: '6px 8px', marginBottom: '6px' }}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                  />
                                  <button 
                                    className="btn btn-primary btn-sm" 
                                    style={{ width: '100%', fontSize: '11px', padding: '4px' }}
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
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Dompet Digital</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Simulasikan pembayaran instan dan top-up saldo Anda</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Transaction History */}
          <div className="card">
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Riwayat Transaksi</h2>
            {userWalletTx.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Belum ada aktivitas transaksi.</p>
            ) : (
              <div className="table-list">
                {userWalletTx.map(tx => (
                  <div key={tx.id} className="table-row">
                    <div>
                      <strong style={{ display: 'block', fontSize: '15px' }}>{tx.description}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(tx.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <strong style={{ 
                      fontSize: '16px', 
                      color: tx.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {tx.amount > 0 ? '+' : ''}{formatRupiah(tx.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance & Topup card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(13, 20, 35, 0.9) 100%)', borderColor: 'var(--color-primary)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Saldo Dompet Aktif</span>
              <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-success)', marginBottom: '8px' }}>
                {formatRupiah(currentUser.walletBalance)}
              </h1>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID Dompet: {currentUser.id}</span>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Isi Saldo (Top-Up)</h3>
              <div className="form-group">
                <label>Pilih Nominal Cepat</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {[50000, 100000, 500000].map(val => (
                    <button 
                      key={val} 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setTopUpAmount(val)}
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  placeholder="Jumlah isi saldo custom..." 
                  className="form-control"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => {
                  if (topUpAmount > 0) {
                    topUpWallet(topUpAmount);
                    setTopUpAmount('');
                  }
                }}
              >
                Top-Up Sekarang
              </button>
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
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Alamat Pengiriman</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Kelola daftar alamat untuk memudahkan pengiriman pesanan</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Address List */}
          <div className="card">
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Daftar Alamat Saya</h2>
            {userAddresses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Belum ada alamat terdaftar.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userAddresses.map(addr => (
                  <div key={addr.id} className="card" style={{ padding: '16px', display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>{addr.title}</strong>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{addr.detail}</span>
                    </div>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteAddress(addr.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Address Form */}
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Tambah Alamat Baru</h3>
            <form onSubmit={handleAddAddrSubmit}>
              <div className="form-group">
                <label>Label Alamat</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rumah, Kantor, Kosan" 
                  className="form-control"
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Alamat Lengkap</label>
                <textarea 
                  placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota..." 
                  className="form-control"
                  value={newAddrDetail}
                  onChange={(e) => setNewAddrDetail(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Simpan Alamat
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- SELLER / ADMIN PANEL VIEWS ---

  const renderInventory = () => {
    // Show only products belonging to seller store
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
        <div style={{ marginBottom: '24px' }}>
          <h1 className="text-gradient">Kelola Produk Toko</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Toko Anda: <strong>{currentStore?.name}</strong></p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
          {/* Products List */}
          <div className="card">
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Katalog Produk Toko Anda</h2>
            {sellerProducts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Toko Anda belum memiliki produk untuk dijual.</p>
            ) : (
              <div className="table-list">
                {sellerProducts.map(p => (
                  <div key={p.id} className="table-row">
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '16px' }}>{p.name}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '12px' }}>Harga: {formatRupiah(p.price)}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Stok: {p.stock}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditProductClick(p)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
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
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>
              {editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Nama Produk</label>
                <input 
                  type="text" 
                  placeholder="e.g. Headphone Bluetooth" 
                  className="form-control"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Harga (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="35000" 
                    className="form-control"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Jumlah Stok</label>
                  <input 
                    type="number" 
                    placeholder="20" 
                    className="form-control"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Deskripsi Produk</label>
                <textarea 
                  placeholder="Tulis spesifikasi dan kelebihan produk..." 
                  className="form-control"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows="4"
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingProductId ? 'Simpan Edit' : 'Pasarkan Produk'}
                </button>
                {editingProductId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary"
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
    // Seller: show orders that contain products from seller's store
    // Admin: show all orders
    const filteredOrders = currentUser.role === 'admin' 
      ? orders 
      : orders.filter(o => o.storeIds.includes(currentUser.storeId));

    return (
      <div>
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Daftar Pesanan Toko</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {currentUser.role === 'admin' ? 'Monitoring seluruh pesanan sistem' : `Daftar pesanan masuk untuk toko ${currentStore?.name}`}
        </p>

        {filteredOrders.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Belum ada pesanan masuk.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredOrders.map(order => (
              <div key={order.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ fontSize: '18px', marginRight: '12px' }}>{order.id}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Buyer: {order.buyerName}</span>
                  </div>
                  <div>
                    {order.status === 'UNPAID' && <span className="badge badge-unpaid">UNPAID (Pending Payment)</span>}
                    {order.status === 'PAID' && <span className="badge badge-pending">PAID (Diproses)</span>}
                    {order.status === 'SHIPPING' && <span className="badge badge-shipping">SHIPPING (Dalam Perjalanan)</span>}
                    {order.status === 'DELIVERED' && <span className="badge badge-delivered">DELIVERED (Selesai)</span>}
                    {order.status === 'CANCELLED' && <span className="badge badge-cancelled">CANCELLED (Batal)</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
                  <div>
                    <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Barang dipesan:</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      {order.items.map(item => (
                        <li key={item.product.id} style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.product.name} (x{item.quantity})</span>
                          <span>{formatRupiah(item.product.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>📍 <strong>Tujuan:</strong> {order.address}</p>
                    {order.driverName && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>🚚 <strong>Driver:</strong> {order.driverName}</p>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <span>Total Tagihan:</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatRupiah(order.total)}</span>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.status === 'PAID' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => acceptOrderDriver(order.id, { id: 'u-4', name: 'Driver Satu' })}
                        >
                          Kirim Barang (Mulai Delivery)
                        </button>
                      )}
                      {order.status === 'SHIPPING' && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => completeOrderDriver(order.id)}
                        >
                          Selesaikan Pengantaran (Delivered)
                        </button>
                      )}
                      {(order.status === 'UNPAID' || order.status === 'PAID') && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => cancelOrder(order.id, 'Dibatalkan oleh Penjual/Admin')}
                        >
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    // Seller or Admin
    const storeOrders = currentUser.role === 'admin' 
      ? orders.filter(o => o.status !== 'CANCELLED')
      : orders.filter(o => o.storeIds.includes(currentUser.storeId) && o.status !== 'CANCELLED');
      
    const totalSales = storeOrders.reduce((sum, o) => sum + (o.status !== 'UNPAID' ? o.total : 0), 0);
    const totalTransactions = storeOrders.length;
    const pendingOrders = storeOrders.filter(o => o.status === 'PAID' || o.status === 'SHIPPING').length;

    return (
      <div>
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Analisis Toko</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Ringkasan performa finansial dan transaksi penjualan</p>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-3" style={{ marginBottom: '32px' }}>
          <div className="card">
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Total Pendapatan Bersih</span>
            <h2 style={{ fontSize: '28px', color: 'var(--color-success)' }}>{formatRupiah(totalSales)}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>*Hanya menghitung pesanan lunas</p>
          </div>
          <div className="card">
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Total Pesanan Sukses</span>
            <h2 style={{ fontSize: '28px', color: 'var(--color-primary)' }}>{totalTransactions} Transaksi</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Menghitung pesanan yang diproses/selesai</p>
          </div>
          <div className="card">
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Pesanan Aktif Diproses</span>
            <h2 style={{ fontSize: '28px', color: 'var(--color-warning)' }}>{pendingOrders} Paket</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Sedang dalam tahap proses & pengiriman</p>
          </div>
        </div>

        {/* Sales log list */}
        <div className="card">
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Daftar Penjualan Terakhir</h2>
          {storeOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Belum ada data penjualan.</p>
          ) : (
            <div className="table-list">
              {storeOrders.map(o => (
                <div key={o.id} className="table-row">
                  <div>
                    <strong>ID Transaksi: {o.id}</strong>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Buyer: {o.buyerName} | Status: {o.status}</span>
                  </div>
                  <strong>{formatRupiah(o.total)}</strong>
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
    // Show only orders in status PAID (jobs available to take) or currently assigned to this driver
    const availableJobs = orders.filter(o => o.status === 'PAID');
    const myJobs = orders.filter(o => o.status === 'SHIPPING' && o.driverId === currentUser.id);

    return (
      <div>
        <h1 className="text-gradient" style={{ marginBottom: '8px' }}>Pekerjaan Pengantaran</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Ambil tugas pengiriman paket belanjaan pelanggan</p>

        {/* Current Active Jobs */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>📦 Pengantaran Aktif Anda ({myJobs.length})</h2>
          {myJobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Anda sedang tidak mengantar paket saat ini.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myJobs.map(job => (
                <div key={job.id} className="card" style={{ background: 'rgba(14, 165, 233, 0.05)', borderColor: 'var(--color-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <strong>{job.id}</strong>
                    <span className="badge badge-shipping">Dalam Perjalanan</span>
                  </div>
                  <p style={{ fontSize: '14px', marginBottom: '6px' }}>📍 <strong>Tujuan Alamat:</strong> {job.address}</p>
                  <p style={{ fontSize: '14px', marginBottom: '16px' }}>👤 <strong>Nama Pelanggan:</strong> {job.buyerName}</p>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => completeOrderDriver(job.id)}
                  >
                    ✓ Konfirmasi Selesai Kirim
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Jobs list */}
        <div className="card">
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>🚀 Pekerjaan Tersedia ({availableJobs.length})</h2>
          {availableJobs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Belum ada pesanan yang siap diantar driver saat ini.</p>
          ) : (
            <div className="table-list">
              {availableJobs.map(job => (
                <div key={job.id} className="table-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Pesanan {job.id}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: 600 }}>Fee Driver: Rp10.000</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <div>📍 <strong>Alamat Kirim:</strong> {job.address}</div>
                    <div>👤 <strong>Pelanggan:</strong> {job.buyerName}</div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => acceptOrderDriver(job.id, currentUser)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Ambil Pekerjaan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className="notification-toast">
          <Activity size={18} color="var(--color-primary)" />
          <span>{notification}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <ShoppingBag size={26} color="var(--color-primary)" />
          <span>Bazaar CompFest</span>
        </div>

        <nav>
          <ul className="nav-links">
            {getNavItems().map(item => (
              <li key={item.id}>
                <a 
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedProductId(null);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{ 
                      marginLeft: 'auto', 
                      background: 'var(--color-primary)', 
                      color: '#fff', 
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '50%'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Simulator / User Profile */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px' }}>
              {currentUser.role === 'admin' ? <Shield size={20} color="var(--color-primary)" /> : <User size={20} />}
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>{currentUser.name}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentUser.role}</span>
              </div>
            </div>

            {/* Persona Switcher for Quick Testing */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ganti Persona Simulasi:</label>
              <select 
                className="form-control" 
                value={currentUser.username} 
                onChange={(e) => {
                  switchUser(e.target.value);
                  setActiveTab(e.target.value === 'driver1' ? 'driver-jobs' : (e.target.value === 'seller1' ? 'inventory' : (e.target.value === 'admin' ? 'analytics' : 'shop')));
                  setSelectedProductId(null);
                }}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <option value="buyer1">Buyer Satu (Pelanggan)</option>
                <option value="seller1">Seller Satu (Penjual)</option>
                <option value="driver1">Driver Satu (Kurir)</option>
                <option value="admin">System Admin</option>
                <option value="multiuser">Multi-Role User</option>
              </select>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={logout} style={{ width: '100%' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Selamat datang kembali,</h4>
            <h2>{currentUser.name}</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {(currentUser.role === 'buyer' || currentUser.role === 'buyer-seller' || currentUser.role === 'driver') && (
              <div className="user-profile-badge">
                <Wallet size={18} color="var(--color-success)" />
                <span>Saldo Dompet: <strong>{formatRupiah(currentUser.walletBalance)}</strong></span>
              </div>
            )}
            <div className="user-profile-badge">
              <Clock size={18} color="var(--color-primary)" />
              <span>Waktu: <strong>{simTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong></span>
            </div>
          </div>
        </header>

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

      {/* Simulation Clock Panel Widget */}
      <div 
        className="sim-clock-widget" 
        style={{ transform: clockCollapsed ? 'translateY(calc(100% - 48px))' : 'translateY(0)' }}
      >
        <div className="sim-clock-header" style={{ cursor: 'pointer' }} onClick={() => setClockCollapsed(!clockCollapsed)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--color-primary)" />
            <strong style={{ fontSize: '13px' }}>Simulation Engine Clock</strong>
          </div>
          <span style={{ fontSize: '12px' }}>{clockCollapsed ? '▲ Buka' : '▼ Tutup'}</span>
        </div>
        <div className="sim-clock-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Hari Simulasi</span>
              <strong style={{ fontSize: '14px' }}>{simTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Jam</span>
              <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>{simTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => advanceTime(1)}
              style={{ flex: 1, padding: '8px' }}
            >
              +1 Jam
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => advanceTime(24)}
              style={{ flex: 1, padding: '8px' }}
            >
              +24 Jam
            </button>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Simulation Event Log:</span>
            <div className="sim-logs">
              {simLogs.map((log, idx) => (
                <div key={idx} className="sim-log-item">
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
