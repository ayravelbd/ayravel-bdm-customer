"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Image from "next/image";
import OfferNotices from "./OfferNotices";
import { Book, ApiBook } from "@/types/boook";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/lib/slices/cartSlice";
import { addToWishlist } from "@/lib/slices/wishlistSlice";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { InteractiveSpecificationSelector } from "./InteractiveSpecificationSelector";
import { EnhancedAddToCartSection } from "./EnhancedAddToCartSection";
import { TProduct } from "@/types/product/product";

interface ProductVariant {
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
}

interface ProductDetailsProps extends Omit<Book, 'productData'> {
  title: string;
  showPreview?: boolean;
  onPreviewClose?: () => void;
  brandName?: string;
  isBookCategory?: boolean;
  language?: string;
  country?: string;
  genre?: string[];
  translator?: string;
  authors?: Array<{ _id?: string; name: string }>;
  // New props for specification system
  productData?: ApiBook | TProduct;
  hasVariants?: boolean;
  specifications?: { [key: string]: string[] };
  variants?: ProductVariant[];
}

// Export specifications rendering function
export function renderSpecifications({
  publisher,
  edition,
  editionYear,
  numberOfPages,
  language,
  country,
  binding,
  isbn,
  genre,
  translator,
}: {
  publisher?: string;
  edition?: string;
  editionYear?: number;
  numberOfPages?: number;
  language?: string;
  country?: string;
  binding?: string;
  isbn?: string;
  genre?: string[];
  translator?: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      {publisher && (
        <div className="flex">
          <span className="text-gray-600 w-32">Publisher:</span>
          <span className="text-gray-900 font-medium">{publisher}</span>
        </div>
      )}
      {edition && (
        <div className="flex">
          <span className="text-gray-600 w-32">Edition:</span>
          <span className="text-gray-900">{edition}</span>
        </div>
      )}
      {editionYear && (
        <div className="flex">
          <span className="text-gray-600 w-32">Edition Year:</span>
          <span className="text-gray-900">{editionYear}</span>
        </div>
      )}
      {numberOfPages && (
        <div className="flex">
          <span className="text-gray-600 w-32">Pages:</span>
          <span className="text-gray-900">{numberOfPages}</span>
        </div>
      )}
      {language && (
        <div className="flex">
          <span className="text-gray-600 w-32">Language:</span>
          <span className="text-gray-900">{language}</span>
        </div>
      )}
      {country && (
        <div className="flex">
          <span className="text-gray-600 w-32">Country:</span>
          <span className="text-gray-900">{country}</span>
        </div>
      )}
      {binding && (
        <div className="flex">
          <span className="text-gray-600 w-32">Binding:</span>
          <span className="text-gray-900 capitalize">{binding}</span>
        </div>
      )}
      {isbn && (
        <div className="flex">
          <span className="text-gray-600 w-32">ISBN:</span>
          <span className="text-gray-900">{isbn}</span>
        </div>
      )}
      {genre && genre.length > 0 && (
        <div className="flex">
          <span className="text-gray-600 w-32">Genre:</span>
          <span className="text-gray-900">{genre.join(", ")}</span>
        </div>
      )}
      {translator && translator !== "paperback" && (
        <div className="flex">
          <span className="text-gray-600 w-32">Translator:</span>
          <span className="text-gray-900">{translator}</span>
        </div>
      )}
    </div>
  );
}

// Helper function to generate specifications from variants
const generateSpecificationsFromVariants = (variants: ProductVariant[]) => {
  if (!variants || variants.length === 0) {
    return {};
  }
  
  const specs: { [key: string]: Set<string> } = {};
  variants.forEach((variant) => {
    if (variant.specifications && typeof variant.specifications === 'object') {
      Object.entries(variant.specifications).forEach(([key, value]) => {
        if (key && value && key.trim() && value.toString().trim()) {
          if (!specs[key]) {
            specs[key] = new Set();
          }
          specs[key].add(value.toString().trim());
        }
      });
    }
  });
  
  // Convert Sets to Arrays and sort them
  const finalSpecs: { [key: string]: string[] } = {};
  Object.keys(specs).forEach(key => {
    finalSpecs[key] = Array.from(specs[key]).sort();
  });
  
  return finalSpecs;
};

