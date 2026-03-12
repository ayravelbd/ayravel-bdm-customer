import { addToCart } from "@/lib/slices/cartSlice";
import { AppDispatch } from "@/redux/store";
import { TProduct } from "@/types/product/product";
import toast from "react-hot-toast";

// Updated function to handle specifications and variants
export const handleAddToCart = (
  product: TProduct, 
  dispatch: AppDispatch,
  selectedSpecs?: { [key: string]: string },
  selectedVariant?: { _id: string; sku: string; price?: number; salePrice?: number; quantity: number; isActive?: boolean },
  quantity: number = 1
) => {
  // Check stock - use variant stock if available, otherwise product stock
  const currentStock = selectedVariant?.quantity ?? product.productInfo.quantity;
  const isInStock = selectedVariant?.isActive !== false && 
                   ((selectedVariant?.quantity ?? 0) > 0 || product.productInfo.inStock) && 
                   currentStock > 0;

  if (!isInStock) {
    toast.error("This product is out of stock!");
    return;
  }

  // Use variant price if available, otherwise product price
  const price = selectedVariant?.salePrice ?? 
                selectedVariant?.price ?? 
                product.productInfo.salePrice ?? 
                product.productInfo.price;

  // Create unique product identifier
  const productId = product._id;
  const variantId = selectedVariant?._id;
  
  // Prepare cart item with specifications
  const cartItem = {
    id: productId,
    productId: productId,
    name: product.description.name ?? "Unknown Product",
    brand: product.productInfo.brand ?? "Unknown Brand",
    price,
    originalPrice: product.productInfo.price,
    stock: currentStock,
    superDeal: !!product.productInfo.discount,
    selected: true,
    quantity,
    image: product.featuredImg ?? "",
    
    // ✅ NEW: Include specification data
    variantId: variantId,
    selectedSpecs: selectedSpecs && Object.keys(selectedSpecs).length > 0 ? selectedSpecs : undefined,
    sku: selectedVariant?.sku ?? product.productInfo.sku,
  };

  dispatch(addToCart(cartItem));
  
  // Show success message with specifications
  let message = `"${product.description.name}" added to cart!`;
  if (selectedSpecs && Object.keys(selectedSpecs).length > 0) {
    const specsText = Object.entries(selectedSpecs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    message += ` (${specsText})`;
  }
  
  toast.success(message);
};

// Legacy function for backward compatibility
export const handleAddToCartLegacy = (product: TProduct, dispatch: AppDispatch) => {
  handleAddToCart(product, dispatch, undefined, undefined, 1);
};
