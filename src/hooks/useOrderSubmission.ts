"use client";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { CartItem } from '@/lib/slices/cartSlice';

export const useOrderSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const selectedItems = cartItems.filter(item => item.selected);

  const submitOrder = async (customerInfo: Record<string, string>, paymentInfo: string, deliveryCharge: number = 60) => {
    setIsLoading(true);
    
    try {
      const orderInfo = selectedItems.map((item: CartItem, index: number) => ({
        productInfo: item.productId || item.id.split('-')[0],
        variantId: item.variantId || undefined,
        selectedSpecs: item.selectedSpecs || undefined,
        quantity: item.quantity,
        totalAmount: {
          subTotal: item.price * item.quantity,
          tax: Math.round((item.price * item.quantity) * 0.05 * 100) / 100,
          shipping: { name: "Standard", type: "amount" },
          discount: item.originalPrice ? 
            Math.round(((item.originalPrice - item.price) * item.quantity) * 100) / 100 : 0,
          total: Math.round((item.price * item.quantity * 1.05) * 100) / 100
        },
        trackingNumber: 1000 + index,
        status: "pending" as const,
        isCancelled: false,
        productName: item.name,
        productImage: item.image,
        productSKU: item.sku,
        selectedSpecifications: item.selectedSpecs ? 
          Object.entries(item.selectedSpecs).map(([key, value]) => `${key}: ${value}`).join(', ') : 
          undefined
      }));

      const totalSubtotal = orderInfo.reduce((sum, item) => sum + item.totalAmount.subTotal, 0);
      const totalTax = orderInfo.reduce((sum, item) => sum + item.totalAmount.tax, 0);
      const totalDiscount = orderInfo.reduce((sum, item) => sum + item.totalAmount.discount, 0);
      const grandTotal = totalSubtotal + totalTax + deliveryCharge;

      const orderPayload = {
        orderInfo,
        customerInfo: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country || "Bangladesh"
        },
        paymentInfo,
        deliveryCharge,
        totalAmount: grandTotal,
        orderSummary: {
          subtotal: totalSubtotal,
          tax: totalTax,
          discount: totalDiscount,
          shipping: deliveryCharge,
          total: grandTotal,
          itemCount: selectedItems.length,
          totalQuantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0)
        },
        orderDate: new Date().toISOString(),
        orderSource: "web",
        hasVariants: selectedItems.some(item => item.variantId || item.selectedSpecs),
        specifications: selectedItems
          .filter(item => item.selectedSpecs)
          .map(item => ({
            productId: item.productId || item.id.split('-')[0],
            productName: item.name,
            specifications: item.selectedSpecs
          }))
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      return {
        success: true,
        orderId: `ORD-${Date.now()}`,
        message: 'Order placed successfully!',
        orderData: orderPayload
      };
      
    } catch (error) {
      setIsLoading(false);
      console.error('Order submission error:', error);
      throw new Error('Failed to place order. Please try again.');
    }
  };

  const getOrderSummary = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const discount = selectedItems.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
    
    return {
      subtotal,
      tax,
      discount,
      itemCount: selectedItems.length,
      totalQuantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
      hasSpecifications: selectedItems.some(item => item.selectedSpecs || item.variantId)
    };
  };

  return { 
    submitOrder, 
    isLoading, 
    selectedItems, 
    getOrderSummary 
  };
};
