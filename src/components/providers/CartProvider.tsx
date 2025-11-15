"use client";

import * as React from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  photoUrl?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "ghuman-restaurant-cart";

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: [],
};

function loadCart(): CartState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.items)) return initialState;
    type StoredCartItem = {
      id?: unknown;
      name?: unknown;
      price?: unknown;
      photoUrl?: unknown;
      quantity?: unknown;
    };

    const normalized = (parsed.items as StoredCartItem[])
      .map((item): CartItem | null => {
        if (typeof item.id !== "string" || typeof item.name !== "string") {
          return null;
        }
        return {
          id: item.id,
          name: item.name,
          photoUrl: typeof item.photoUrl === "string" ? item.photoUrl : null,
          price: typeof item.price === "number" ? item.price : Number(item.price) || 0,
          quantity: Number(item.quantity) || 0,
        };
      })
      .filter((item): item is CartItem => item !== null);

    return {
      items: normalized,
    };
  } catch (err) {
    console.warn("Failed to load cart from storage", err);
    return initialState;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>(initialState);

  React.useEffect(() => {
    setState(loadCart());
  }, []);

  const updateState = React.useCallback((updater: (prev: CartState) => CartState) => {
    setState((prev) => {
      const nextState = updater(prev);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      }
      return nextState;
    });
  }, []);

  const addItem = React.useCallback<CartContextValue["addItem"]>(
    (item, quantity = 1) => {
      if (!item.id || !item.name) return;
      updateState((prev) => {
        const existing = prev.items.find((cartItem) => cartItem.id === item.id);
        if (existing) {
          return {
            items: prev.items.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem,
            ),
          };
        }
        return {
          items: [...prev.items, { ...item, quantity }],
        };
      });
    },
    [updateState],
  );

  const removeItem = React.useCallback<CartContextValue["removeItem"]>(
    (id) => {
      updateState((prev) => ({ items: prev.items.filter((item) => item.id !== id) }));
    },
    [updateState],
  );

  const clearCart = React.useCallback(() => {
    updateState(() => initialState);
  }, [updateState]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = React.useMemo<CartContextValue>(
    () => ({
      items: state.items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      clearCart,
    }),
    [state.items, totalItems, totalPrice, addItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
