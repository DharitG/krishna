# August Design System

## Overview

August uses a comprehensive design system to maintain consistency across the application. This document outlines the key components, tokens, and usage guidelines.

## Design Tokens

### Colors

Our color system is built with semantic tokens for better maintainability and consistency:

```javascript
colors: {
  background: {
    primary: '#121214',
    secondary: '#1E1E22',
    // ...
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#F0F0F5',
    // ...
  },
  // ...
}
```

### Typography

Typography is organized by category and size:

```javascript
typography: {
  heading: {
    h1: { fontSize: 40, lineHeight: 48, fontWeight: '700' },
    h2: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
    // ...
  },
  body: {
    large: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    medium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    // ...
  }
}
```

### Spacing

Consistent spacing system:

```javascript
spacing: {
  base: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}
```

## Component Library

### Atoms

Basic building blocks of the UI:

#### Text
```javascript
<Text variant="heading.h1" color="text.primary">
  Hello World
</Text>
```

#### Card
```javascript
<Card variant="elevated" glass>
  <Text>Card content</Text>
</Card>
```

#### Input
```javascript
<Input
  label="Email"
  placeholder="Enter your email"
  keyboardType="email-address"
  error="Invalid email format"
/>
```

#### Badge
```javascript
<Badge
  label="New"
  variant="success"
  size="md"
/>
```

#### Avatar
```javascript
<Avatar
  source={require('./avatar.png')}
  size="lg"
  status="online"
  label="JD"
/>
```

### Molecules

Combinations of atomic components:

#### Form
```javascript
<Form
  fields={[
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      keyboardType: 'email-address',
      required: true,
      validate: (value) => {
        if (!value.includes('@')) {
          return 'Invalid email format';
        }
        return null;
      }
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      secureTextEntry: true,
      required: true
    }
  ]}
  onSubmit={(data) => console.log(data)}
  submitLabel="Sign In"
/>
```

### Organisms (Coming Soon)
- Header
- Footer
- Sidebar
- Chat Interface

## Usage Guidelines

1. **Consistency**
   - Always use design tokens instead of hard-coded values
   - Follow the component hierarchy (atoms → molecules → organisms)
   - Use semantic color tokens for better maintainability

2. **Accessibility**
   - Maintain sufficient color contrast
   - Use appropriate text sizes for readability
   - Include proper spacing for touch targets

3. **Responsive Design**
   - Use the breakpoint system for responsive layouts
   - Test components across different screen sizes
   - Follow mobile-first approach

4. **Performance**
   - Use appropriate shadow values
   - Optimize animations
   - Follow React Native best practices

## Best Practices

1. **Component Creation**
   - Create components in the appropriate directory (atoms/molecules/organisms)
   - Use the design system tokens
   - Include proper documentation
   - Add PropTypes or TypeScript types

2. **Styling**
   - Use StyleSheet.create for styles
   - Leverage the theme system
   - Keep styles close to components
   - Use composition over inheritance

3. **Testing**
   - Write unit tests for components
   - Test across different devices
   - Verify accessibility compliance

## Contributing

When adding new components or modifying existing ones:

1. Follow the established patterns
2. Update this documentation
3. Add examples
4. Include tests
5. Update the changelog

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Design System Examples](https://www.designsystems.com/) 