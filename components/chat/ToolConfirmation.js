import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DynamicConfirmationBlob from '../../components/chat/DynamicConfirmationBlob';
import { colors, spacing } from '../../constants/Theme';

/**
 * Component to handle tool action confirmations
 * @param {Object} props - Component props
 * @param {Object} props.action - Action details { type, service, details }
 * @param {Function} props.onConfirm - Callback when action is confirmed
 * @param {Function} props.onCancel - Callback when action is canceled
 */
const ToolConfirmation = ({ action, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle confirmation
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setIsLoading(false);
    } catch (error) {
      console.error('Error confirming action:', error);
      setIsLoading(false);
    }
  };
  
  // Format details for display
  const formatDetails = () => {
    if (!action.details) return [];
    
    // Convert details object to array of {label, value} pairs
    if (typeof action.details === 'object' && !Array.isArray(action.details)) {
      return Object.entries(action.details).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString()
      }));
    }
    
    // If details is already an array of {label, value} pairs
    return action.details;
  };
  
  return (
    <View style={styles.container}>
      <DynamicConfirmationBlob
        action={action.type}
        service={action.service}
        details={formatDetails()}
        onConfirm={handleConfirm}
        onCancel={onCancel}
        isLoading={isLoading}
        size="large"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  }
});

export default ToolConfirmation;