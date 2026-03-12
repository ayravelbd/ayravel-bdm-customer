"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateQuantity, removeItem, toggleSelectItem } from "@/lib/slices/cartSlice";
import { CartItem } from "@/lib/slices/cartSlice";
import Image from "next/image";

interface Props {
  item: CartItem;
}

export const CartItemWithSpecs = ({ item }: Props) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (change: number) => {
    dispatch(updateQuantity({ id: item.id, quantity: change }));
  };

  const handleRemove = () => {
    dispatch(removeItem(item.id));
  };

  const handleToggleSelect = () => {
    dispatch(toggleSelectItem(item.id));
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded-lg ${
      item.selected ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
    }`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={item.selected}
        onChange={handleToggleSelect}
        className="w-4 h-4 text-blue-600 rounded"
      />
      
      {/* Product Image */}
      <div className="w-16 h-16 relative">
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={item.name}
          fill
          className="object-cover rounded"
        />
      </div>
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
        
        {item.brand && (
          <p className="text-sm text-gray-600">by {item.brand}</p>
        )}
        
        {/* Display selected specifications */}
        {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(item.selectedSpecs).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                <span className="capitalize">{key}:</span> {value}
              </Badge>
            ))}
          </div>
        )}
        
        {/* SKU */}
        {item.sku && (
          <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-green-600">৳{item.price.toLocaleString()}</span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-sm text-gray-500 line-through">
              ৳{item.originalPrice.toLocaleString()}
            </span>
          )}
          {item.superDeal && (
            <Badge variant="destructive" className="text-xs">SALE</Badge>
          )}
        </div>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(-1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(1)}
          disabled={item.stock ? item.quantity >= item.stock : false}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Total Price */}
      <div className="text-right min-w-0">
        <div className="font-semibold text-lg">
          ৳{(item.price * item.quantity).toLocaleString()}
        </div>
        {item.stock && (
          <div className="text-xs text-gray-500">
            Stock: {item.stock}
          </div>
        )}
      </div>
      
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};