import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../constants/Theme';
import Text from './Text';

const Avatar = ({
  source,
  size = 'md', // sm, md, lg, xl
  label,
  status,
  style,
  ...props
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return typography.fontSize.sm;
      case 'lg':
        return typography.fontSize.lg;
      case 'xl':
        return typography.fontSize.xl;
      default:
        return typography.fontSize.md;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'offline':
        return colors.gray;
      case 'away':
        return colors.warning;
      default:
        return null;
    }
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();
  const statusColor = getStatusColor();

  return (
    <View style={[styles.container, style]} {...props}>
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }
          ]}
        >
          {label && (
            <Text
              style={[
                styles.label,
                {
                  fontSize,
                  color: colors.text.primary,
                }
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      )}
      {status && (
        <View
          style={[
            styles.status,
            {
              backgroundColor: statusColor,
              borderColor: colors.background.primary,
              borderWidth: 2,
            }
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.background.tertiary,
  },
  placeholder: {
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  }
});

export default Avatar; 