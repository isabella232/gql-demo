export function getAllBooks() {
    return {
      text: `
            SELECT bookID, title, author, inStock
            FROM bookinfo
        `,
      values: [],
    };
  }
  