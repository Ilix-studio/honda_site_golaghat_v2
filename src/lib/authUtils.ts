// // src/utils/authUtils.ts

// /**
//  * Utility functions for managing authentication state
//  */

// /**
//  * Dispatch a custom event when auth state changes
//  * This ensures components listening to the event can update immediately
//  */
// export const notifyAuthChange = () => {
//   window.dispatchEvent(new Event("authChange"));
// };

// /**
//  * Save token to localStorage and notify listeners
//  */
// export const setAuthToken = (token: string) => {
//   localStorage.setItem("authToken", token);
//   notifyAuthChange();
// };

// /**
//  * Remove token from localStorage and notify listeners
//  */
// export const removeAuthToken = () => {
//   localStorage.removeItem("authToken");
//   notifyAuthChange();
// };

// /**
//  * Get token from localStorage
//  */
// export const getAuthToken = (): string | null => {
//   return localStorage.getItem("authToken");
// };

// /**
//  * Check if user is authenticated
//  */
// export const isAuthenticated = (): boolean => {
//   return !!getAuthToken();
// };

// /**
//  * Decode JWT token (without verification - use only for reading data)
//  * For production, always verify token on backend
//  */
// export const decodeToken = (token: string): any => {
//   try {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     return payload;
//   } catch (error) {
//     console.error("Failed to decode token:", error);
//     return null;
//   }
// };

// /**
//  * Get user role from token
//  */
// export const getUserRole = (): string | null => {
//   const token = getAuthToken();
//   if (!token) return null;

//   const decoded = decodeToken(token);
//   return decoded?.role || null;
// };

// /**
//  * Check if token is expired
//  */
// export const isTokenExpired = (): boolean => {
//   const token = getAuthToken();
//   if (!token) return true;

//   const decoded = decodeToken(token);
//   if (!decoded || !decoded.exp) return true;

//   // Check if token expiration time is in the past
//   return decoded.exp * 1000 < Date.now();
// };

// /**
//  * Clear auth data and redirect to login
//  */
// export const logout = (navigate: (path: string) => void) => {
//   removeAuthToken();
//   navigate("/");
// };
