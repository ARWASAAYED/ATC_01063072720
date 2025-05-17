
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';


const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};


const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGIN_FAILURE':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState };
    case 'REGISTER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'REGISTER_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'REGISTER_FAILURE':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PROFILE_REQUEST':
      return { ...state, loading: true, error: null };
    case 'UPDATE_PROFILE_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'UPDATE_PROFILE_FAILURE':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};


export const AuthProvider = ({ children }) => {
  
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const userData = localStorage.getItem('authUser');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          ...initialState,
          user,
          isAuthenticated: true
        };
      }
      return initialState;
    } catch (err) {
      console.error('Error loading user from localStorage:', err);
      return initialState;
    }
  });

  
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('authUser', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [state.user]);

  
  const login = async (email, password, rememberMe = false) => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      
      const response = await authAPI.login(email, password, rememberMe);
      
      if (response.success) {
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.user
        });

        return response.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || error.message || 'Login failed'
      });
      throw error;
    }
  };

  
  const register = async (name, email, password) => {
    dispatch({ type: 'REGISTER_REQUEST' });

    try {
     
      const response = await authAPI.register(name, email, password);
      
      if (response.success) {
        dispatch({ 
          type: 'REGISTER_SUCCESS', 
          payload: response.data 
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.response?.data?.message || error.message || 'Registration failed'
      });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  
  const updateUserProfile = async (userData) => {
    dispatch({ type: 'UPDATE_PROFILE_REQUEST' });

    try {
     
      const response = await authAPI.updateUserProfile(userData);
      
      if (response.success) {
      
        dispatch({
          type: 'UPDATE_PROFILE_SUCCESS',
          payload: response.data
        });
        
       
        if (localStorage.getItem('authUser')) {
          localStorage.setItem('authUser', JSON.stringify(response.data));
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      dispatch({
        type: 'UPDATE_PROFILE_FAILURE',
        payload: error.response?.data?.message || error.message || 'Profile update failed'
      });
      throw error;
    }
  };
  
  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    dispatch({ type: 'UPDATE_PROFILE_REQUEST' });

    try {
      
      const response = await authAPI.updatePassword(currentPassword, newPassword);
      
      if (response.success) {
        
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        dispatch({
          type: 'UPDATE_PROFILE_SUCCESS',
          payload: state.user
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Password update failed');
      }
    } catch (error) {
      dispatch({
        type: 'UPDATE_PROFILE_FAILURE',
        payload: error.response?.data?.message || error.message || 'Password update failed'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};