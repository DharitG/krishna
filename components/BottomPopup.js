import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/NewTheme';
import DynamicAuthBlob from './chat/DynamicAuthBlob';
import DynamicConfirmationBlob from './chat/DynamicConfirmationBlob';

const { height } = Dimensions.get('window');

// Define additional theme values for this component
const extendedTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      primary: '#1A1A1A',
      secondary: '#2A2A2A',
      tertiary: '#333333'
    },
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
};

/**
 * A bottom popup component that slides up from the bottom of the screen
 * Can be used to display authentication or confirmation UI
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the popup is visible
 * @param {Function} props.onClose - Function to call when the popup is closed
 * @param {string} props.type - Type of popup ('auth' or 'confirmation')
 * @param {Object} props.authProps - Props for the DynamicAuthBlob component
 * @param {Object} props.confirmationProps - Props for the DynamicConfirmationBlob component
 */
const BottomPopup = ({
  visible,
  onClose,
  type = 'auth',
  authProps = {},
  confirmationProps = {}
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, slideAnim]);

  // Handle backdrop press (close the popup)
  const handleBackdropPress = () => {
    if (onClose) onClose();
  };

  // Prevent closing when pressing on the popup content
  const handleContentPress = (e) => {
    e.stopPropagation();
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <Animated.View
            style={[
              styles.popupContainer,
              {
                transform: [{ translateY: slideAnim }],
                paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleContentPress}
              style={styles.content}
            >
              <View style={styles.handle} />
              
              {type === 'auth' && (
                <DynamicAuthBlob
                  size="large"
                  {...authProps}
                />
              )}
              
              {type === 'confirmation' && (
                <DynamicConfirmationBlob
                  size="large"
                  {...confirmationProps}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: extendedTheme.colors.overlay,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  popupContainer: {
    backgroundColor: extendedTheme.colors.background.secondary,
    borderTopLeftRadius: extendedTheme.borderRadius.lg,
    borderTopRightRadius: extendedTheme.borderRadius.lg,
    paddingVertical: extendedTheme.spacing.md,
    paddingHorizontal: extendedTheme.spacing.lg,
    maxHeight: '80%',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: typeof extendedTheme.colors.border === 'string' 
      ? extendedTheme.colors.border 
      : 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: extendedTheme.spacing.lg,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default BottomPopup;
