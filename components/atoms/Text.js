import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { typography, colors } from '../../constants/Theme';

const Text = ({
  variant = 'body.medium',
  color = 'text.primary',
  style,
  children,
  ...props
}) => {
  // Parse the variant to get the correct typography style
  const [category, size] = variant.split('.');
  const typographyStyle = typography[category][size];

  // Parse the color to get the correct color value
  const [colorCategory, colorVariant] = color.split('.');
  const colorValue = colors[colorCategory][colorVariant];

  return (
    <RNText
      style={[
        styles.base,
        typographyStyle,
        { color: colorValue },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.regular,
  }
});

export default Text; 