"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Heart, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/slices/cartSlice";
import { addToWishlist } from "@/lib/slices/wishlistSlice";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  salePrice?: number;
  quantity: number;
  specifications: { [key: string]: string };
  images?: string[];
  isActive: boolean;
}

interface ProductType {
  _id: string;
  description?: { name: string };
  title?: string;
  productInfo?: {
    brand?: { name: string } | string;
    price?: number;
    salePrice?: number;
    sku?: string;
  };
  featuredImg?: string;
  image?: string;
  author?: string;
  originalPrice?: number;
  price?: number;
  hasVariants?: boolean;
}

interface Props {
  product: ProductType;
  selectedSpecs: { [key: string]: string };
  selectedVariant: ProductVariant | null;
  currentPrice: number;
  currentStock: number;
  hasVariants: boolean;
  specifications: { [key: string]: string[] };
}

export const EnhancedAddToCartSection = ({ 
  product, 
  selectedSpecs, 
  selectedVariant, 
  currentPrice, 
  currentStock,
  hasVariants,
  specifications
}: Props) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const canAddToCart = () => {
    if (currentStock === 0) return false;
    
    // For products with specifications (both simple and variable)
    if (specifications && Object.keys(specifications).length > 0) {
      // For variable products, all specs must be selected
      if (hasVariants) {
        const requiredSpecs = Object.keys(specifications);
        const selectedSpecKeys = Object.keys(selectedSpecs);
        
        // Check if all required specs are selected
        const allSpecsSelected = requiredSpecs.every(spec => 
          selectedSpecKeys.includes(spec) && selectedSpecs[spec]
        );
        
        return allSpecsSelected;
      }
      // For simple products with specifications, no validation required
      // User can add to cart with any selected specifications
    }
    
    return true;
  };

  const getValidationMessage = () => {
    if (currentStock === 0) return "This product is out of stock";
    
    // Only show validation for variable products
    if (hasVariants && specifications && Object.keys(specifications).length > 0) {
      const requiredSpecs = Object.keys(specifications);
      const selectedSpecKeys = Object.keys(selectedSpecs);
      
      const missingSpecs = requiredSpecs.filter(spec => 
        !selectedSpecKeys.includes(spec) || !selectedSpecs[spec]
      );
      
      if (missingSpecs.length > 0) {
        return `Please select: ${missingSpecs.map(spec => spec.charAt(0).toUpperCase() + spec.slice(1)).join(', ')}`;
      }
    }
    
    return null;
  };

  const handleAddToCart = async () => {
    if (!canAddToCart()) {
      toast.error(getValidationMessage() || "Cannot add to cart");
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      // Create unique cart item ID based on product + specifications
      const specString = Object.entries(selectedSpecs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');
      
      const uniqueId = selectedVariant 
        ? `${product._id}-${selectedVariant._id}`
        : `${product._id}-${specString}`;

      const cartItem = {
        id: uniqueId,
        productId: product._id,
        name: product.description?.name || product.title || "Product",
        brand: typeof product.productInfo?.brand === 'string' ? product.productInfo.brand : (product.productInfo?.brand?.name || product.author || "Brand"),
        image: product.featuredImg || product.image || "",
        price: currentPrice,
        originalPrice: product.productInfo?.price || product.originalPrice,
        stock: currentStock,
        superDeal: !!(product.productInfo?.salePrice || product.price) && (product.productInfo?.salePrice || product.price || 0) < (product.productInfo?.price || product.originalPrice || 0),
        selected: true,
        quantity,
        // CRITICAL: Always include specification data
        variantId: selectedVariant?._id,
        selectedSpecs: Object.keys(selectedSpecs).length > 0 ? { ...selectedSpecs } : undefined,
        sku: selectedVariant?.sku || product.productInfo?.sku,
        // Additional metadata for order processing
        productName: product.description?.name || product.title || "Product",
        specificationSummary: Object.entries(selectedSpecs)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      };

      console.log('🛒 EnhancedAddToCartSection - Cart Item:', {
        cartItem,
        selectedSpecs,
        hasSpecs: Object.keys(selectedSpecs).length > 0,
        productType: hasVariants ? 'variable' : 'simple'
      });

      dispatch(addToCart(cartItem));
      
      toast.success(`Added to cart successfully!${
        Object.keys(selectedSpecs).length > 0 
          ? ` (${Object.entries(selectedSpecs).map(([k,v]) => `${k}: ${v}`).join(', ')})` 
          : ''
      }`);
      
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error("Add to cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!canAddToCart()) {
      toast.error(getValidationMessage() || "Cannot proceed to checkout");
      return;
    }
    
    await handleAddToCart();
    setTimeout(() => router.push("/checkout"), 500);
  };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist({
      id: product._id,
      name: product.description?.name || product.title || "Product",
      brand: typeof product.productInfo?.brand === 'string' ? product.productInfo.brand : (product.productInfo?.brand?.name || product.author || "Brand"),
      image: product.featuredImg || product.image || "",
      price: currentPrice,
      originalPrice: product.productInfo?.price || product.originalPrice,
    }));
    
    toast.success("Added to wishlist!");
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Quantity:</label>
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
            className="h-10 w-10"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
            className="w-16 text-center border-0 focus:ring-0 h-10"
            min="1"
            max={currentStock}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={quantity >= currentStock}
            className="h-10 w-10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-sm text-gray-600">
          (Max: {currentStock})
        </span>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">
            {validationMessage}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart() || isAddingToCart}
          variant="outline"
          className="flex-1 gap-2 hover:opacity-90"
          style={{ borderColor: '#1D9BCF', color: '#1D9BCF' }}
        >
          <ShoppingCart className="w-5 h-5" />
          {isAddingToCart ? 'Adding...' : 'Add To Cart'}
        </Button>
        
        <Button
          onClick={handleBuyNow}
          disabled={!canAddToCart() || isAddingToCart}
          className="flex-1 text-white hover:opacity-90"
          style={{ backgroundColor: '#1D9BCF' }}
        >
          Buy Now
        </Button>
      </div>

      {/* Total Price Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">
              ৳{(currentPrice * quantity).toLocaleString()}
            </span>
            {product.productInfo?.price && currentPrice < product.productInfo.price && (
              <div className="text-sm text-gray-500 line-through">
                ৳{(product.productInfo.price * quantity).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Button */}
      <div className="pt-2 border-t">
        <button
          onClick={handleAddToWishlist}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 text-sm transition-colors"
        >
          <Heart className="w-4 h-4" />
          Add to Wishlist
        </button>
      </div>
    </div>
  );
};
