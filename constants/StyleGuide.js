import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows, glassMorphism } from './Theme';

// Style guide based on the settings page design
// This provides reusable styles for common UI patterns

export const layoutStyles = StyleSheet.create({
  // Safe area container
  safeArea: {
    flex: 1,
  },
  
  // Main container with padding
  container: {
    flex: 1,
  },
  
  // Content container with padding
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  
  // Scrollable content
  content: {
    flex: 1,
  },
  
  // Scroll content container
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  
  // Section containers
  section: {
    marginBottom: spacing.lg,
  },
  
  // Horizontal full-width divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: spacing.sm,
  },
});

export const headerStyles = StyleSheet.create({
  // Standard screen header with centered title
  header: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Back button
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Right placeholder for balanced layout
  rightPlaceholder: {
    width: 40,
  },
  
  // Header with back button
  headerWithBack: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  
  // Left header area for back button
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Center area for title
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Right header area for actions
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header title text
  headerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  
  // Large header title text
  headerTitleLarge: {
    color: colors.white,
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
  },
});

export const cardStyles = StyleSheet.create({
  // Glass card for settings sections
  glassCard: {
    ...glassMorphism,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  
  // Standard card for content sections
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  
  // Card header with title and icon
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Card title text
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  
  // Warning card for alerts
  warningCard: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  
  // Warning text
  warningText: {
    color: colors.warning,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
  },
  
  // List item in a card
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Account item in accounts list
  accountItem: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Account item content container
  accountItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Main account info area
  accountItemMain: {
    flex: 1,
  },
  
  // Account item title
  accountItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.white,
  },
  
  // Account item subtitle
  accountItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.lightGray,
    marginTop: 2,
  },
  
  // Account actions container
  accountItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Account action button
  accountItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: spacing.xs,
  },
  
  // Account action button text
  accountItemButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.emerald,
    marginLeft: 4,
  },
  
  // Remove button
  removeButton: {
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
  },
  
  // Active account badge
  activeAccountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.emeraldTransparent,
    marginRight: spacing.xs,
  },
  
  // Active account text
  activeAccountText: {
    fontSize: typography.fontSize.sm,
    color: colors.emerald,
  },
  
  // Accounts list container
  accountsList: {
    marginTop: spacing.xs,
  },
  
  // No accounts text
  noAccountsText: {
    color: colors.lightGray,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
  },
  
  // Add account button
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Add account text
  addAccountText: {
    fontSize: typography.fontSize.md,
    color: colors.emerald,
    marginLeft: spacing.xs,
  },
  
  // Loading container
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Loading text
  loadingText: {
    color: colors.lightGray,
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
  },
  
  // Last item in a card (no border)
  cardItemLast: {
    borderBottomWidth: 0,
  },
  
  // Left side of a card item with icon
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Right side of a card item
  cardItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Icon in a card item
  cardItemIcon: {
    marginRight: spacing.md,
  },
  
  // Label text in a card item
  cardItemLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.white,
  },
  
  // Value text in a card item
  cardItemValue: {
    fontSize: typography.fontSize.md,
    color: colors.lightGray,
    marginRight: spacing.xs,
  },
});

export const textStyles = StyleSheet.create({
  // Section title
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  
  // Small uppercase section title
  smallSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.lightGray,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Normal text
  bodyText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
  },
  
  // Secondary text
  secondaryText: {
    fontSize: typography.fontSize.md,
    color: colors.lightGray,
  },
  
  // Empty state text
  emptyText: {
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.fontSize.md,
  },
});

export const buttonStyles = StyleSheet.create({
  // Primary button
  primaryButton: {
    backgroundColor: colors.emerald,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Secondary/outline button
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Icon button
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Button with icon + text
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
  },
  
  // Text inside primary button
  primaryButtonText: {
    color: colors.black,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  
  // Text inside secondary button
  secondaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  
  // Text next to icon
  buttonWithIconText: {
    marginLeft: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
});

// Usage examples:
// import { layoutStyles, headerStyles, cardStyles, textStyles, buttonStyles } from '../constants/StyleGuide';
// <View style={layoutStyles.container}>
//   <View style={headerStyles.headerWithBack}>...</View>
//   <View style={cardStyles.glassCard}>...</View>
// </View>