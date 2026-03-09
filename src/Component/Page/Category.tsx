"use client";

import { Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGetAllProductsQuery } from "@/redux/featured/product/productApi";

interface CategoryObject {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  categoryAndTags: {
    categories: CategoryObject[];
  };
}

export default function CategoryListPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: responseData, isLoading } = useGetAllProductsQuery({});
  const [categories, setCategories] = useState<CategoryObject[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!responseData) return;
    
    const products = Array.isArray(responseData.data) ? responseData.data : [];
    const allCategoryObjects = products.flatMap(
      (p: Product) => p.categoryAndTags.categories || []
    );

    const uniqueCategories = [
      ...new Map(
        allCategoryObjects.map((category: CategoryObject) => [category._id, category])
      ).values(),
    ] as CategoryObject[];

    setCategories(
      uniqueCategories.sort((a: CategoryObject, b: CategoryObject) => a.name.localeCompare(b.name))
    );
  }, [responseData]);

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/category/subcategory/${categorySlug}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-100">
      <div className="flex items-center gap-2 md:gap-3 relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide py-3 md:py-4 px-1 no-scrollbar flex-nowrap"
        >
          {isLoading ? (
            <div className="flex items-center justify-center ...">লোডিং...</div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category.slug)}
                className="flex items-center flex-shrink-0 gap-2 bg-white border border-blue-400 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-blue-50 hover:border-blue-500 text-gray-700"
              >
                <Tag className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>{category.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
