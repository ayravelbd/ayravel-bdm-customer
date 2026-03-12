"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useGetAllCategoriesQuery } from "@/redux/featured/category/categoryApi";
import { TCategory } from "@/types/category/category";

export default function OldSubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { data: categoriesResponse } = useGetAllCategoriesQuery();
  const categories = (Array.isArray(categoriesResponse) ? categoriesResponse : ((categoriesResponse as unknown) as Record<string, unknown>)?.data || []) as TCategory[];
  
  useEffect(() => {
    // Find category by slug
    const category = categories.find(cat => cat.slug === slug);
    
    if (category && category.mainCategory) {
      // Preserve query parameters when redirecting
      const queryString = searchParams.toString();
      const newUrl = `/category/${category.mainCategory}/${category.slug}${queryString ? `?${queryString}` : ''}`;
      router.replace(newUrl);
    } else {
      // If category not found, redirect to home
      router.replace("/");
    }
  }, [slug, categories, router, searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}