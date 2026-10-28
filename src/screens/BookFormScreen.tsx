import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { Book, BookCategory, categories } from '../types/book';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BookForm'> & {
  books: Book[];
  onSaveBook: (book: Book) => Promise<boolean>;
};

type FormValues = {
  title: string;
  author: string;
  category: BookCategory;
  year: string;
  quantity: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function BookFormScreen({ navigation, route, books, onSaveBook }: Props) {
  const existingBook = useMemo(
    () => books.find(book => book.id === route.params?.bookId),
    [books, route.params?.bookId],
  );
  const [values, setValues] = useState<FormValues>({
    title: existingBook?.title ?? '',
    author: existingBook?.author ?? '',
    category: existingBook?.category ?? categories[0],
    year: existingBook ? String(existingBook.year) : '',
    quantity: existingBook ? String(existingBook.quantity) : '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setValues({
        title: existingBook?.title ?? '',
        author: existingBook?.author ?? '',
        category: existingBook?.category ?? categories[0],
        year: existingBook ? String(existingBook.year) : '',
        quantity: existingBook ? String(existingBook.quantity) : '',
      });
      setErrors({});
    }, [existingBook]),
  );

  if (route.params?.bookId && !existingBook) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Không tìm thấy thông tin sách.</Text>
          <AppButton label="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const year = Number(values.year);
    const quantity = Number(values.quantity);
    const currentYear = new Date().getFullYear();

    if (!values.title.trim()) {
      nextErrors.title = 'Vui lòng nhập tên sách.';
    }
    if (!values.author.trim()) {
      nextErrors.author = 'Vui lòng nhập tên tác giả.';
    }
    if (
      !/^\d+$/.test(values.year.trim()) ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > currentYear
    ) {
      nextErrors.year = `Năm xuất bản phải từ 1900 đến ${currentYear}.`;
    }
    if (!/^\d+$/.test(values.quantity.trim()) || !Number.isInteger(quantity)) {
      nextErrors.quantity = 'Vui lòng nhập số lượng là số nguyên hợp lệ.';
    } else if (quantity <= 0) {
      nextErrors.quantity = 'Số lượng phải lớn hơn 0.';
    } else if (existingBook && quantity < existingBook.borrowed) {
      nextErrors.quantity = `Số lượng không được nhỏ hơn ${existingBook.borrowed} cuốn đang mượn.`;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    setIsSaving(true);
    try {
      const book: Book = {
        id: existingBook?.id ?? Date.now().toString(),
        title: values.title.trim(),
        author: values.author.trim(),
        category: values.category,
        year: Number(values.year),
        quantity: Number(values.quantity),
        borrowed: existingBook?.borrowed ?? 0,
      };
      const saved = await onSaveBook(book);
      if (saved) {
        navigation.goBack();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            {existingBook
              ? 'Cập nhật thông tin cho cuốn sách trong thư viện.'
              : 'Điền thông tin để thêm sách mới vào thư viện.'}
          </Text>
          <FormField
            label="Tên sách"
            value={values.title}
            onChangeText={value => updateValue('title', value)}
            error={errors.title}
            placeholder="Nhập tên sách"
          />
          <FormField
            label="Tác giả"
            value={values.author}
            onChangeText={value => updateValue('author', value)}
            error={errors.author}
            placeholder="Nhập tên tác giả"
          />
          <View style={styles.field}>
            <Text style={styles.label}>Thể loại</Text>
            <View style={styles.categoryWrap}>
              {categories.map(category => {
                const selected = values.category === category;
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() =>
                      setValues(current => ({ ...current, category }))
                    }
                    style={[
                      styles.categoryChip,
                      selected && styles.categoryChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <FormField
            label="Năm xuất bản"
            value={values.year}
            onChangeText={value => updateValue('year', value)}
            error={errors.year}
            placeholder="Ví dụ: 2024"
            keyboardType="number-pad"
          />
          <FormField
            label="Tổng số cuốn"
            value={values.quantity}
            onChangeText={value => updateValue('quantity', value)}
            error={errors.quantity}
            placeholder="Nhập số lượng"
            keyboardType="number-pad"
          />
          {existingBook && (
            <Text style={styles.borrowedNote}>
              Hiện có {existingBook.borrowed} cuốn đang được mượn.
            </Text>
          )}
          <AppButton
            label={isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
};

function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = 'default',
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        style={[styles.input, error ? styles.inputError : undefined]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  intro: {
    marginBottom: 22,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 12,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: colors.surface,
  },
  borrowedNote: {
    marginTop: -4,
    marginBottom: 16,
    color: colors.muted,
    fontSize: 13,
  },
  saveButton: {
    marginTop: 4,
  },
  missing: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  missingText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BookFormScreen;
