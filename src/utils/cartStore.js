import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lany_cakes_cart_v2';

export function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('lany_cart_updated'));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
}

export function addToCart(product, options = {}) {
  const current = getCart();
  const weight = options.weight || product.defaultWeight || '1.5 kg';
  const flavor = options.flavor || 'Classic Vanilla Velvet';
  const filling = options.filling || 'Swiss Buttercream';
  const icing = options.icing || 'Smooth Buttercream';
  const inscription = options.inscription || '';
  const price = Number(options.price || product.price || 2500);
  const extras = options.extras || {};
  const extrasList = options.extrasList || [];
  const referenceImage = options.referenceImage || '';
  const fulfillmentType = options.fulfillmentType || 'delivery';
  const deliveryZone = options.deliveryZone || 'cbd';
  const deliveryFee = options.deliveryFee !== undefined ? options.deliveryFee : 300;
  const deliveryDate = options.deliveryDate || '';
  const deliverySlot = options.deliverySlot || 'afternoon';

  // Unique item key identifying exact configuration
  const itemKey = `${product.id}_${weight}_${flavor}_${filling}_${icing}_${inscription}_${JSON.stringify(extras)}`;
  const existingIndex = current.findIndex(item => item.itemKey === itemKey);

  if (existingIndex > -1) {
    current[existingIndex].quantity += (options.quantity || 1);
  } else {
    current.push({
      itemKey,
      id: product.id,
      cakeId: product.id,
      name: product.name,
      image: product.image,
      weight,
      flavor,
      filling,
      icing,
      inscription,
      extras,
      extrasList,
      referenceImage,
      fulfillmentType,
      deliveryZone,
      deliveryFee,
      deliveryDate,
      deliverySlot,
      unitPrice: price,
      price,
      quantity: options.quantity || 1
    });
  }

  saveCart(current);
}

export function removeFromCart(itemKey) {
  const current = getCart().filter(i => i.itemKey !== itemKey);
  saveCart(current);
}

export function updateQuantity(itemKey, delta) {
  const current = getCart().map(item => {
    if (item.itemKey === itemKey) {
      const newQty = item.quantity + delta;
      return newQty > 0 ? { ...item, quantity: newQty } : null;
    }
    return item;
  }).filter(Boolean);
  saveCart(current);
}

export function clearCart() {
  saveCart([]);
}

export function useCart() {
  const [items, setItems] = useState(getCart());

  useEffect(() => {
    const handler = () => setItems(getCart());
    window.addEventListener('lany_cart_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('lany_cart_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
}
