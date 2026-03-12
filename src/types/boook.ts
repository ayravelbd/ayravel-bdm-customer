// types/book.ts
export interface Book {
  id: string;
  title: string;
  title_bn?: string;
  author: string;
  authorId?: string;
  authors?: Array<{ _id?: string; name: string }>;
  image: string;
  stars: number;
  reviews: number;
  price: number;
  originalPrice: number;
  discount?: number;
  totalDiscount: number;
  description: string;
  description_bn?: string;
  category: string[] | Category[];
  inStock: boolean;
  stockCount: number;
  isbn?: string;
  binding?: string;
  numberOfPages?: number;
  edition?: string;
  editionYear?: number;
  publisher?: string;
  language?: string;
  country?: string;
  genre?: string[];
  translator?: string;
  previewImg: string[];
  previewPdf?: string;
  // NEW: Specification system fields
  productData?: ApiBook; // Full product data from API
  hasVariants?: boolean;
  specifications?: { [key: string]: string[] };
  variants?: Array<{
    _id: string;
    sku: string;
    price: number;
    salePrice?: number;
    quantity: number;
    specifications: { [key: string]: string };
    images?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface RelatedBook {
  id: string;
  slug?: string;
  title: string;
  author: string;
  cover: string;
  bgColor: string;
  stars: number;
  reviews: number;
  price: number;
  originalPrice: number;
  description: string;
}

export interface ApiBook {
  previewImg: string[];
  previewPdf?: string;
  _id: string;
  featuredImg: string;
  description: {
    name: string;
    name_bn?: string;
    description: string;
    description_bn?: string;
    slug?: string;
  };
  categoryAndTags: {
    categories: Category[];
    publisher?: string;
  };
  bookInfo: {
    specification: {
      authors: { _id?: string; name: string }[];
      isbn: string;
      binding: string;
      numberOfPages: number;
      edition: string;
      editionYear: number;
      publisher: string;
      language?: string;
      country?: string;
    };
    genre?: string[];
    translator?: string;
  };
  productInfo: {
    price: number;
    salePrice?: number;
    discount?: number;
    totalDiscount?: number;
    inStock: boolean;
    quantity: number;
    brand?: string;
  };
  averageRating: number;
  reviewCount: number;
  // NEW: Specification system fields
  hasVariants?: boolean;
  specifications?: { [key: string]: string[] };
  variants?: Array<{
    _id: string;
    sku: string;
    price: number;
    salePrice?: number;
    quantity: number;
    specifications: { [key: string]: string };
    images?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
export interface Category {
  _id: string;
  name: string;
  slug: string;
  details: string;
  icon: {
    name: string;
    url: string;
  };
  image: string;
  bannerImg: string;
  subCategories: [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiBook | ApiBook[];
}
