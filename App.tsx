import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BookDetailScreen from './src/screens/BookDetailScreen';
import BookFormScreen from './src/screens/BookFormScreen';
import BookListScreen from './src/screens/BookListScreen';
import { sampleBooks } from './src/data/sampleBooks';
import { colors } from './src/theme/colors';
import { Book, isBookArray } from './src/types/book';
import { RootStackParamList } from './src/types/navigation';

const STORAGE_KEY = '@library-app/books';
const Stack = createNativeStackNavigator<RootStackParamList>();

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Đã xảy ra lỗi không xác định.';
}

function AppContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const booksRef = useRef<Book[]>([]);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const savedBooks = await AsyncStorage.getItem(STORAGE_KEY);
      let loadedBooks: Book[];
      if (savedBooks === null) {
        loadedBooks = sampleBooks;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedBooks));
      } else {
        const parsed: unknown = JSON.parse(savedBooks);
        if (!isBookArray(parsed)) {
          throw new Error('Dữ liệu sách đã lưu không đúng định dạng.');
        }
        loadedBooks = parsed;
      }
      booksRef.current = loadedBooks;
      setBooks(loadedBooks);
    } catch (error) {
      setLoadError(getErrorMessage(error));
      Alert.alert('Không thể tải dữ liệu', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const saveBooks = useCallback((nextBooks: Book[]) => {
    booksRef.current = nextBooks;
    setBooks(nextBooks);

    const operation = writeQueue.current.then(async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks));
    });
    writeQueue.current = operation.catch(error => {
      Alert.alert('Không thể lưu dữ liệu', getErrorMessage(error));
    });
    return operation.then(
      () => true,
      () => false,
    );
  }, []);

  const saveBook = useCallback(
    (book: Book) => {
      const existingIndex = booksRef.current.findIndex(
        existingBook => existingBook.id === book.id,
      );
      const nextBooks = [...booksRef.current];
      if (existingIndex === -1) {
        nextBooks.unshift(book);
      } else {
        nextBooks[existingIndex] = book;
      }
      return saveBooks(nextBooks);
    },
    [saveBooks],
  );

  const changeBorrowed = useCallback(
    (bookId: string, change: 1 | -1) => {
      const book = booksRef.current.find(item => item.id === bookId);
      if (!book) {
        return;
      }
      const nextBorrowed = book.borrowed + change;
      if (nextBorrowed < 0 || nextBorrowed > book.quantity) {
        return;
      }
      const nextBooks = booksRef.current.map(item =>
        item.id === bookId ? { ...item, borrowed: nextBorrowed } : item,
      );
      saveBooks(nextBooks);
    },
    [saveBooks],
  );

  const removeBook = useCallback(
    (bookId: string) => {
      const book = booksRef.current.find(item => item.id === bookId);
      if (!book) {
        return;
      }
      if (book.borrowed > 0) {
        Alert.alert(
          'Không thể xoá sách',
          'Sách đang có người mượn. Vui lòng nhận trả tất cả sách trước.',
        );
        return;
      }
      Alert.alert('Xác nhận xoá', `Bạn có chắc muốn xoá “${book.title}”?`, [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            const latestBook = booksRef.current.find(
              item => item.id === bookId,
            );
            if (!latestBook) {
              return;
            }
            if (latestBook.borrowed > 0) {
              Alert.alert(
                'Không thể xoá sách',
                'Sách đang có người mượn. Vui lòng nhận trả tất cả sách trước.',
              );
              return;
            }
            saveBooks(booksRef.current.filter(item => item.id !== bookId));
          },
        },
      ]);
    },
    [saveBooks],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải thư viện...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Không thể mở thư viện</Text>
        <Text style={styles.errorMessage}>{loadError}</Text>
        <Text onPress={() => loadBooks()} style={styles.retry}>
          Thử tải lại
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontSize: 18, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="BookList" options={{ title: 'Thư viện sách' }}>
          {navigationProps => (
            <BookListScreen
              {...navigationProps}
              books={books}
              onDeleteBook={removeBook}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="BookForm"
          options={({ route }) => ({
            title: route.params?.bookId ? 'Sửa thông tin sách' : 'Thêm sách',
          })}
        >
          {navigationProps => (
            <BookFormScreen
              {...navigationProps}
              books={books}
              onSaveBook={saveBook}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="BookDetail" options={{ title: 'Chi tiết sách' }}>
          {navigationProps => (
            <BookDetailScreen
              {...navigationProps}
              books={books}
              onChangeBorrowed={changeBorrowed}
              onEditBook={bookId =>
                navigationProps.navigation.navigate('BookForm', { bookId })
              }
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 15,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  errorMessage: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  retry: {
    marginTop: 20,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default App;
