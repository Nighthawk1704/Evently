import { useEffect, useState, useCallback } from 'react';

const KEY = 'evently_cart';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { vendorId: null, items: [] }; }
  catch { return { vendorId: null, items: [] }; }
}
function write(cart) { localStorage.setItem(KEY, JSON.stringify(cart)); }

// Listeners across hook instances
const listeners = new Set();
function broadcast() { for (const l of listeners) l(); }

export function useCart() {
  const [cart, setCart] = useState(read);

  useEffect(() => {
    const sync = () => setCart(read());
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);

  const add = useCallback((product, quantity = 1) => {
    const current = read();
    const vendorId = String(product.vendor?._id || product.vendor);

    if (current.vendorId && current.vendorId !== vendorId) {
      const ok = confirm('Your cart contains items from a different vendor. Clear cart and add this item?');
      if (!ok) return false;
      const fresh = { vendorId, items: [{ product, quantity }] };
      write(fresh); setCart(fresh); broadcast();
      return true;
    }

    const existing = current.items.find(i => i.product._id === product._id);
    const next = existing
      ? { ...current, vendorId, items: current.items.map(i =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i) }
      : { vendorId, items: [...current.items, { product, quantity }] };
    write(next); setCart(next); broadcast();
    return true;
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    const current = read();
    const items = current.items
      .map(i => i.product._id === productId ? { ...i, quantity: Math.max(1, quantity) } : i);
    const next = { ...current, items };
    write(next); setCart(next); broadcast();
  }, []);

  const remove = useCallback((productId) => {
    const current = read();
    const items = current.items.filter(i => i.product._id !== productId);
    const next = items.length === 0 ? { vendorId: null, items: [] } : { ...current, items };
    write(next); setCart(next); broadcast();
  }, []);

  const clear = useCallback(() => {
    const next = { vendorId: null, items: [] };
    write(next); setCart(next); broadcast();
  }, []);

  const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return { cart, add, setQuantity, remove, clear, total, count };
}
