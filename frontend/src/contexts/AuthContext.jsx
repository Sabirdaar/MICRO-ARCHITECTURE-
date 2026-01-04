import React, { createContext, useContext, useEffect, useState } from 'react';
import { userService } from '../services/apiService';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user from token on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUserProfile(profile);
      setCurrentUser({ uid: profile.id, email: profile.email });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Token might be invalid, clear it
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError("");

      // ✅ Firebase client-side login
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      // ✅ Send ID Token to backend to get profile and backend session token
      const response = await userService.login({ idToken });

      const { token, user } = response;

      localStorage.setItem("authToken", token);

      setCurrentUser({ uid: user.id, email: user.email });
      setUserProfile({
        uid: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      // Map Firebase error codes to user-friendly messages
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password");
      } else {
        setError(err.message);
      }
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      console.log('🔄 Starting registration process...', userData);

      const response = await userService.register(userData);

      console.log('✅ Registration successful:', response.user.id);

      // Store token
      localStorage.setItem('authToken', response.token);

      // Set user data
      setCurrentUser({ uid: response.user.id, email: response.user.email });
      setUserProfile({
        uid: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
      });

      console.log('🎉 Registration completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);

      let message = 'Registration failed. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      }

      setError(message);
      return { success: false, error: message };
    }
  };

  const googleLogin = async () => {
    try {
      setError('');
      console.log('🔄 Clicked Google Sign-In...');

      // 1. Trigger Firebase Popup
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // 2. Get User Info
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log('✅ Firebase Google Sign-In Successful:', user.uid);

      // 3. Send to Backend
      // We will parse name from displayName to send to backend for profile creation
      const [firstName, ...rest] = (user.displayName || "User").split(" ");
      const lastName = rest.join(" ") || "";

      const response = await userService.googleAuth(idToken, user.email, firstName, lastName);

      console.log('✅ Backend Google login successful:', response.user.id);

      // 4. Store Token & State
      localStorage.setItem('authToken', response.token);

      setCurrentUser({ uid: response.user.id, email: response.user.email });
      setUserProfile({
        uid: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Google login error:', error);
      let message = 'Google login failed. Please try again.';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setUserProfile(null);
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    googleLogin,
    logout,
    clearError,
    error,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}