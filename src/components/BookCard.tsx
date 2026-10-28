import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Book } from '../types/book';
import { colors } from '../theme/colors';

type BookCardProps = {
  book: Book;
  onPress: () => void;
  onLongPress: () => void;
};

function BookCard({ book, onPress, onLongPress }: BookCardProps) {
  const remaining = book.quantity - book.borrowed;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        {remaining === 0 ? (
          <Text style={styles.soldOut}>Hết sách</Text>
        ) : (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Còn {remaining}</Text>
          </View>
        )}
      </View>
      <Text style={styles.author}>{book.author}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.category}>{book.category}</Text>
        <Text style={styles.hint}>Nhấn giữ để xoá</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  pressed: {
    opacity: 0.78,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  soldOut: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  stockBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  stockText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  author: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
  },
});

export default BookCard;
