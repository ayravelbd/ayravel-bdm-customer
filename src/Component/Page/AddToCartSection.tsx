"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/slices/cartSlice";
import { addToWishlist } from "@/lib/slices/wishlistSlice";
import { useRouter } from "next/navigation";

interface ProductType {
  _id: string;
  description: { name: string };
  productInfo: {
    brand?: { name: string };
    price: number;
    salePrice?: number;
    sku?: string;
  };
  featuredImg: string;
  hasVariants?: boolean;
}

interface VariantType {
  _id: string;
  sku: string;
  price: number;
  salePrice?: number;
  quantity: number;
  specifications: { [key: string]: string };
  isActive: boolean;
}

interface Props {
  product: ProductType;
  selectedSpecs: { [key: string]: string };
  selectedVariant: VariantType | null;
  currentPrice: number;
  currentStock: number;
}

export const AddToCartSection = ({ 
  product, 
  selectedSpecs, 
  selectedVariant, 
  currentPrice, 
  currentStock 
}: Props) => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const router = useRouter();

  const canAddToCart = () => {
    if (currentStock === 0) return false;
    if (product.hasVariants && !selectedVariant) return false;
    return true;
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;
    
    dispatch(addToCart({
      id: product._id,
      name: product.description.name,
      brand: product.productInfo.brand?.name || "Brand",
      image: product.featuredImg,
      price: currentPrice,
      originalPrice: product.productInfo.price,
      stock: currentStock,
      superDeal: (product.productInfo.salePrice ?? product.productInfo.price) < product.productInfo.price,
      selected: true,
      quantity,
      // Add specification data for order
      variantId: selectedVariant?._id,
      selectedSpecs: Object.keys(selectedSpecs).length > 0 ? selectedSpecs : undefined,
      sku: selectedVariant?.sku || product.productInfo.sku
    }));
  };

  const handleBuyNow = () => {
    if (!canAddToCart()) return;
    handleAddToCart();
    setTimeout(() => router.push("/checkout"), 200);
  };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist({
      id: product._id,
      name: product.description.name,
      brand: product.productInfo.brand?.name || "Brand",
      image: product.featuredImg,
      price: currentPrice,
      originalPrice: product.productInfo.price,
    }));
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Quantity:</label>
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
            className="w-16 text-center border-0 focus:ring-0"
            min="1"
            max={currentStock}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={quantity >= currentStock}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart()}
          variant="outline"
          className="flex-1 gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <ShoppingCart className="w-4 h-4" />
          Add To Cart
        </Button>
        
        <Button
          onClick={handleBuyNow}
          disabled={!canAddToCart()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Buy Now
        </Button>
      </div>

      {/* Validation Messages */}
      {!canAddToCart() && (
        <div className="text-sm text-red-600">
          {currentStock === 0 ? 
            'This product is out of stock' : 
            'Please select all required options'
          }
        </div>
      )}

      {/* Total Price */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <span className="text-xl font-bold text-green-600">
            ৳{(currentPrice * quantity).toLocaleString()}
          </span>
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