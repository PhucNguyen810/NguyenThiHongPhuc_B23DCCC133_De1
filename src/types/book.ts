export const categories = [
  'Giáo trình',
  'Tiểu thuyết',
  'Khoa học',
  'Thiếu nhi',
] as const;

export type BookCategory = (typeof categories)[number];

export type Book = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  year: number;
  quantity: number;
  borrowed: number;
};

export function isBookArray(value: unknown): value is Book[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.author === 'string' &&
        categories.includes(item.category) &&
        Number.isInteger(item.year) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isInteger(item.borrowed) &&
        item.borrowed >= 0 &&
        item.borrowed <= item.quantity,
    )
  );
}
