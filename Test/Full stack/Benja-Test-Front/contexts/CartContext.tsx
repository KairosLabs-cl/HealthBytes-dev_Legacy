import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ProductProps } from '@/components/ui/ProductCard';

type CartItem = {
  id: string;
  product: ProductProps;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: ProductProps) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: ProductProps) => {
    setItems(currentItems => {
      // Comprueba si el producto ya está en el carrito
      const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        // Si el producto ya está en el carrito, incrementa la cantidad
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      } else {
        // Si no, añade el producto al carrito
        return [...currentItems, { id: product.id, product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    console.log('CartContext removeFromCart called with ID:', productId);
    console.log('Current items before removal:', items);
    setItems(prevItems => {
      const filteredItems = prevItems.filter(item => item.product.id !== productId);
      console.log('Filtered items after removal:', filteredItems);
      return filteredItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(currentItems => {
      if (quantity <= 0) {
        return currentItems.filter(item => item.product.id !== productId);
      }
      
      return currentItems.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product.discount 
        ? item.product.price * (1 - item.product.discount / 100) 
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getItemCount,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}