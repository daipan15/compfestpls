import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Helper to format currency
export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

export const AppProvider = ({ children }) => {
  // --- States ---
  const users = [
    { id: 1, name: 'Buyer Demo', username: 'buyer1', password: 'Buyer123!', role: 'buyer' },
    { id: 2, name: 'Seller Demo', username: 'seller1', password: 'Seller123!', role: 'seller' },
    { id: 3, name: 'Multi-Role User', username: 'multiuser', password: 'Multi123!', role: 'buyer-seller' },
    { id: 4, name: 'Kurir / Driver', username: 'driver1', password: 'Driver123!', role: 'driver' },
    { id: 5, name: 'Admin System', username: 'admin', password: 'Admin123!', role: 'admin' }
  ];
  const [currentUser, setCurrentUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);
  const [simTime, setSimTime] = useState(new Date('2026-06-30T18:00:00'));
  const [simLogs, setSimLogs] = useState(["Sistem siap digunakan."]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const addLog = (message) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSimLogs(prev => [`[${timeStr}] ${message}`, ...prev.slice(0, 49)]);
  };

  // --- API Fetch Helper ---
  const apiFetch = async (path, options = {}) => {
    const token = localStorage.getItem('compfest_token');
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Terjadi kesalahan pada server" }));
        throw new Error(errData.detail || "Gagal melakukan request");
      }

      return await res.json().catch(() => null);
    } catch (error) {
      console.error(`API Error on ${path}:`, error);
      throw error;
    }
  };

  // --- Fetch Core Data from Backend ---
  const loadCoreData = async () => {
    try {
      const storesData = await apiFetch("/stores");
      setStores(storesData || []);

      const productsData = await apiFetch("/products");
      setProducts(productsData || []);
      
      const clockData = await apiFetch("/clock");
      if (clockData && clockData.simTime) {
        setSimTime(new Date(clockData.simTime));
      }
    } catch (e) {
      console.error("Gagal memuat data utama:", e);
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    try {
      // Load cart
      if (currentUser.role === 'buyer' || currentUser.role === 'buyer-seller') {
        const cartData = await apiFetch("/cart");
        setCart(cartData.items || []);
        
        const addrData = await apiFetch("/addresses");
        setAddresses(addrData || []);
      }

      // Load wallet details
      if (currentUser.role !== 'admin') {
        const walletData = await apiFetch("/wallet");
        setWalletHistory(walletData.transactions || []);
        setCurrentUser(prev => prev ? { ...prev, walletBalance: walletData.balance } : null);
      }

      // Load orders
      const ordersData = await apiFetch("/orders");
      setOrders(ordersData || []);
    } catch (e) {
      console.error("Gagal memuat data pengguna:", e);
    }
  };

  // Fetch initial configuration data on load
  useEffect(() => {
    loadCoreData();
    const savedToken = localStorage.getItem('compfest_token');
    if (savedToken) {
      apiFetch("/auth/profile")
        .then(profile => {
          setCurrentUser(profile);
          addLog(`Berhasil auto-login sebagai '${profile.username}'.`);
        })
        .catch(() => {
          localStorage.removeItem('compfest_token');
          addLog("Token sesi kadaluarsa. Silakan login kembali.");
        });
    }
  }, []);

  // Fetch user data whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      setCart([]);
      setAddresses([]);
      setOrders([]);
      setWalletHistory([]);
    }
  }, [currentUser]);

  // Vouchers list for Checkout UI (Static fallback for view)
  const vouchers = [
    { code: 'SEAPEDIA10', discountType: 'percent', value: 10, maxDiscount: 20000, minPurchase: 50000, active: true },
    { code: 'PROMOAWAL', discountType: 'fixed', value: 15000, maxDiscount: 15000, minPurchase: 30000, active: true }
  ];

  // --- Auth Operations ---
  const login = async (username, password) => {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('compfest_token', res.access_token);
      
      const profile = await apiFetch("/auth/profile");
      setCurrentUser(profile);
      addLog(`User '${username}' berhasil login.`);
      showNotification(`Selamat datang kembali, ${profile.name}!`);
      return profile;
    } catch (e) {
      showNotification(e.message || "Gagal masuk");
      return null;
    }
  };

  const register = async (name, username, email, password, roles) => {
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, username, email, password, roles })
      });
      addLog(`User baru '${username}' berhasil terdaftar.`);
      showNotification("Registrasi berhasil! Menghubungkan sesi...");
      return await login(username, password);
    } catch (e) {
      showNotification(e.message || "Registrasi gagal");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('compfest_token');
    addLog(`User '${currentUser?.username}' logout.`);
    setCurrentUser(null);
    showNotification("Anda telah keluar.");
  };

  const switchUser = async (username) => {
    // Switch role helper in demo uses direct password matching by credential lists
    const credentials = {
      buyer1: "Buyer123!",
      seller1: "Seller123!",
      driver1: "Driver123!",
      admin: "Admin123!",
      multiuser: "Multi123!"
    };
    const pw = credentials[username];
    if (pw) {
      await login(username, pw);
      addLog(`Simulasi: Beralih ke akun '${username}'.`);
    }
  };

  // --- Cart Operations ---
  const addToCart = async (product, qty = 1) => {
    try {
      await apiFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity: qty })
      });
      await loadUserData();
      showNotification(`${product.name} ditambahkan ke keranjang.`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  const updateCartQty = async (productId, qty) => {
    try {
      await apiFetch(`/cart/items/${productId}?quantity=${qty}`, {
        method: "PUT"
      });
      await loadUserData();
    } catch (e) {
      showNotification(e.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await apiFetch(`/cart/items/${productId}`, {
        method: "DELETE"
      });
      await loadUserData();
      showNotification("Produk dihapus dari keranjang.");
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- Wallet Operations ---
  const topUpWallet = async (amount) => {
    try {
      await apiFetch("/wallet/topup", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) })
      });
      await loadUserData();
      showNotification(`Isi saldo ${formatRupiah(amount)} berhasil!`);
      addLog(`Mengisi saldo dompet: +${formatRupiah(amount)}`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- Address Management ---
  const addAddress = async (title, detail) => {
    try {
      await apiFetch("/addresses", {
        method: "POST",
        body: JSON.stringify({ title, detail })
      });
      await loadUserData();
      showNotification("Alamat pengiriman berhasil disimpan.");
      addLog(`Menambahkan alamat baru: '${title}'`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await apiFetch(`/addresses/${id}`, {
        method: "DELETE"
      });
      await loadUserData();
      showNotification("Alamat pengiriman dihapus.");
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- Checkout & Orders ---
  const checkout = async (addressId, voucherCode = '') => {
    try {
      const res = await apiFetch("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          addressId: Number(addressId),
          voucherCode: voucherCode || null
        })
      });
      await loadUserData();
      addLog(`Pesanan baru dibuat: ${res.orderId}. Status: UNPAID.`);
      showNotification(`Pesanan ${res.orderId} sukses dibuat.`);
      return res.orderId;
    } catch (e) {
      showNotification(e.message);
      return null;
    }
  };

  const payOrder = async (orderId) => {
    try {
      await apiFetch(`/orders/${orderId}/pay`, { method: "POST" });
      await loadUserData();
      addLog(`Pesanan ${orderId} lunas dibayar.`);
      showNotification(`Pembayaran pesanan ${orderId} sukses!`);
      return true;
    } catch (e) {
      showNotification(e.message);
      return false;
    }
  };

  const cancelOrder = async (orderId, reason = 'Dibatalkan oleh pembeli') => {
    try {
      await apiFetch(`/orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`, {
        method: "POST"
      });
      await loadUserData();
      addLog(`Pesanan ${orderId} dibatalkan: ${reason}`);
      showNotification(`Pesanan ${orderId} dibatalkan.`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- Driver Actions ---
  const acceptOrderDriver = async (orderId, driver) => {
    try {
      await apiFetch(`/delivery/${orderId}/accept`, { method: "POST" });
      await loadUserData();
      addLog(`Kurir ${driver.name} mengambil pesanan ${orderId}.`);
      showNotification(`Pesanan ${orderId} mulai dikirim.`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  const completeOrderDriver = async (orderId) => {
    try {
      await apiFetch(`/delivery/${orderId}/complete`, { method: "POST" });
      await loadUserData();
      addLog(`Pesanan ${orderId} sukses diantarkan.`);
      showNotification(`Pesanan ${orderId} selesai dikirim.`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- Seller/Admin Product Actions ---
  const addProduct = async (productData) => {
    try {
      await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(productData)
      });
      await loadCoreData();
      await loadUserData();
      showNotification(`Produk ${productData.name} berhasil dipasarkan.`);
      addLog(`Menambahkan produk jualan baru: ${productData.name}`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      await apiFetch(`/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(productData)
      });
      await loadCoreData();
      await loadUserData();
      showNotification("Informasi produk sukses diubah.");
    } catch (e) {
      showNotification(e.message);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await apiFetch(`/products/${productId}`, {
        method: "DELETE"
      });
      await loadCoreData();
      await loadUserData();
      showNotification("Produk sukses dihapus dari toko.");
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- Reviews ---
  const addProductReview = async (orderId, productId, rating, comment) => {
    try {
      await apiFetch(`/products/${productId}/reviews/${orderId}`, {
        method: "POST",
        body: JSON.stringify({ rating, comment })
      });
      await loadCoreData();
      await loadUserData();
      showNotification("Ulasan dikirim. Terima kasih!");
      addLog(`Memberikan ulasan bintang ${rating} pada produk.`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  // --- TIME SIMULATION ENGINE ---
  const advanceTime = async (hours) => {
    try {
      const res = await apiFetch(`/clock/advance?hours=${hours}`, { method: "POST" });
      setSimTime(new Date(res.simTime));
      
      await loadCoreData();
      await loadUserData();
      
      addLog(`Waktu simulasi dimajukan +${hours} jam.`);
      
      // Post detailed logs based on cron checks
      if (res.updates) {
        const u = res.updates;
        if (u.overdue_cancelled > 0) addLog(`Log: ${u.overdue_cancelled} pesanan dibatalkan (Overdue).`);
        if (u.delivery_started > 0) addLog(`Log: ${u.delivery_started} pesanan mulai dikirim kurir.`);
        if (u.delivery_completed > 0) addLog(`Log: ${u.delivery_completed} pesanan sukses tiba di tujuan.`);
      }
      showNotification(`Simulasi: +${hours} jam waktu berjalan.`);
    } catch (e) {
      showNotification(e.message);
    }
  };

  return (
    <AppContext.Provider value={{
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
    }}>
      {children}
    </AppContext.Provider>
  );
};
