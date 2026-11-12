import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export interface DropdownOption {
  id?: number | string;
  value: string;
  displayName: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (option: DropdownOption) => void;
  disabled?: boolean;
  searchable?: boolean;
  emptyMessage?: string;
}

export default function Dropdown({
  label,
  placeholder = 'Seç',
  options,
  selectedValue,
  onSelect,
  disabled = false,
  searchable = false,
  emptyMessage = 'Seçenek bulunamadı.',
}: DropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const selectedOption = options.find((item) => item.value === selectedValue);

  const filteredOptions = searchable
    ? options.filter((item) =>
        item.displayName.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
      )
    : options;

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: disabled ? theme.border + '60' : theme.card,
            borderColor: theme.border,
          },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectedText,
            { color: selectedOption ? theme.text : theme.textSecondary },
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.displayName : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? theme.border : theme.textSecondary}
        />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {label || 'Seçim yap'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {searchable ? (
              <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="search" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Ara..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{emptyMessage}</Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: theme.border },
                      isSelected && { backgroundColor: theme.tint + '15' },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? theme.tint : theme.text },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {item.displayName}
                    </Text>
                    {isSelected ? <Ionicons name="checkmark" size={20} color={theme.tint} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedText: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  optionText: {
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 14,
  },
});