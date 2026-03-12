/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { Star, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { handleAddToCart } from "../Page/cart/useHandleAddtocart";
import { useGetAllProductsQuery } from "@/redux/featured/product/productApi";
import { useGetFeaturedCategoriesQuery } from "@/redux/featured/category/categoryApi";

interface CategoryWiseProductsProps {
  categoryName: string;
}

const CategoryWiseProducts: React.FC<CategoryWiseProductsProps> = ({ categoryName }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [brands, setBrands] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: categoriesData } = useGetFeaturedCategoriesQuery("");
  const { data: allProductsData, isLoading } = useGetAllProductsQuery("");
  const categories = categoriesData?.data || [];
  const allProducts = allProductsData?.data || [];
  
  // Filter products by specific category name
  const products = useMemo(() => {
    return allProducts.filter((product: any) => {
      const categoryMatch = product.categoryAndTags?.categories?.some((cat: any) => 
        cat?.name === categoryName
      );
      return categoryMatch;
    }).slice(0, 10).map((product: any) => {
      const categoryName = product.categoryAndTags?.categories?.[0]?.name;
      const bookCategories = ['book', 'books', 'বই', 'novel', 'story', 'literature', 'fiction', 'non-fiction'];
      const isBook = categoryName ? bookCategories.some((cat: string) => 
        categoryName.toLowerCase().includes(cat.toLowerCase())
      ) : false;
      return { ...product, isBook };
    });
  }, [allProducts, categoryName]);
  
  useEffect(() => {
    const fetchBrands = async () => {
      const brandIds = products
        .filter((p: any) => !p.isBook && p.productInfo?.brand && typeof p.productInfo.brand === 'string')
        .map((p: any) => p.productInfo.brand);
      
      const uniqueIds = [...new Set(brandIds)] as string[];
      const brandMap: Record<string, string> = {};
      
      await Promise.all(
        uniqueIds.map(async (id: string) => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/brand/${id}`);
            const data = await res.json();
            if (data.success && data.data?.name) {
              brandMap[id] = data.data.name;
            }
          } catch (err) {
            console.error('Brand fetch error:', err);
          }
        })
      );
      
      setBrands(brandMap);
    };
    
    if (products.length) fetchBrands();
  }, [products]);
  
  // Get category info for display
  const categoryInfo = categories.find((cat: any) => 
    cat.name === categoryName
  );
  
  const categorySlug = categoryInfo?.slug || categoryName?.toLowerCase().replace(/\s+/g, '-') || 'default';
  const mainCategory = categoryInfo?.mainCategory || 'book';
  


  const getProductAuthorOrBrand = (product: any) => {
    if (product.isBook) {
      return product?.bookInfo?.specification?.authors?.[0]?.name || 
             product?.categoryAndTags?.publisher || 
             "Unknown Author";
    }
    const brandId = typeof product.productInfo?.brand === 'string' ? product.productInfo.brand : product.productInfo?.brand?._id;
    return brandId && brands[brandId] ? brands[brandId] : "Brand";
  };

  const handleAddToCartWithAnimation = (product: any) => {
    handleAddToCart(product, dispatch);
    setAddedItems(prev => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }, 2000);
  };

  const renderStars = (rating = 0) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < Math.round(rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  const scrollBy = (delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto shadow-sm p-4 m-4 rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3 overflow-hidden pb-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[200px]">
              <div className="p-2">
                <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!products.length) {
    return null; // Don't show anything if no products found for this category
  }

  return (
    <div className="max-w-[1280px] mx-auto shadow-sm p-4 m-4 rounded-lg bg-white relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-medium text-[22px] leading-[27px] text-[rgb(51,51,51)]" style={{ fontFamily: 'Lato, sans-serif, SiyamRupali', fontWeight: 500 }}>{categoryName} 🔥 📚 🎨</h1>
        <button 
          onClick={() => router.push(`/category/${mainCategory}/${categorySlug}`)}
          className="px-4 py-2 border border-[#0692cb] text-[#0692cb] hover:bg-[#0692cb] hover:text-white rounded-md font-medium transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
        ref={scrollRef}
      >
          {products.map((product: any) => (
            <Card
              key={product._id}
              className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 rounded-lg border-none text-center flex-shrink-0 w-[200px] snap-start"
            >
              <CardContent className="p-2 flex flex-col items-center justify-center">
                {/* Image Section */}
                <div className="relative w-full aspect-[3/4] mb-2 overflow-hidden rounded-lg">
                  <Image
                    src={product.featuredImg}
                    alt={product.description.name}
                    fill
                    className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Discount Badge */}
                  {product.productInfo.salePrice && (() => {
                    const discountPercent = Math.round(((product.productInfo.price - product.productInfo.salePrice) / product.productInfo.price) * 100);
                    const badgeColor = discountPercent > 30 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black';
                    return (
                      <div className={`absolute top-1 left-1 w-12 h-12 rounded-full ${badgeColor} text-xs font-bold flex flex-col items-center justify-center leading-tight z-10`}>
                        <span>{discountPercent}%</span>
                        <span>OFF</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Product Info */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <CardTitle className="font-bold text-sm line-clamp-2">
                    {product.description.name}
                  </CardTitle>

                  <CardDescription className="text-xs text-gray-600 line-clamp-1">
                    {getProductAuthorOrBrand(product)}
                  </CardDescription>

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

                {/* Full Card Hover Overlay */}
                <div className="absolute inset-0 bg-white/55 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-3 transition-all duration-300 rounded-lg">
                  <Button
                    variant={addedItems.has(product._id) ? "default" : "secondary"}
                    size="sm"
                    className={`transition-all duration-300 cursor-pointer z-10 shadow-md ${
                      addedItems.has(product._id) 
                        ? "bg-green-500 hover:bg-green-600 text-white scale-110" 
                        : "bg-gray-800 hover:bg-gray-900 text-white"
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
                      size="sm"
                      className="bg-[#0692cb] hover:bg-[#0692cb]/90 text-white transition-all cursor-pointer duration-300 z-10 shadow-md"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <button
        onClick={() => scrollBy(-500)}
        className="absolute top-1/2 -translate-y-1/2 left-0 z-10 h-16 w-8 rounded-md border-2  cursor-pointer bg-white shadow hover:shadow-md flex items-center justify-center"
      >
        <ChevronLeft className="h-8 w-8" strokeWidth={3} />
      </button>

      <button
        onClick={() => scrollBy(500)}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-10 h-16 w-9 rounded-md border-2 cursor-pointer bg-white shadow hover:shadow-md flex items-center justify-center"
      >
        <ChevronRight className="h-8 w-8" strokeWidth={3} />
      </button>
    </div>
  );
};

export default CategoryWiseProducts;