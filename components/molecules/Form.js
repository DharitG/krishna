import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { spacing } from '../../constants/Theme';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

const Form = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  submitVariant = 'primary',
  submitSize = 'md',
  style,
  ...props
}) => {
  const [formData, setFormData] = React.useState({});
  const [errors, setErrors] = React.useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = () => {
    // Basic validation
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.validate) {
        const error = field.validate(formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <ScrollView style={[styles.container, style]} {...props}>
      {fields.map(field => (
        <Input
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChangeText={(value) => handleChange(field.name, value)}
          error={errors[field.name]}
          leftIcon={field.leftIcon}
          rightIcon={field.rightIcon}
          onRightIconPress={field.onRightIconPress}
          secureTextEntry={field.secureTextEntry}
          keyboardType={field.keyboardType}
          autoCapitalize={field.autoCapitalize}
          autoCorrect={field.autoCorrect}
          autoComplete={field.autoComplete}
          multiline={field.multiline}
          numberOfLines={field.numberOfLines}
        />
      ))}
      <Button
        title={submitLabel}
        onPress={handleSubmit}
        variant={submitVariant}
        size={submitSize}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  }
});

export default Form; 