"use client";
import { useState, useEffect } from "react";
import { Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpecificationSelector } from "./InteractiveSpecificationSelector";
import { EnhancedAddToCartSection } from "./EnhancedAddToCartSection";

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

interface Props {
  product: {
    _id: string;
    description: {
      name: string;
      description: string;
    };
    productInfo: {
      price: number;
      salePrice?: number;
      sku: string;
      quantity: number;
      inStock: boolean;
      brand?: {
        name: string;
      };
    };
    featuredImg: string;
    gallery?: string[];
    averageRating?: number;
    reviewCount?: number;
    hasVariants?: boolean;
    specifications?: { [key: string]: string[] };
    variants?: ProductVariant[];
  };
}

export const CompleteProductPage = ({ product }: Props) => {
  const [selectedSpecs, setSelectedSpecs] = useState<{ [key: string]: string }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentPrice, setCurrentPrice] = useState(product.productInfo.salePrice || product.productInfo.price);
  const [currentStock, setCurrentStock] = useState(product.productInfo.quantity);
  const [selectedImage, setSelectedImage] = useState(product.featuredImg);

  // Update selected image when variant changes
  useEffect(() => {
    if (selectedVariant?.images?.length) {
      setSelectedImage(selectedVariant.images[0]);
    } else {
      setSelectedImage(product.featuredImg);
    }
  }, [selectedVariant, product.featuredImg]);

  const getAvailableImages = () => {
    const images = [product.featuredImg];
    if (product.gallery?.length) images.push(...product.gallery);
    if (selectedVariant?.images?.length) images.push(...selectedVariant.images);
    return [...new Set(images)]; // Remove duplicates
  };

  const hasDiscount = product.productInfo.salePrice && product.productInfo.salePrice < product.productInfo.price;
  const discountPercentage = hasDiscount ? 
    Math.round(((product.productInfo.price - product.productInfo.salePrice!) / product.productInfo.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={selectedImage} 
              alt={product.description.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image Thumbnails */}
          <div className="flex gap-2 overflow-x-auto">
            {getAvailableImages().map((img, i) => (
              <img 
                key={i}
                src={img} 
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-colors ${
                  selectedImage === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="space-y-6">
          {/* Product Title & Basic Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.description.name}
            </h1>
            
            {product.productInfo.brand && (
              <p className="text-blue-600 mb-2">
                by {product.productInfo.brand.name}
              </p>
            )}
            
            <p className="text-gray-600 mb-2">
              SKU: {selectedVariant?.sku || product.productInfo.sku}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < Math.floor(product.averageRating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-600">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ৳{product.productInfo.price.toLocaleString()}
                  </span>
                  <Badge variant="destructive">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Interactive Specification Selector */}
          {product.hasVariants && product.specifications && Object.keys(product.specifications).length > 0 && (
            <InteractiveSpecificationSelector 
              specifications={product.specifications}
              variants={product.variants || []}
              onSpecChange={setSelectedSpecs}
              onVariantChange={setSelectedVariant}
              onPriceChange={setCurrentPrice}
              onStockChange={setCurrentStock}
            />
          )}

          {/* Simple Product Specifications (No Variants) */}
          {!product.hasVariants && product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, values]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium capitalize text-gray-600">{key}:</span>
                    <span className="text-gray-900">
                      {Array.isArray(values) ? values.join(', ') : values}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Add to Cart Section */}
          <EnhancedAddToCartSection 
            product={product}
            selectedSpecs={selectedSpecs}
            selectedVariant={selectedVariant}
            currentPrice={currentPrice}
            currentStock={currentStock}
            hasVariants={product.hasVariants || false}
            specifications={product.specifications || {}}
          />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-b">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>30 Day Returns</span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};