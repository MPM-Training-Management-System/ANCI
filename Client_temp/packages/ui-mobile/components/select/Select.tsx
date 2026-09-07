import React, { useMemo, useState } from "react";

import {
  FlatList,
  Modal,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  Body,
  Caption,
  Label,
  Title,
} from "../typography";

import { styles } from "./Select.styles";
import { SelectItem } from "./SelectItem";
import type {
  SelectOption,
  SelectProps,
} from "./Select.types";

export function Select<T = string>({
  value,
  items,

  onValueChange,

  label,
  placeholder = "Select",

  helperText,
  error,

  disabled,
  required,

  searchable = false,
  searchPlaceholder = "Search...",

  modalTitle = "Select",

  leftIcon,
  rightIcon,

  emptyMessage = "No options found",
}: SelectProps<T>) {
  const [visible, setVisible] = useState(false);

  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => items.find((item) => item.value === value),
    [items, value]
  );

  const filteredItems = useMemo(() => {
    if (!searchable) return items;

    return items.filter((item) =>
      item.label
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [items, search, searchable]);

  function close() {
    setVisible(false);
    setSearch("");
  }

  function handleSelect(item: SelectOption<T>) {
    onValueChange?.(item.value);
    close();
  }

  return (
    <>
      <View style={styles.container}>
        {label && (
          <Label style={styles.label}>
            {label}
            {required && (
              <Body
                style={{
                  color: "red",
                }}
              >
                {" *"}
              </Body>
            )}
          </Label>
        )}

        <Pressable
          disabled={disabled}
          onPress={() => setVisible(true)}
          style={[
            styles.trigger,
            disabled && styles.disabled,
            error && styles.error,
          ]}
        >
          {leftIcon}

          <Body
            style={[
              styles.value,
              !selected && styles.placeholder,
            ]}
          >
            {selected?.label ?? placeholder}
          </Body>

          {rightIcon}
        </Pressable>

        {error ? (
          <Caption style={styles.errorText}>
            {error}
          </Caption>
        ) : helperText ? (
          <Caption style={styles.helper}>
            {helperText}
          </Caption>
        ) : null}
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.handle} />

                <Title style={styles.title}>
                  {modalTitle}
                </Title>

                {searchable && (
                  <View style={styles.searchContainer}>
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder={searchPlaceholder}
                    />
                  </View>
                )}

                <FlatList
                  style={styles.list}
                  keyboardShouldPersistTaps="handled"
                  data={filteredItems}
                  keyExtractor={(item) =>
                    String(item.value)
                  }
                  renderItem={({ item }) => (
                    <SelectItem
                      item={item}
                      selected={item.value === value}
                      onPress={() =>
                        handleSelect(item)
                      }
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Body>
                        {emptyMessage}
                      </Body>
                    </View>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}