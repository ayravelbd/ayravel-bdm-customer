// Debug: Check your product data structure
// Add this temporarily to your product page to see what data you're getting

interface ProductDataDebug {
  hasVariants?: boolean;
  specifications?: Record<string, string[]>;
  variants?: Array<{
    _id: string;
    sku: string;
    price: number;
    salePrice?: number;
    quantity: number;
    specifications: Record<string, string>;
    isActive: boolean;
  }>;
}

export const debugProductData = (productData: unknown) => {
  const data = productData as ProductDataDebug;
  console.log('🔍 Product Data Debug:', {
    hasVariants: data?.hasVariants,
    specifications: data?.specifications,
    variants: data?.variants,
    fullProduct: productData
  });
};

// Expected structure for interactive specifications:
/*
{
  hasVariants: true,
  specifications: {
    color: ["red", "green", "black"],
    size: ["s", "m", "l", "xl"],
    material: ["Cotton", "Linen"]
  },
  variants: [
    {
      _id: "variant-id-1",
      sku: "MC-RED-S",
      price: 1390,
      salePrice: 1390,
      quantity: 42,
      specifications: {
        color: "red",
        size: "s",
        material: "Cotton"
      },
      isActive: true
    }
  ]
}
*/

// If your data looks different, you need to transform it in the fetchMainBook function