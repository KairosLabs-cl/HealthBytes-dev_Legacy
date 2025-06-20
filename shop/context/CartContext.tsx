import React, { createContext, useContext, useState, ReactNode } from "react";

//Definimos los tipos de los productos y del carrito

type CartItem = {
    id: number;
    quantity: number;
};

type CartContextType = {
    cart: CartItem[]; // Arreglo de productos en el carrito
    addToCart: (id: number) => void; // Función para agregar un producto al carrito
    removeFromCart: (id: number) => void; // Función para eliminar un producto del carrito
};

type CartProviderProps = {
    children: ReactNode; // Propiedades del proveedor del contexto
};



// Creamos el contexto del carrito
const CartContext = createContext<CartContextType | undefined>(undefined); //

// Proveedor del contexto del carrito
export const CartProvider = ({ children } : CartProviderProps) => {
    const [cart, setCart] = useState<CartItem[]>([]); // Estado del carrito

    // Función para agregar un producto al carrito
    const addToCart = (id: number) => {
        setCart((prev) => {
            const item = prev.find((i) => i.id === id); // Verifica si el producto ya está en el carrito
            let updatedCart;
            if (item) {
                return prev.map((i) =>
                i.id === id ? {...i, quantity: i.quantity + 1 } : i // Si está, incrementa la cantidad
                );

            } else {
                updatedCart = [...prev, { id, quantity: 1 }]; 
            }
            console.log("Carrito actualizado:", updatedCart);
            return updatedCart; // Retorna el carrito actualizado
            return [...prev, { id, quantity: 1 }]; // Si no está, lo agrega con cantidad 1
        });
    };

    // Función para eliminar un producto del carrito
    const removeFromCart = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id)); // Filtra el carrito para eliminar el producto
    }


    // Retornamos el contexto del carrito

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook para usar el contexto del carrito
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart tiene que ser usado dentro de un CartProvider");
    return context;
}