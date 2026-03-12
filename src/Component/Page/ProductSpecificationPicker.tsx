"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Ruler, Tag, Check } from "lucide-react";

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
  specifications: { [key: string]: string[] };
  variants: ProductVariant[];
  onSpecChange: (specs: { [key: string]: string }) => void;
  onVariantChange: (variant: ProductVariant | null) => void;
}

export const ProductSpecificationPicker = ({ 
  specifications, 
  variants, 
  onSpecChange, 
  onVariantChange 
}: Props) => {
  const [selectedSpecs, setSelectedSpecs] = useState<{ [key: string]: string }>({});

  const handleSpecChange = (specName: string, value: string) => {
    const newSpecs = { ...selectedSpecs, [specName]: value };
    setSelectedSpecs(newSpecs);
    onSpecChange(newSpecs);
    
    // Find matching variant
    const matchingVariant = variants?.find(variant => 
      Object.entries(newSpecs).every(([key, val]) => 
        variant.specifications[key] === val
      )
    );
    
    onVariantChange(matchingVariant || null);
  };

  const getSpecIcon = (specName: string) => {
    const name = specName.toLowerCase();
    if (name.includes('color') || name.includes('colour')) return <Palette className="w-4 h-4" />;
    if (name.includes('size')) return <Ruler className="w-4 h-4" />;
    return <Tag className="w-4 h-4" />;
  };

  const isColorSpec = (specName: string) => {
    return specName.toLowerCase().includes('color') || specName.toLowerCase().includes('colour');
  };

  const getColorCode = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#FF0000', blue: '#0000FF', black: '#000000', white: '#FFFFFF',
      pink: '#FFC0CB', gray: '#808080', grey: '#808080', navy: '#000080', 
      green: '#008000', yellow: '#FFFF00', purple: '#800080', orange: '#FFA500', 
      brown: '#8B4513', beige: '#F5F5DC', maroon: '#800000', olive: '#808000',
      silver: '#C0C0C0', gold: '#FFD700', cyan: '#00FFFF', magenta: '#FF00FF'
    };
    return colorMap[colorName.toLowerCase()] || '#CCCCCC';
  };

  const isLightColor = (colorName: string): boolean => {
    const lightColors = ['white', 'yellow', 'pink', 'beige', 'silver', 'cyan'];
    return lightColors.includes(colorName.toLowerCase());
  };

  return (
    <div className="space-y-4">
      {Object.entries(specifications).map(([specName, values]) => (
        <div key={specName} className="space-y-2">
          <div className="flex items-center gap-2">
            {getSpecIcon(specName)}
            <h4 className="font-medium capitalize">{specName}:</h4>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedSpecs[specName] === value;
              
              if (isColorSpec(specName)) {
                return (
                  <button
                    key={value}
                    onClick={() => handleSpecChange(specName, value)}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                      isSelected ? 'border-blue-500 scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: getColorCode(value) }}
                    title={value}
                  >
                    {isSelected && (
                      <Check 
                        className={`w-4 h-4 absolute inset-0 m-auto ${
                          isLightColor(value) ? 'text-black' : 'text-white'
                        }`} 
                      />
                    )}
                  </button>
                );
              }
              
              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSpecChange(specName, value)}
                  className={`${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};