import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { bookingAPI } from '../utils/api';


const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  bookingStatus: null,
  currentBooking: null,
};


const CartContext = createContext();


const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => 
        !(item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId)
      );
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const itemsWithUpdatedQuantity = state.items.map(item => {
        if (item.eventId === action.payload.eventId && item.ticketTypeId === action.payload.ticketTypeId) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
      
      return {
        ...state,
        items: itemsWithUpdatedQuantity,
        total: calculateTotal(itemsWithUpdatedQuantity)
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...initialState
      };
    
    case 'BOOKING_START':
      return {
        ...state,
        loading: true,
        error: null,
        bookingStatus: 'pending'
      };
      
    case 'BOOKING_SUCCESS':
      return {
        ...state,
        loading: false,
        bookingStatus: 'completed',
        currentBooking: action.payload,
        items: [],
        total: 0
      };
      
    case 'BOOKING_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        bookingStatus: 'failed'
      };
      
    case 'RESET_BOOKING_STATUS':
      return {
        ...state,
        bookingStatus: null,
        error: null,
        currentBooking: null
      };
      
    default:
      return state;
  }
};

// Helper function to calculate total price
const calculateTotal = (items) => {
  const total = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  return Number(total.toFixed(2));
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const localData = localStorage.getItem('cart');
      const parsedData = localData ? JSON.parse(localData) : initialState;
      if (!parsedData.items || !Array.isArray(parsedData.items)) {
        console.warn('Invalid cart data in localStorage, resetting to initial state');
        return initialState;
      }
      parsedData.total = calculateTotal(parsedData.items);
      return parsedData;
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
      return initialState;
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [state]);
  
  const addToCart = (item) => {
    if (!item.eventId || !item.ticketTypeId || !item.ticketType || !item.price || item.quantity <= 0) {
      console.error('Invalid cart item:', item);
      return;
    }
    const payload = {
      eventId: item.eventId,
      ticketTypeId: item.ticketTypeId,
      ticketType: item.ticketType,
      price: Number(item.price.toFixed(2)),
      quantity: item.quantity
    };
    console.log('Adding to cart:', payload);
    dispatch({ type: 'ADD_ITEM', payload });
  };
  
  const removeFromCart = (eventId, ticketTypeId) => {
    dispatch({ 
      type: 'REMOVE_ITEM', 
      payload: { eventId, ticketTypeId }
    });
  };
  
  const updateQuantity = (eventId, ticketTypeId, quantity) => {
    if (quantity < 1) {
      removeFromCart(eventId, ticketTypeId);
      return;
    }
    
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { eventId, ticketTypeId, quantity }
    });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const createBooking = async (bookingStatus, attendeeInformation, paymentMethod = 'credit_card') => {
    console.log('Creating booking with items:', state.items);
    if (state.items.length === 0) {
      dispatch({ type: 'BOOKING_FAILURE', payload: 'Cart is empty' });
      return { success: false, message: 'Cart is empty' };
    }
    
    dispatch({ type: 'BOOKING_START' });
    
    try {
      const eventId = state.items[0].eventId;
      if (!eventId || !state.items.every(item => item.eventId === eventId)) {
        throw new Error('Invalid or mixed event IDs in cart');
      }
      
      const tickets = state.items.map(item => ({
        ticketType: item.ticketType,
        quantity: item.quantity,
        price: item.price
      }));
      
      const totalQuantity = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
      if (totalQuantity <= 0) {
        throw new Error('At least one ticket is required');
      }
      
      const calculatedTotal = Number(tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0).toFixed(2));
      if (Math.abs(calculatedTotal - state.total) > 0.01) {
        throw new Error(`Total amount mismatch: calculated=${calculatedTotal}, state=${state.total}`);
      }
      
      const bookingData = {
        event: eventId,
        tickets,
        totalAmount: calculatedTotal,
        bookingStatus,
        attendeeInformation,
        paymentMethod
      };
      
      console.log('Booking payload:', bookingData);
      const response = await bookingAPI.createBooking(bookingData);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (response.success) {
        dispatch({
          type: 'BOOKING_SUCCESS', 
          payload: response.data
        });
        return response;
      } else {
        throw new Error(response.message || 'Booking creation failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || error.message || 'Failed to create booking';
      console.error('Booking error:', errorMessage, 'Response:', error.response?.data);
      dispatch({
        type: 'BOOKING_FAILURE',
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };
  
  const cancelBooking = async (bookingId) => {
    try {
      const response = await bookingAPI.cancelBooking(bookingId);
      return response;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };
  
  const resetBookingStatus = () => {
    dispatch({ type: 'RESET_BOOKING_STATUS' });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        createBooking,
        cancelBooking,
        resetBookingStatus
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};