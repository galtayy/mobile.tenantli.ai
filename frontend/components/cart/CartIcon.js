import React from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../lib/cartContext';

const CartIcon = () => {
  const router = useRouter();
  const { cart } = useCart();
  
  return (
    <button 
      onClick={() => router.push('/cart')}
      className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      aria-label="View your shopping cart"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
        />
      </svg>
      
      {/* Badge showing item count */}
      {cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cart.itemCount > 99 ? '99+' : cart.itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;