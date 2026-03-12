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
  variants?: ProductVariant[];
  onSpecChange: (specs: { [key: string]: string }) => void;
  onVariantChange: (variant: ProductVariant | null) => void;
  onPriceChange: (price: number) => void;
  onStockChange: (stock: number) => void;
}

export const InteractiveSpecificationSelector = ({ 
  specifications, 
  variants = [], 
  onSpecChange, 
  onVariantChange,
  onPriceChange,
  onStockChange
}: Props) => {
  const [selectedSpecs, setSelectedSpecs] = useState<{ [key: string]: string }>({});
  const [availableOptions, setAvailableOptions] = useState<{ [key: string]: string[] }>(specifications);

  // Update available options based on current selections
  useEffect(() => {
    if (!variants.length) {
      setAvailableOptions(specifications);
      return;
    }

    const newAvailableOptions: { [key: string]: string[] } = {};
    
    Object.keys(specifications).forEach(specName => {
      const availableValues = new Set<string>();
      
      variants.forEach(variant => {
        // Check if this variant matches current selections (except for current spec)
        const matchesOtherSpecs = Object.entries(selectedSpecs)
          .filter(([key]) => key !== specName)
          .every(([key, value]) => variant.specifications[key] === value);
        
        if (matchesOtherSpecs && variant.isActive) {
          availableValues.add(variant.specifications[specName]);
        }
      });
      
      newAvailableOptions[specName] = Array.from(availableValues).sort();
    });
    
    setAvailableOptions(newAvailableOptions);
  }, [selectedSpecs, variants, specifications]);

  // Find matching variant and update parent
  useEffect(() => {
    if (!variants.length) {
      onSpecChange(selectedSpecs);
      return;
    }

    const matchingVariant = variants.find(variant => 
      Object.entries(selectedSpecs).every(([key, value]) => 
        variant.specifications[key] === value
      ) && variant.isActive
    );
    
    onSpecChange(selectedSpecs);
    onVariantChange(matchingVariant || null);
    
    if (matchingVariant) {
      onPriceChange(matchingVariant.salePrice || matchingVariant.price);
      onStockChange(matchingVariant.quantity);
    }
  }, [selectedSpecs, variants, onSpecChange, onVariantChange, onPriceChange, onStockChange]);

  const handleSpecChange = (specName: string, value: string) => {
    const newSpecs = { ...selectedSpecs, [specName]: value };
    setSelectedSpecs(newSpecs);
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

  const isOptionAvailable = (specName: string, value: string) => {
    return availableOptions[specName]?.includes(value) || !variants.length;
  };

  const canSelectAll = () => {
    return Object.keys(specifications).every(specName => selectedSpecs[specName]);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Specifications:</h3>
      
      {Object.entries(specifications).map(([specName, values]) => (
        <div key={specName} className="space-y-3">
          <div className="flex items-center gap-2">
            {getSpecIcon(specName)}
            <h4 className="font-medium capitalize">{specName}:</h4>
            {selectedSpecs[specName] && (
              <Badge variant="secondary" className="ml-2">
                Selected: {selectedSpecs[specName]}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedSpecs[specName] === value;
              const isAvailable = isOptionAvailable(specName, value);
              
              if (isColorSpec(specName)) {
                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && handleSpecChange(specName, value)}
                    disabled={!isAvailable}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 scale-110 shadow-lg' 
                        : isAvailable 
                          ? 'border-gray-300 hover:border-gray-400 hover:scale-105' 
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: getColorCode(value) }}
                    title={`${value} ${!isAvailable ? '(Not available)' : ''}`}
                  >
                    {isSelected && (
                      <Check 
                        className={`w-5 h-5 absolute inset-0 m-auto ${
                          isLightColor(value) ? 'text-black' : 'text-white'
                        }`} 
                      />
                    )}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✕</span>
                      </div>
                    )}
                  </button>
                );
              }
              
              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => isAvailable && handleSpecChange(specName, value)}
                  disabled={!isAvailable}
                  className={`${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : isAvailable
                        ? 'hover:bg-blue-50 hover:border-blue-300'
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {value}
                  {!isAvailable && <span className="ml-1 text-xs">✕</span>}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selection Summary */}
      {Object.keys(selectedSpecs).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Your Selection:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedSpecs).map(([key, value]) => (
              <Badge key={key} variant="outline" className="bg-white border-blue-300">
                <span className="capitalize">{key}:</span> {value}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Validation Message */}
      {variants.length > 0 && !canSelectAll() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            Please select all options to add to cart
          </p>
        </div>
      )}
    </div>
  );
};