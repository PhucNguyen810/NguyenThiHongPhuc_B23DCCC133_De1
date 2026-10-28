import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { Book } from '../types/book';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'> & {
  books: Book[];
  onChangeBorrowed: (bookId: string, change: 1 | -1) => void;
  onEditBook: (bookId: string) => void;
};

function BookDetailScreen({
  navigation,
  route,
  books,
  onChangeBorrowed,
  onEditBook,
}: Props) {
  const book = books.find(item => item.id === route.params.bookId);

  if (!book) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Không tìm thấy thông tin sách.</Text>
          <AppButton label="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const remaining = book.quantity - book.borrowed;
  const details = [
    { label: 'Tác giả', value: book.author },
    { label: 'Thể loại', value: book.category },
    { label: 'Năm xuất bản', value: String(book.year) },
    { label: 'Tổng số cuốn', value: String(book.quantity) },
    { label: 'Đang được mượn', value: String(book.borrowed) },
    { label: 'Còn trong thư viện', value: String(remaining) },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.bookHeader}>
          <View style={styles.bookIcon}>
            <Text style={styles.bookIconText}>S</Text>
          </View>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.subtitle}>{book.author}</Text>
        </View>
        <View style={styles.detailCard}>
          {details.map((detail, index) => (
            <View
              key={detail.label}
              style={[
                styles.detailRow,
                index === details.length - 1 && styles.lastDetailRow,
              ]}
            >
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <AppButton
            label="Cho mượn"
            disabled={remaining === 0}
            onPress={() => onChangeBorrowed(book.id, 1)}
            style={styles.actionButton}
          />
          <AppButton
            label="Nhận trả"
            variant="secondary"
            disabled={book.borrowed === 0}
            onPress={() => onChangeBorrowed(book.id, -1)}
            style={styles.actionButton}
          />
        </View>
        <AppButton
          label="Sửa thông tin sách"
          variant="secondary"
          onPress={() => onEditBook(book.id)}
          style={styles.editButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  bookHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 24,
  },
  bookIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
  },
  bookIconText: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    marginTop: 16,
    color: colors.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 15,
  },
  detailCard: {
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  detailRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 14,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  detailValue: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  actionButton: {
    flex: 1,
  },
  editButton: {
    marginTop: 10,
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

export default BookDetailScreen;
