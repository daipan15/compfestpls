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

export const AppProvider = ({ children }) => {
  // --- Global State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [walletHistory, setWalletHistory] = useState([]);

  // Clock Simulation
  const [simTime, setSimTime] = useState(new Date('2026-06-30T18:00:00'));
  const [simLogs, setSimLogs] = useState([]);

  // Toast Notification
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const addLog = (message) => {
    const timeStr = simTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSimLogs(prev => [`[${timeStr}] ${message}`, ...prev.slice(0, 49)]);
  };

  // --- Initial Data Load (Pre-seeding) ---
  useEffect(() => {
    const savedData = localStorage.getItem('compfest_state');

    if (savedData) {
      const data = JSON.parse(savedData);
      setUsers(data.users || []);
      setStores(data.stores || []);
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setAddresses(data.addresses || []);
      setVouchers(data.vouchers || []);
      setWalletHistory(data.walletHistory || []);

      const loggedInUser = data.users.find(u => u.username === (data.currentUsername || 'buyer1'));
      setCurrentUser(loggedInUser || data.users[0]);
      setSimTime(new Date(data.simTime || '2026-06-30T18:00:00'));
      setSimLogs(data.simLogs || ["System initialized."]);
    } else {
      // Pre-seed users
      const initialUsers = [
        { id: 'u-1', username: 'buyer1', name: 'Buyer Satu', password: 'Buyer123!', role: 'buyer', walletBalance: 1000000 },
        { id: 'u-2', username: 'seller1', name: 'Seller Satu', password: 'Seller123!', role: 'seller', storeId: 'store-1', walletBalance: 250000 },
        { id: 'u-3', username: 'admin', name: 'System Admin', password: 'Admin123!', role: 'admin', walletBalance: 0 },
        { id: 'u-4', username: 'driver1', name: 'Driver Satu', password: 'Driver123!', role: 'driver', walletBalance: 150000 },
        { id: 'u-5', username: 'multiuser', name: 'Multi Role User', password: 'Multi123!', role: 'buyer-seller', storeId: 'store-2', walletBalance: 500000 }
      ];

      // Pre-seed stores
      const initialStores = [
        { id: 'store-1', name: 'Seapedia Electro', description: 'Toko Elektronik & Aksesoris Terlengkap', rating: 4.8 },
        { id: 'store-2', name: 'Nusantara Snack & Food', description: 'Kudapan lokal nikmat khas Indonesia', rating: 4.5 }
      ];

      // Pre-seed products
      const initialProducts = [
        { id: 'product-1', storeId: 'store-1', name: 'Charger Gan 65W Rapid', description: 'Kepala charger fast charging hemat energi dan berukuran kecil', price: 120000, stock: 30, rating: 4.8, reviewsCount: 1, reviews: [{ author: 'UserX', rating: 5, comment: 'Bagus sekali, charging laptop super cepat!' }] },
        { id: 'product-2', storeId: 'store-1', name: 'Kabel USB-C SuperSpeed', description: 'Kabel data tebal dan awet mendukung transfer data cepat', price: 35000, stock: 100, rating: 4.5, reviewsCount: 1, reviews: [{ author: 'KabelLover', rating: 4, comment: 'Cukup awet untuk pemakaian harian.' }] },
        { id: 'product-3', storeId: 'store-2', name: 'Keripik Singkong Balado', description: 'Keripik singkong renyah dengan bumbu cabai asli khas Padang', price: 18000, stock: 150, rating: 4.7, reviewsCount: 1, reviews: [{ author: 'CamilanEnak', rating: 5, comment: 'Sangat pedas manis gurih mantap.' }] },
        { id: 'product-4', storeId: 'store-2', name: 'Kopi Susu Gula Aren 1L', description: 'Minuman kopi dingin botol satu liter buatan barista lokal', price: 65000, stock: 40, rating: 4.6, reviewsCount: 1, reviews: [{ author: 'KopiAddict', rating: 4, comment: 'Manisnya pas dan kopinya berasa.' }] }
      ];

      // Pre-seed addresses
      const initialAddresses = [
        { id: 'addr-1', userId: 'u-1', title: 'Rumah', detail: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan' },
        { id: 'addr-2', userId: 'u-1', title: 'Kantor', detail: 'Menara Kompas, Lt. 8, Palmerah, Jakarta Pusat' }
      ];

      // Pre-seed vouchers
      const initialVouchers = [
        { code: 'SEAPEDIA10', discountType: 'percent', value: 10, maxDiscount: 20000, minPurchase: 50000, active: true },
        { code: 'PROMOAWAL', discountType: 'fixed', value: 15000, maxDiscount: 15000, minPurchase: 30000, active: true }
      ];

      setUsers(initialUsers);
      setStores(initialStores);
      setProducts(initialProducts);
      setAddresses(initialAddresses);
      setVouchers(initialVouchers);
      setCurrentUser(initialUsers[0]); // Default buyer1
      setSimLogs(["Sistem diinisialisasi.", "Akun default: buyer1 (Saldo Dompet Rp1.000.000)."]);
    }
  }, []);

  // Save changes to localStorage on any state update
  useEffect(() => {
    if (users.length > 0) {
      const dataToSave = {
        users,
        stores,
        products,
        orders,
        addresses,
        vouchers,
        walletHistory,
        currentUsername: currentUser?.username || 'buyer1',
        simTime: simTime.toISOString(),
        simLogs
      };
      localStorage.setItem('compfest_state', JSON.stringify(dataToSave));
    }
  }, [users, stores, products, orders, addresses, vouchers, walletHistory, currentUser, simTime, simLogs]);

  // --- Auth Operations ---
  const login = (username, password) => {
    const user = users.find(u => u.username === username);
    if (user && user.password === password) {
      setCurrentUser(user);
      addLog(`User '${username}' berhasil login.`);
      showNotification(`Selamat datang kembali, ${user.name}!`);
      return true;
    }
    return false;
  };

  const logout = () => {
    addLog(`User '${currentUser?.username}' logout.`);
    setCurrentUser(null);
  };

  // Switch role helper for simulation purposes
  const switchUser = (username) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      addLog(`Simulasi: Pindah ke akun '${username}' (${user.role}).`);
      showNotification(`Beralih peran ke: ${user.name}`);
    }
  };

  // --- Cart Operations ---
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + qty) }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    showNotification(`${product.name} ditambahkan ke keranjang.`);
  };

  const updateCartQty = (productId, qty) => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showNotification("Produk dihapus dari keranjang.");
  };

  const clearCart = () => setCart([]);

  // --- Wallet Operations ---
  const topUpWallet = (amount) => {
    if (!currentUser) return;
    const amountVal = Number(amount);

    // Update current user balance
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + amountVal };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Record wallet transaction
    const newTx = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: 'TOPUP',
      amount: amountVal,
      timestamp: new Date(simTime).toISOString(),
      description: 'Isi Saldo Dompet (Top Up)'
    };
    setWalletHistory(prev => [newTx, ...prev]);
    addLog(`Top-up dompet berhasil: +${formatRupiah(amountVal)}`);
    showNotification(`Top Up ${formatRupiah(amountVal)} Berhasil!`);
  };

  // --- Address Management ---
  const addAddress = (title, detail) => {
    if (!currentUser) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      userId: currentUser.id,
      title,
      detail
    };
    setAddresses(prev => [...prev, newAddr]);
    addLog(`Menambahkan alamat baru: '${title}'`);
    showNotification("Alamat pengiriman berhasil ditambahkan.");
  };

  const deleteAddress = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    addLog("Menghapus alamat pengiriman.");
  };

  // --- Checkout & Orders ---
  const checkout = (addressId, voucherCode = '') => {
    if (!currentUser || cart.length === 0) return false;

    // Calculate original subtotal
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    let discount = 0;

    // Validate and apply discount
    if (voucherCode) {
      const voucher = vouchers.find(v => v.code === voucherCode && v.active);
      if (voucher && subtotal >= (voucher.minPurchase || 0)) {
        if (voucher.discountType === 'percent') {
          discount = Math.min(voucher.maxDiscount, (subtotal * voucher.value) / 100);
        } else {
          discount = voucher.value;
        }
      }
    }

    const total = subtotal - discount;

    // Create Order Object
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      items: [...cart],
      subtotal,
      discount,
      total,
      address: addresses.find(a => a.id === addressId)?.detail || 'Alamat tidak ditemukan',
      status: 'UNPAID', // Start as Unpaid to simulate overdue & payment deadlines
      createdAt: new Date(simTime).toISOString(),
      paymentDeadline: new Date(new Date(simTime).getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours deadline
      driverId: null,
      driverName: null,
      storeIds: [...new Set(cart.map(item => item.product.storeId))]
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    addLog(`Pesanan baru dibuat: ${orderId} senilai ${formatRupiah(total)}. Status: UNPAID.`);
    showNotification(`Pesanan ${orderId} dibuat! Selesaikan pembayaran.`);
    return orderId;
  };

  const payOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'UNPAID') return false;

    if (currentUser.walletBalance < order.total) {
      showNotification("Saldo dompet tidak cukup!");
      return false;
    }

    // Deduct buyer wallet balance
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance - order.total };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Record wallet transaction
    const newTx = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      type: 'PAYMENT',
      amount: -order.total,
      timestamp: new Date(simTime).toISOString(),
      description: `Pembayaran Pesanan ${orderId}`
    };
    setWalletHistory(prev => [newTx, ...prev]);

    // Pay store owners
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'PAID' };
      }
      return o;
    }));

    addLog(`Pesanan ${orderId} berhasil DIBAYAR.`);
    showNotification(`Pembayaran pesanan ${orderId} berhasil!`);
    return true;
  };

  const cancelOrder = (orderId, reason = 'Dibatalkan oleh pembeli') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'CANCELLED', cancellationReason: reason };
      }
      return o;
    }));
    addLog(`Pesanan ${orderId} dibatalkan. Alasan: ${reason}`);
    showNotification(`Pesanan ${orderId} dibatalkan.`);
  };

  // --- Driver Actions ---
  const acceptOrderDriver = (orderId, driver) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'SHIPPING',
          driverId: driver.id,
          driverName: driver.name
        };
      }
      return o;
    }));
    addLog(`Driver '${driver.name}' menerima pengantaran pesanan ${orderId}.`);
    showNotification(`Pesanan ${orderId} dalam perjalanan.`);
  };

  const completeOrderDriver = (orderId) => {
    let orderTotal = 0;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        orderTotal = o.total;
        return { ...o, status: 'DELIVERED' };
      }
      return o;
    }));

    // Reward driver with shipping fee (mocked at Rp 10.000)
    setUsers(prev => prev.map(u => {
      if (u.role === 'driver') {
        return { ...u, walletBalance: u.walletBalance + 10000 };
      }
      return u;
    }));

    addLog(`Pesanan ${orderId} telah sampai di tujuan. Selesai!`);
    showNotification(`Pesanan ${orderId} sukses dikirim.`);
  };

  // --- Admin/Seller Product Actions ---
  const addProduct = (productData) => {
    const newProduct = {
      id: `product-${Date.now()}`,
      storeId: currentUser.storeId || 'store-1',
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock)
    };
    setProducts(prev => [...prev, newProduct]);
    addLog(`Admin/Seller menambahkan produk baru: '${productData.name}'`);
    showNotification(`Produk ${productData.name} berhasil dijual.`);
  };

  const updateProduct = (productId, productData) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, ...productData, price: Number(productData.price), stock: Number(productData.stock) }
        : p
    ));
    addLog(`Mengubah informasi produk ID ${productId}`);
    showNotification("Produk berhasil diperbarui.");
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    addLog(`Menghapus produk ID ${productId}`);
    showNotification("Produk berhasil dihapus.");
  };

  // --- Reviews ---
  const addProductReview = (orderId, productId, rating, comment) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newReview = {
          author: currentUser.name,
          rating: Number(rating),
          comment
        };
        const updatedReviews = [newReview, ...(p.reviews || [])];
        const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        return {
          ...p,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: newRating
        };
      }
      return p;
    }));

    // Mark item in order as reviewed
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          reviewedProductIds: [...(o.reviewedProductIds || []), productId]
        };
      }
      return o;
    }));

    addLog(`Memberikan ulasan bintang ${rating} untuk produk.`);
    showNotification("Terima kasih atas ulasan Anda!");
  };

  // --- TIME SIMULATION ENGINE ---
  const advanceTime = (hours) => {
    const updatedTime = new Date(simTime.getTime() + hours * 60 * 60 * 1000);
    setSimTime(updatedTime);

    // Simulate background updates on orders
    setOrders(prev => {
      return prev.map(order => {
        // 1. Check Unpaid Payment Deadline (Overdue simulation)
        if (order.status === 'UNPAID') {
          const deadline = new Date(order.paymentDeadline);
          if (updatedTime >= deadline) {
            addLog(`Pesanan ${order.id} GAGAL dibayar sebelum tenggat waktu. Status: OVERDUE (DIBATALKAN).`);
            return { ...order, status: 'CANCELLED', cancellationReason: 'Batas waktu pembayaran habis (Overdue)' };
          }
        }

        // 2. Automate Delivery Steps for Paid orders
        if (order.status === 'PAID') {
          // Automatic Driver Assign after 1 hour simulation
          const paidTime = new Date(order.createdAt).getTime();
          const elapsedHours = (updatedTime.getTime() - paidTime) / (60 * 60 * 1000);

          if (elapsedHours >= 1) {
            addLog(`Simulasi: Driver menerima pesanan ${order.id}. Pengiriman dimulai.`);
            return {
              ...order,
              status: 'SHIPPING',
              driverId: 'u-4',
              driverName: 'Driver Satu'
            };
          }
        }

        if (order.status === 'SHIPPING') {
          // Automatic Delivery after 2 more hours
          const shipTime = new Date(order.createdAt).getTime() + 1 * 60 * 60 * 1000; // 1 hr after create
          const elapsedSinceShip = (updatedTime.getTime() - shipTime) / (60 * 60 * 1000);

          if (elapsedSinceShip >= 2) {
            addLog(`Simulasi: Pesanan ${order.id} telah tiba di tujuan.`);
            return { ...order, status: 'DELIVERED' };
          }
        }

        return order;
      });
    });

    addLog(`Waktu simulasi dimajukan ${hours} jam menjadi: ${updatedTime.toLocaleString('id-ID')}`);
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
