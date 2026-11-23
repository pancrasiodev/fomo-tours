import { useState, useEffect } from 'react';

const LEADS_STORAGE_KEY = 'lany_analytics_leads_v1';
const ORDERS_STORAGE_KEY = 'lany_analytics_orders_v1';

// Seed initial realistic data for Lany Cake Shop if none exists
const INITIAL_LEADS = [
  {
    id: 'lead-101',
    name: 'Wanjiku Kamau',
    phone: '+254 712 458 920',
    email: 'wanjiku.k@gmail.com',
    source: 'Contact Us Form',
    type: 'form_inquiry',
    occasion: '30th Birthday Celebration',
    eventDate: '2026-11-20',
    message: 'Looking for a 2kg Korean minimalist cake with blush pink drip and custom script writing for a surprise dinner party in Kilimani.',
    status: 'New',
    createdAt: '2026-11-08T14:32:00Z',
    budgetEstimate: 4200
  },
  {
    id: 'lead-102',
    name: 'Kevin Omondi & Brenda',
    phone: '+254 722 890 124',
    email: 'kevin.omondi@corpkenya.com',
    source: 'Custom Cake Builder',
    type: 'form_inquiry',
    occasion: 'Wedding / Bridal Ceremony',
    eventDate: '2026-12-14',
    message: 'Need a 3-tier botanical wedding cake for 100 guests in Karen. Top tier Belgian chocolate, middle tier tropical passion fruit, base tier red velvet.',
    status: 'Quoted',
    createdAt: '2026-11-07T11:15:00Z',
    budgetEstimate: 24000
  },
  {
    id: 'lead-103',
    name: 'Dr. Maureen Kiprop',
    phone: '+254 701 556 789',
    email: 'maureen.kiprop@uonbi.ac.ke',
    source: 'Custom Cake Builder',
    type: 'form_inquiry',
    occasion: 'Graduation Party',
    eventDate: '2026-11-25',
    message: 'Medical School graduation cake with edible stethoscope and diploma scroll for a celebration banquet in Ruiru.',
    status: 'Contacted',
    createdAt: '2026-11-06T16:45:00Z',
    budgetEstimate: 4500
  },
  {
    id: 'lead-104',
    name: 'Faith Njeri',
    phone: '+254 733 912 345',
    email: 'faith.njeri@yahoo.com',
    source: 'Contact Us Form',
    type: 'form_inquiry',
    occasion: 'Baby Shower / Gender Reveal',
    eventDate: '2026-11-18',
    message: 'Pastel clouds baby shower cake with colored sponge inside (gender reveal surprise) and 12 matching cupcakes for Westlands venue.',
    status: 'Converted',
    createdAt: '2026-11-05T09:20:00Z',
    budgetEstimate: 7200
  },
  {
    id: 'lead-105',
    name: 'Safaricom Innovation Hub (Brian)',
    phone: '+254 720 001 992',
    email: 'brian.k@safaricom.co.ke',
    source: 'Corporate Inquiry',
    type: 'form_inquiry',
    occasion: 'Corporate Event / Product Launch',
    eventDate: '2026-11-28',
    message: '5kg branded corporate anniversary slab with edible high-def company logo and green fondant piping.',
    status: 'Quoted',
    createdAt: '2026-11-04T13:10:00Z',
    budgetEstimate: 10500
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-7081',
    customerName: 'Amina Hassan',
    customerPhone: '+254 711 889 002',
    source: 'Ecommerce Cart',
    type: 'ecommerce_order',
    items: [
      { name: 'The Minimalist Birthday Cake', weight: '1.5 kg', flavor: 'Royal Red Velvet', qty: 1, price: 3200, inscription: 'Happy 24th Amina' }
    ],
    totalAmount: 3200,
    deliveryLocation: 'South C, Nairobi',
    deliveryDate: '2026-11-10',
    paymentStatus: 'Paid (M-Pesa)',
    orderStatus: 'Baking',
    createdAt: '2026-11-09T09:12:00Z'
  },
  {
    id: 'ORD-7080',
    customerName: 'Brian Mutua',
    customerPhone: '+254 728 334 119',
    source: 'Ecommerce Cart',
    type: 'ecommerce_order',
    items: [
      { name: 'Festive Celebration Birthday Cake', weight: '2 kg', flavor: 'Decadent Belgian Chocolate', qty: 1, price: 3800, inscription: 'Cheers to 30 Years!' },
      { name: 'Artisan Gourmet Cupcake Box', weight: 'Box of 12', flavor: 'Assorted Gourmet', qty: 1, price: 2400, inscription: '' }
    ],
    totalAmount: 6200,
    deliveryLocation: 'Ruiru (Near OJ), Kiambu',
    deliveryDate: '2026-11-09',
    paymentStatus: 'Paid (M-Pesa)',
    orderStatus: 'Out for Delivery',
    createdAt: '2026-11-08T17:40:00Z'
  },
  {
    id: 'ORD-7079',
    customerName: 'Cynthia Wambua',
    customerPhone: '+254 790 441 552',
    source: 'Ecommerce Cart',
    type: 'ecommerce_order',
    items: [
      { name: 'Chewy Belgian Chocolate Brownie Box', weight: '12 Squares', flavor: 'Sweet Snacks', qty: 2, price: 1800, inscription: '' }
    ],
    totalAmount: 3600,
    deliveryLocation: 'Westlands, Nairobi',
    deliveryDate: '2026-11-08',
    paymentStatus: 'Paid (M-Pesa)',
    orderStatus: 'Delivered',
    createdAt: '2026-11-07T14:22:00Z'
  },
  {
    id: 'ORD-7078',
    customerName: 'Denis Gikonyo',
    customerPhone: '+254 722 331 445',
    source: 'Ecommerce Cart',
    type: 'ecommerce_order',
    items: [
      { name: 'Honor & Laurels Graduation Cake', weight: '2 kg', flavor: 'Classic Vanilla Velvet', qty: 1, price: 4500, inscription: 'Congratulations Eng. Denis!' }
    ],
    totalAmount: 4500,
    deliveryLocation: 'Thika Road (Garden Estate)',
    deliveryDate: '2026-11-07',
    paymentStatus: 'Paid (M-Pesa)',
    orderStatus: 'Delivered',
    createdAt: '2026-11-06T10:15:00Z'
  },
  {
    id: 'ORD-7077',
    customerName: 'Esther Njoki',
    customerPhone: '+254 715 667 889',
    source: 'Ecommerce Cart',
    type: 'ecommerce_order',
    items: [
      { name: 'Pastel Clouds Baby Shower Cake', weight: '2 kg', flavor: 'Tropical Passion Fruit', qty: 1, price: 4800, inscription: 'Welcome Baby Liam' }
    ],
    totalAmount: 4800,
    deliveryLocation: 'Lavington, Nairobi',
    deliveryDate: '2026-11-06',
    paymentStatus: 'Paid (M-Pesa)',
    orderStatus: 'Delivered',
    createdAt: '2026-11-05T15:30:00Z'
  }
];

