"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, Package } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateQuantity, removeItem, toggleSelectItem } from "@/lib/slices/cartSlice";
import { CartItem } from "@/lib/slices/cartSlice";
import Image from "next/image";

interface Props {
  item: CartItem;
}

export const EnhancedCartItem = ({ item }: Props) => {
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
    <div className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
      item.selected ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={item.selected}
        onChange={handleToggleSelect}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />
      
      {/* Product Image */}
      <div className="w-20 h-20 relative flex-shrink-0">
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
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {Object.entries(item.selectedSpecs).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs bg-white">
                  <span className="capitalize">{key}:</span> {value}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* SKU */}
        {item.sku && (
          <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
        )}
        
        {/* Specification Summary */}
        {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Selected: {Object.entries(item.selectedSpecs).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </p>
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
          className="h-8 w-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(1)}
          disabled={item.stock ? item.quantity >= item.stock : false}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      {/* Total Price & Stock Info */}
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
        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Enhanced Cart Summary Component
interface CartSummaryProps {
  items: CartItem[];
  onCheckout: () => void;
}

export const EnhancedCartSummary = ({ items, onCheckout }: CartSummaryProps) => {
  const selectedItems = items.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
  const shipping = 60; // Fixed shipping
  const total = subtotal + tax + shipping;

  const hasSpecifications = selectedItems.some(item => 
    item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0
  );

  return (
    <div className="bg-white border rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span>Subtotal ({selectedItems.length} items)</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (5%)</span>
          <span>৳{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>৳{shipping}</span>
        </div>
        <hr />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-green-600">৳{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Specification Summary */}
      {hasSpecifications && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Custom Specifications</span>
          </div>
          <div className="text-xs text-blue-700">
            {selectedItems
              .filter(item => item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0)
              .map(item => `${item.name}: ${Object.entries(item.selectedSpecs!).map(([k, v]) => `${k}: ${v}`).join(', ')}`)
              .join(' • ')}
          </div>
        </div>
      )}

      <Button 
        onClick={onCheckout}
        disabled={selectedItems.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
      >
        Proceed to Checkout ({selectedItems.length} items)
      </Button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        All specifications will be included in your order
      </p>
    </div>
  );
};