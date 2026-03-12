"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGetAllProductsQuery } from "@/redux/featured/product/productApi";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/redux/hooks";
import { handleAddToCart } from "@/Component/Page/cart/useHandleAddtocart";
import { TProduct } from "@/types/product/product";

interface ProductInfo {
  price: number;
  salePrice?: number;
  inStock: boolean;
  quantity: number;
}

interface Description {
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  featuredImg: string;
  description: Description;
  productInfo: ProductInfo;
  createdAt?: string;
}

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const sortParam = searchParams.get('sort');
  const { data: allProducts, isLoading } = useGetAllProductsQuery("");
  const dispatch = useAppDispatch();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleAddToCartWithAnimation = (product: Product) => {
    const transformedProduct: TProduct = {
      ...product,
      description: {
        ...product.description,
        description: "",
        status: "publish" as const
      },
      productInfo: {
        ...product.productInfo,
        sku: product._id,
        status: product.productInfo.inStock ? "publish" : "out-of-stock"
      }
    };
    handleAddToCart(transformedProduct, dispatch);
    setAddedItems(prev => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }, 2000);
  };

  // Sort products based on the sort parameter
  const sortedProducts = allProducts?.data ? [...allProducts.data].sort((a: Product, b: Product) => {
    if (sortParam === 'new-released') {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    }
    // Default to best seller or other sorting logic
    return 0;
  }) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(20)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow">
                <div className="w-full h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {sortParam === 'new-released' ? 'New Released Products' : 'All Products'}
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedProducts.map((product: Product) => (
            <Card
              key={product._id}
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 rounded-lg border-none text-center"
            >
              <CardContent className="p-2 flex flex-col items-center justify-center">
                {/* Image Section */}
                <div className="relative w-full h-48 mb-2 overflow-hidden rounded-lg">
                  <Image
                    src={product.featuredImg}
                    alt={product.description.name}
                    fill
                    className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center space-y-4 items-center py-6 transition-all duration-500">
                    <Button
                      variant={addedItems.has(product._id) ? "default" : "secondary"}
                      size="sm"
                      className={`transition-all duration-500 cursor-pointer translate-y-[-10px] group-hover:translate-y-0 ${
                        addedItems.has(product._id) 
                          ? "bg-green-500 hover:bg-green-600 text-white scale-110" 
                          : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCartWithAnimation(product);
                      }}
                    >
                      {addedItems.has(product._id) ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Added!
                        </>
                      ) : (
                        "Add to Cart"
                      )}
                    </Button>

                    <Link href={`/product/${product.description.slug}`}>
                      <Button
                        variant="default"
                        size="sm"
                        className="transition-all duration-500 cursor-pointer translate-y-[10px] group-hover:translate-y-0"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <CardTitle className="font-bold text-sm line-clamp-2">
                    {product.description.name}
                  </CardTitle>

                  {/* Discount Badge */}
                  {product.productInfo.salePrice && (() => {
                    const discountPercent = Math.round(((product.productInfo.price - product.productInfo.salePrice) / product.productInfo.price) * 100);
                    const badgeColor = discountPercent > 30 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black';
                    return (
                      <div className={`absolute top-1 left-1 w-12 h-12 rounded-full ${badgeColor} text-xs font-bold flex flex-col items-center justify-center leading-tight`}>
                        <span>{discountPercent}%</span>
                        <span>OFF</span>
                      </div>
                    );
                  })()}

                  {/* Price Section */}
                  {product.productInfo.salePrice ? (
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-gray-500 line-through text-xs">
                        ৳ {product.productInfo.price}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        ৳ {product.productInfo.salePrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold">
                      ৳ {product.productInfo.price}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}