// Helper to get raw items
export function getStoredLeads() {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADS;
  }
}

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

// Record a new Lead from a form
export function recordLead(leadData) {
  const current = getStoredLeads();
  const newLead = {
    id: `lead-${Date.now()}`,
    source: leadData.source || 'Website Form',
    type: 'form_inquiry',
    name: leadData.name || 'Anonymous Inquiry',
    phone: leadData.phone || '',
    email: leadData.email || '',
    occasion: leadData.occasion || 'General Inquiry',
    eventDate: leadData.eventDate || leadData.date || '',
    message: leadData.message || '',
    status: 'New',
    budgetEstimate: leadData.budgetEstimate || 0,
    createdAt: new Date().toISOString()
  };

  const updated = [newLead, ...current];
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('lany_analytics_updated'));
  return newLead;
}

// Record a new Order from Ecommerce Cart Checkout
export function recordOrder(orderData) {
  const current = getStoredOrders();
  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: orderNumber,
    source: orderData.source || 'Ecommerce Cart',
    type: 'ecommerce_order',
    customerName: orderData.customerName || 'Online Shopper',
    customerPhone: orderData.customerPhone || '',
    items: orderData.items || [],
    totalAmount: orderData.totalAmount || 0,
    deliveryLocation: orderData.deliveryLocation || 'Nairobi',
    deliveryDate: orderData.deliveryDate || '',
    paymentStatus: orderData.paymentStatus || 'Pending M-Pesa',
    orderStatus: 'Received',
    createdAt: new Date().toISOString()
  };

  const updated = [newOrder, ...current];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('lany_analytics_updated'));
  return newOrder;
}

export function updateLeadStatus(id, newStatus) {
  const current = getStoredLeads().map(l => l.id === id ? { ...l, status: newStatus } : l);
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('lany_analytics_updated'));
}

export function updateOrderStatus(id, newStatus, newPaymentStatus) {
  const current = getStoredOrders().map(o => {
    if (o.id === id) {
      return {
        ...o,
        orderStatus: newStatus || o.orderStatus,
        paymentStatus: newPaymentStatus || o.paymentStatus
      };
    }
    return o;
  });
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('lany_analytics_updated'));
}

// Hook for Live Analytics
export function useAnalytics() {
  const [leads, setLeads] = useState(getStoredLeads());
  const [orders, setOrders] = useState(getStoredOrders());

  useEffect(() => {
    const handler = () => {
      setLeads(getStoredLeads());
      setOrders(getStoredOrders());
    };
    window.addEventListener('lany_analytics_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('lany_analytics_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const totalLeads = leads.length;
  const totalOrders = orders.length;
  const totalConversions = totalOrders + leads.filter(l => l.status === 'Converted').length;
  const totalEcommerceRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPipelineRevenue = leads.reduce((sum, l) => sum + (l.budgetEstimate || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalEcommerceRevenue / totalOrders) : 0;

  // Monthly trends combining leads and orders
  const monthlyTrends = [
    { month: 'Jun', leads: 8, orders: 12, revenue: 46000 },
    { month: 'Jul', leads: 14, orders: 18, revenue: 72000 },
    { month: 'Aug', leads: 12, orders: 15, revenue: 58000 },
    { month: 'Sep', leads: 16, orders: 22, revenue: 84000 },
    { month: 'Oct', leads: 20, orders: 28, revenue: 110000 },
    { month: 'Nov', leads: totalLeads + 15, orders: totalOrders + 20, revenue: totalEcommerceRevenue + 65000 },
  ];

  return {
    leads,
    orders,
    totalLeads,
    totalOrders,
    totalConversions,
    totalEcommerceRevenue,
    totalPipelineRevenue,
    avgOrderValue,
    monthlyTrends,
    recordLead,
    recordOrder,
    updateLeadStatus,
    updateOrderStatus
  };
}