export default function ProductDetails({
  title,
  author,
  authorId,
  category,
  price,
  originalPrice,
  discount,
  stars: ratings,
  reviews,
  inStock,
  stockCount,
  description,
  id,
  image,
  previewImg,
  previewPdf,
  showPreview: externalShowPreview,
  onPreviewClose,
  brandName,
  isBookCategory,
  publisher,
  edition,
  editionYear,
  numberOfPages,
  isbn,
  binding,
  language,
  country,
  genre,
  translator,
  authors,
  // New props
  productData,
  hasVariants,
  specifications,
  variants,
}: ProductDetailsProps) {
  const router = useRouter(); // ✅ initialize router
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const [internalShowPreview, setInternalShowPreview] = useState<boolean>(false);
  const showPreview = externalShowPreview !== undefined ? externalShowPreview : internalShowPreview;
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.id === id);
  const [activeTab, setActiveTab] = useState<'reviews' | 'specifications'>('reviews');
  
  // New state for specifications
  const [selectedSpecs, setSelectedSpecs] = useState<{ [key: string]: string }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Generate specifications from variants if not provided
  const finalSpecifications = useMemo(() => {
    // First priority: Use provided specifications (for both simple and variable products)
    if (specifications && Object.keys(specifications).length > 0) {
      return specifications;
    }
    
    // Second priority: Check if productData has specifications (for simple products)
    if (productData && 'specifications' in productData && productData.specifications && Object.keys(productData.specifications).length > 0) {
      // Convert single values to arrays for consistency
      const convertedSpecs: { [key: string]: string[] } = {};
      Object.entries(productData.specifications).forEach(([key, value]) => {
        if (key && value) {
          convertedSpecs[key] = Array.isArray(value) ? value : [value];
        }
      });
      return convertedSpecs;
    }
    
    // Third priority: Generate from variants (for variable products)
    if (variants && variants.length > 0) {
      const generated = generateSpecificationsFromVariants(variants);
      if (Object.keys(generated).length > 0) {
        return generated;
      }
    }
    
    return {};
  }, [specifications, hasVariants, variants, productData, id, title]);
  
  // Debug: Log specification data
  useEffect(() => {
    console.log('🎨 Specifications Debug:', {
      productId: id,
      productName: title,
      hasVariants,
      originalSpecs: specifications,
      finalSpecs: finalSpecifications,
      variantsCount: variants?.length || 0,
      sampleVariant: variants?.[0],
      productData: productData ? 'exists' : 'missing'
    });
    
    // Log each variant's specifications
    if (variants && variants.length > 0) {
      console.log('🔍 Variant Details:');
      variants.forEach((variant, index) => {
        console.log(`  Variant ${index + 1}:`, {
          id: variant._id,
          sku: variant.sku,
          specifications: variant.specifications,
          specKeys: variant.specifications ? Object.keys(variant.specifications) : []
        });
      });
    }
  }, [id, title, specifications, finalSpecifications, hasVariants, variants, productData]);
  
  // Find matching variant when specifications change
  useEffect(() => {
    if (!hasVariants || !variants || Object.keys(selectedSpecs).length === 0) {
      setSelectedVariant(null);
      return;
    }
    
    // Find variant that matches all selected specifications
    const matchingVariant = variants.find(variant => {
      return Object.entries(selectedSpecs).every(([key, value]) => 
        variant.specifications[key] === value
      );
    });
    
    setSelectedVariant(matchingVariant || null);
    console.log('🎯 Variant Match:', { selectedSpecs, matchingVariant });
  }, [selectedSpecs, hasVariants, variants]);
  
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.salePrice || selectedVariant.price;
    }
    return originalPrice && originalPrice < price ? originalPrice : price;
  };
  
  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.quantity;
    }
    return stockCount;
  };

  const increment = () => {
    if (!stockCount || quantity < stockCount) setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    
    console.log('🛍 Adding to cart with specs:', {
      selectedSpecs,
      selectedVariant,
      hasSpecs: Object.keys(selectedSpecs).length > 0,
      finalSpecifications,
      productId: id,
      productName: title
    });
    
    // Create unique cart item ID based on product + specifications
    const specString = Object.entries(selectedSpecs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    
    const uniqueId = specString ? `${id}-${specString}` : id;
    
    const cartItem = {
      id: uniqueId,
      productId: id, // ✅ Keep original product ID
      name: title,
      brand: author,
      image: image || "/placeholder.jpg",
      price: getCurrentPrice(), // ✅ Use current price (variant or base)
      originalPrice,
      stock: getCurrentStock(), // ✅ Use current stock (variant or base)
      superDeal: discount !== undefined && discount > 0,
      selected: true,
      quantity,
      // ✅ CRITICAL: Always include selected specifications and variant
      variantId: selectedVariant?._id,
      selectedSpecs: Object.keys(selectedSpecs).length > 0 ? { ...selectedSpecs } : undefined,
      sku: selectedVariant?.sku || (productData && 'productInfo' in productData && 'sku' in productData.productInfo ? productData.productInfo.sku : undefined),
    };
    
    console.log('📦 Cart Item to be added:', cartItem);
    console.log('🔍 Selected Specs Check:', {
      selectedSpecs,
      hasSelectedSpecs: Object.keys(selectedSpecs).length > 0,
      cartItemSpecs: cartItem.selectedSpecs,
      specString
    });
    
    dispatch(addToCart(cartItem));
    
    // Show success message
    const specsText = Object.keys(selectedSpecs).length > 0 
      ? ' (' + Object.entries(selectedSpecs).map(([k,v]) => `${k}: ${v}`).join(', ') + ')'
      : '';
    alert(`Added to cart: ${title}${specsText}`);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    
    console.log('💳 Buy Now with specs:', {
      selectedSpecs,
      selectedVariant,
      hasSpecs: Object.keys(selectedSpecs).length > 0,
      finalSpecifications,
      productId: id,
      productName: title
    });
    
    handleAddToCart();
    setTimeout(() => router.push("/checkout"), 200);
  };

  const handleAddToWishlist = () => {
    if (isInWishlist) return;
    dispatch(
      addToWishlist({
        id,
        name: title,
        brand: author,
        image: image || "/placeholder.jpg",
        price,
        originalPrice,
      })
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} by ${author}`,
      text: `Check out this book: ${title} by ${author} - Only TK. ${price}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: copy URL only
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const shouldShowReadMore = description && description.length > 150;

  return (
    <>
      <div className="space-y-4">
        {/* Product Info */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
          {isBookCategory ? (
            (authors && authors.length > 0) ? (
              <p className="text-blue-600 mb-2 text-sm">
                by {authors.map((auth, idx) => (
                  <span key={auth._id || idx}>
                    <span 
                      className="cursor-pointer hover:underline" 
                      onClick={() => {
                        if (auth._id) {
                          router.push(`/authors/${auth._id}`);
                        }
                      }}
                    >
                      {auth.name}
                    </span>
                    {idx < authors.length - 1 && ", "}
                  </span>
                ))}
              </p>
            ) : author && author !== "Brand/Publisher" && (
              <p className="text-blue-600 mb-2 text-sm">
                by <span className="cursor-pointer hover:underline" onClick={() => {
                  if (authorId) {
                    router.push(`/authors/${authorId}`);
                  }
                }}>{author}</span>
              </p>
            )
          ) : brandName && (
            <p className="text-blue-600 mb-2 text-sm">
              by <span className="cursor-pointer hover:underline">{brandName}</span>
            </p>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(ratings)
                      ? "fill-orange-400 text-orange-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({reviews} reviews)</span>
          </div>

          <div className="mb-3">
            <span className="text-sm text-gray-600">Category: </span>
            <span className="text-blue-600 text-sm">
              {Array.isArray(category)
                ? category
                    .map((cat) => (typeof cat === "string" ? cat : (cat as { name: string }).name))
                    .join(", ")
                : category}
            </span>
          </div>

          {isBookCategory && publisher && (
            <div className="mb-3">
              <span className="text-sm text-gray-600">প্রকাশনী: </span>
              <span className="text-blue-600 text-sm">{publisher}</span>
            </div>
          )}

          {isBookCategory && numberOfPages && (
            <div className="mb-3">
              <span className="text-sm text-gray-600">পৃষ্ঠা: </span>
              <span className="text-blue-600 text-sm">{numberOfPages}</span>
            </div>
          )}

          {description && (
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>
                {showFullDescription ? description : truncateText(description)}
              </p>
              {shouldShowReadMore && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-600 hover:underline text-sm mt-1 flex items-center gap-1"
                >
                  {showFullDescription ? (
                    <>
                      Show less <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Price & Stock */}
        <div className="space-y-3 py-3 border-y">
          <div className="flex items-center gap-3">
            {originalPrice > price && (
              <span className="text-lg text-gray-500 line-through">
                TK. {originalPrice}
              </span>
            )}
            <span className="text-2xl font-bold text-gray-900">
              TK. {price}
            </span>
            {discount && discount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                {discount}% OFF
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                inStock ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span
              className={`text-sm font-medium ${
                inStock ? "text-green-600" : "text-red-600"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
            {inStock && stockCount !== undefined && (
              <span className="text-red-600 text-sm">
                (only {stockCount} left)
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          {inStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={decrement}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={increment}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Offer Notices */}
        {/* <OfferNotices
          items={[
            "৬০% পর্যন্ত ছাড় বাংলা-ইংরেজি স্টকে থাকা বিদেশি বইয়ে!",
            // "৫% এক্সট্রা ছাড় (SUPER5 কোডে) ও ন্যূনতম ৩০০৳ গিফট ভাউচার ৫০০৳+ অর্ডারে!",
          ]}
        /> */}

          {/* Interactive Specification Buttons - Compact Professional Design */}
        {finalSpecifications && Object.keys(finalSpecifications).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Select Options:</h4>
            {Object.entries(finalSpecifications).map(([specName, values]) => {
              // Ensure values is an array
              const valueArray = Array.isArray(values) ? values : [values].filter(Boolean);
              
              if (valueArray.length === 0) return null;
              
              return (
                <div key={specName} className="flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-600 min-w-[80px] pt-2 capitalize">
                    {specName.replace(/([A-Z])/g, ' $1').trim()}:
                  </label>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {valueArray.map((value) => {
                      if (!value) return null;
                      
                      const isSelected = selectedSpecs[specName] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            const newSpecs = { ...selectedSpecs, [specName]: value };
                            setSelectedSpecs(newSpecs);
                          }}
                          className={`px-3 py-1.5 text-sm rounded border transition-all ${
                            isSelected
                              ? 'text-white font-semibold'
                              : 'bg-white text-gray-700 border-gray-300 hover:text-[#1D9BCF]'
                          }`}
                          style={isSelected ? { backgroundColor: '#1D9BCF', borderColor: '#1D9BCF' } : { borderColor: isSelected ? '#1D9BCF' : undefined }}
                        >
                          {value}
                          {isSelected && <span className="ml-1">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Show selected count */}
            {Object.keys(selectedSpecs).length > 0 && (
              <div className="text-xs text-green-600 font-medium">
                ✓ {Object.keys(selectedSpecs).length} option(s) selected: {Object.entries(selectedSpecs).map(([k,v]) => `${k}: ${v}`).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Add to Cart Section */}
        {productData ? (
          <EnhancedAddToCartSection 
            product={productData}
            selectedSpecs={selectedSpecs}
            selectedVariant={selectedVariant}
            currentPrice={getCurrentPrice()}
            currentStock={getCurrentStock()}
            hasVariants={hasVariants || false}
            specifications={finalSpecifications || {}}
          />
        ) : (
          /* Fallback to original buttons */
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!inStock}
                variant="outline"
                className="flex-1 gap-2 text-white hover:opacity-90"
                style={{ backgroundColor: 'transparent', borderColor: '#1D9BCF', color: '#1D9BCF' }}
              >
                <ShoppingCart className="w-4 h-4" />
                Add To Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 text-white hover:opacity-90"
                style={{ backgroundColor: '#1D9BCF' }}
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={handleAddToWishlist}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isInWishlist
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isInWishlist ? "fill-red-500" : ""}`}
                />
                Add to Wishlist
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 text-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewPdf && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-[95vh] sm:max-w-5xl sm:rounded-lg overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                একটু পড়ে দেখুন: {title.replace(/\s*\(undefined\)\s*$/, '')}
              </h3>
              <button
                onClick={() => {
                  if (onPreviewClose) {
                    onPreviewClose();
                  } else {
                    setInternalShowPreview(false);
                  }
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                src={previewPdf}
                className="w-full h-full border-0 block"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal (fallback if no PDF) */}
      {showPreview && !previewPdf && previewImg && previewImg.length > 0 && (
        <div className="fixed inset-0 backdrop-blur-xs bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">একটু পড়ে দেখুন: {title}</h3>
              <button
                onClick={() => {
                  if (onPreviewClose) {
                    onPreviewClose();
                  } else {
                    setInternalShowPreview(false);
                  }
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {previewImg.map((img, idx) => (
                  <div key={idx} className="flex justify-center">
                    <Image
                      src={img}
                      alt={`Preview page ${idx + 1}`}
                      width={600}
                      height={800}
                      className="max-w-full max-h-[70vh] object-contain shadow-lg rounded cursor-zoom-in hover:shadow-xl transition-shadow"
                      onClick={() => setZoomedImage(img)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[60] p-4">
          <button
            onClick={() => setZoomedImage(null)}
            className="fixed top-4 right-4 z-[70] text-red-500 hover:text-red-700 bg-white hover:bg-red-50 p-2 rounded-full shadow-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-[95vw] max-h-[95vh] overflow-auto">
            <Image
              src={zoomedImage}
              alt="Zoomed preview"
              width={1200}
              height={1600}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
