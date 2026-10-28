import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import BookCard from '../components/BookCard';
import { colors } from '../theme/colors';
import { Book, BookCategory, categories } from '../types/book';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BookList'> & {
  books: Book[];
  onDeleteBook: (bookId: string) => void;
};

const filters: Array<'Tất cả' | BookCategory> = ['Tất cả', ...categories];

function BookListScreen({ navigation, books, onDeleteBook }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof filters)[number]>('Tất cả');

  const filteredBooks = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return books.filter(book => {
      const matchesQuery =
        query.length === 0 ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'Tất cả' || book.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [books, searchText, selectedCategory]);

  const borrowedCount = books.reduce((total, book) => total + book.borrowed, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={filteredBooks}
        keyExtractor={book => book.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() =>
              navigation.navigate('BookDetail', { bookId: item.id })
            }
            onLongPress={() => onDeleteBook(item.id)}
          />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{books.length}</Text>
                <Text style={styles.summaryLabel}>Đầu sách</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{borrowedCount}</Text>
                <Text style={styles.summaryLabel}>Đang được mượn</Text>
              </View>
            </View>
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                accessibilityLabel="Tìm tên sách hoặc tác giả"
                placeholder="Tìm tên sách hoặc tác giả"
                placeholderTextColor={colors.muted}
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Xoá từ khoá tìm kiếm"
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearText}>×</Text>
                </Pressable>
              )}
            </View>
            <FlatList
              horizontal
              data={filters}
              keyExtractor={item => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const active = selectedCategory === item;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelectedCategory(item)}
                    style={[styles.filterChip, active && styles.filterActive]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
            <View style={styles.listHeading}>
              <Text style={styles.sectionTitle}>Danh mục sách</Text>
              <Text style={styles.resultCount}>
                {filteredBooks.length} kết quả
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>
              {books.length === 0
                ? 'Thư viện chưa có sách'
                : 'Không tìm thấy sách'}
            </Text>
            <Text style={styles.emptyDescription}>
              {books.length === 0
                ? 'Thêm cuốn sách đầu tiên để bắt đầu quản lý thư viện.'
                : 'Thử từ khoá khác hoặc chọn một thể loại khác.'}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.addButtonWrap}>
        <AppButton
          label="+ Thêm sách"
          onPress={() => navigation.navigate('BookForm', undefined)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 12,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 3,
    color: '#E1EBE5',
    fontSize: 12,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#789187',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  searchIcon: {
    color: colors.muted,
    fontSize: 25,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    color: colors.muted,
    fontSize: 22,
  },
  filterList: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.surface,
  },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  resultCount: {
    color: colors.muted,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 42,
  },
  emptyIcon: {
    color: colors.primary,
    fontSize: 42,
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  listFooter: {
    height: 12,
  },
  addButtonWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

export default BookListScreen;
