import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "@repo/token";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  label: {
    marginBottom: spacing.xs,
  },

  trigger: {
    minHeight: 52,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: colors.primary,

    borderRadius: radius.md,

    backgroundColor: colors.background,

    paddingHorizontal: spacing.md,

    gap: spacing.sm,
  },

  value: {
    flex: 1,
  },

  placeholder: {
    color: colors.onSecondary,
  },

  helper: {
    marginTop: spacing.xs,
    color: colors.onSecondary,
  },

  errorText: {
    marginTop: spacing.xs,
    color: colors.error,
  },

  error: {
    borderColor: colors.error,
  },

  disabled: {
    opacity: 0.5,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: colors.background,

    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,

    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,

    maxHeight: "75%",
  },

  handle: {
    width: 48,
    height: 5,

    borderRadius: 999,

    backgroundColor: colors.primary,

    alignSelf: "center",

    marginBottom: spacing.md,
  },

  title: {
    marginBottom: spacing.md,

    paddingHorizontal: spacing.lg,
  },

  searchContainer: {
    paddingHorizontal: spacing.lg,

    marginBottom: spacing.md,
  },

  list: {
    flexGrow: 0,
  },

  item: {
    minHeight: 56,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,

    gap: spacing.md,
  },

  itemDisabled: {
    opacity: 0.45,
  },

  itemContent: {
    flex: 1,
  },

  itemDescription: {
    marginTop: 2,
    color: colors.onSecondary,
  },

  selectedItem: {
    backgroundColor: colors.primary + "10",
  },

  empty: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
});