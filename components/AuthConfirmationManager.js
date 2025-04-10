import React, { createContext, useContext, useState } from 'react';
import BottomPopup from './BottomPopup';

// Create context for auth and confirmation management
const AuthConfirmationContext = createContext(null);

/**
 * Provider component that manages authentication and confirmation popups
 * This allows any component in the app to trigger auth or confirmation popups
 */
export const AuthConfirmationProvider = ({ children }) => {
  // State for auth popup
  const [authVisible, setAuthVisible] = useState(false);
  const [authProps, setAuthProps] = useState({});
  const [authResolve, setAuthResolve] = useState(null);
  const [authReject, setAuthReject] = useState(null);
  
  // State for confirmation popup
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState({});
  const [confirmResolve, setConfirmResolve] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  
  /**
   * Request authentication from the user
   * @param {Object} props - Props for the DynamicAuthBlob component
   * @returns {Promise} - Resolves when authentication is complete, rejects when cancelled
   */
  const requestAuthentication = (props) => {
    return new Promise((resolve, reject) => {
      // Store the resolve and reject functions to call later
      setAuthResolve(() => resolve);
      setAuthReject(() => reject);
      
      // Set up the auth props with callbacks
      setAuthProps({
        ...props,
        onAuthenticate: async () => {
          try {
            // If the original props had an onAuthenticate function, call it
            if (props.onAuthenticate) {
              await props.onAuthenticate();
            }
            
            // Resolve the promise when authentication is complete
            if (authResolve) authResolve();
          } catch (error) {
            // If there's an error, keep the popup open
            console.error('Authentication error:', error);
          }
        }
      });
      
      // Show the auth popup
      setAuthVisible(true);
    });
  };
  
  /**
   * Request confirmation from the user
   * @param {Object} props - Props for the DynamicConfirmationBlob component
   * @returns {Promise} - Resolves when confirmed, rejects when cancelled
   */
  const requestConfirmation = (props) => {
    return new Promise((resolve, reject) => {
      // Store the resolve and reject functions to call later
      setConfirmResolve(() => resolve);
      setConfirmReject(() => reject);
      
      // Set up the confirmation props with callbacks
      setConfirmationProps({
        ...props,
        onConfirm: async () => {
          try {
            // If the original props had an onConfirm function, call it
            if (props.onConfirm) {
              await props.onConfirm();
            }
            
            // Close the popup and resolve the promise
            setConfirmationVisible(false);
            if (confirmResolve) confirmResolve();
          } catch (error) {
            console.error('Confirmation error:', error);
          }
        },
        onCancel: () => {
          // Close the popup and reject the promise
          setConfirmationVisible(false);
          if (confirmReject) confirmReject(new Error('User cancelled'));
        }
      });
      
      // Show the confirmation popup
      setConfirmationVisible(true);
    });
  };
  
  // Handle closing the auth popup
  const handleAuthClose = () => {
    setAuthVisible(false);
    if (authReject) authReject(new Error('User cancelled authentication'));
  };
  
  // Handle closing the confirmation popup
  const handleConfirmationClose = () => {
    setConfirmationVisible(false);
    if (confirmReject) confirmReject(new Error('User cancelled confirmation'));
  };
  
  // Context value
  const contextValue = {
    requestAuthentication,
    requestConfirmation
  };
  
  return (
    <AuthConfirmationContext.Provider value={contextValue}>
      {children}
      
      {/* Authentication Popup */}
      <BottomPopup
        visible={authVisible}
        onClose={handleAuthClose}
        type="auth"
        authProps={authProps}
      />
      
      {/* Confirmation Popup */}
      <BottomPopup
        visible={confirmationVisible}
        onClose={handleConfirmationClose}
        type="confirmation"
        confirmationProps={confirmationProps}
      />
    </AuthConfirmationContext.Provider>
  );
};

/**
 * Hook to access the auth and confirmation context
 * @returns {Object} - Context with requestAuthentication and requestConfirmation functions
 */
export const useAuthConfirmation = () => {
  const context = useContext(AuthConfirmationContext);
  if (!context) {
    throw new Error('useAuthConfirmation must be used within an AuthConfirmationProvider');
  }
  return context;
};
