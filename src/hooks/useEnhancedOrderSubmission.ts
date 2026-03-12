"use client";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { CartItem } from '@/lib/slices/cartSlice';
import toast from 'react-hot-toast';

interface OrderSubmissionData {
  orderInfo: Array<{
    productInfo: string;
    variantId?: string;
    selectedSpecs?: { [key: string]: string };
    quantity: number;
    totalAmount: {
      subTotal: number;
      tax: number;
      shipping: { name: string; type: string };
      discount: number;
      total: number;
    };
    trackingNumber: number;
    status: string;
    isCancelled: boolean;
    productName: string;
    productImage?: string;
    productSKU?: string;
    specificationSummary?: string;
  }>;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentInfo: string;
  deliveryCharge: number;
  totalAmount: number;
  orderMetadata: {
    orderDate: string;
    orderSource: string;
    hasSpecifications: boolean;
    totalItems: number;
    totalQuantity: number;
    specificationDetails: Array<{
      productId: string;
      productName: string;
      specifications: { [key: string]: string };
      variantId?: string;
      sku?: string;
    }>;
  };
}

export const useEnhancedOrderSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const selectedItems = cartItems.filter(item => item.selected);

  const submitOrderWithSpecifications = async (
    customerInfo: Record<string, string>, 
    paymentMethod: string, 
    deliveryCharge: number = 60
  ) => {
    setIsLoading(true);
    
    try {
      const orderInfo = selectedItems.map((item: CartItem, index: number) => {
        const subTotal = item.price * item.quantity;
        const tax = Math.round(subTotal * 0.05 * 100) / 100;
        const discount = item.originalPrice ? 
          Math.round(((item.originalPrice - item.price) * item.quantity) * 100) / 100 : 0;
        const total = Math.round((subTotal + tax) * 100) / 100;

        return {
          productInfo: item.productId || item.id.split('-')[0],
          variantId: item.variantId || undefined,
          selectedSpecs: item.selectedSpecs || undefined,
          quantity: item.quantity,
          totalAmount: {
            subTotal,
            tax,
            shipping: { name: "Standard", type: "amount" },
            discount,
            total
          },
          trackingNumber: 1000 + index,
          status: "pending",
          isCancelled: false,
          productName: item.name,
          productImage: item.image,
          productSKU: item.sku,
          specificationSummary: item.selectedSpecs ? 
            Object.entries(item.selectedSpecs).map(([k, v]) => `${k}: ${v}`).join(', ') : 
            undefined
        };
      });

      const totalSubtotal = orderInfo.reduce((sum, item) => sum + item.totalAmount.subTotal, 0);
      const totalTax = orderInfo.reduce((sum, item) => sum + item.totalAmount.tax, 0);
      const grandTotal = totalSubtotal + totalTax + deliveryCharge;

      const orderPayload: OrderSubmissionData = {
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
        paymentInfo: paymentMethod,
        deliveryCharge,
        totalAmount: grandTotal,
        orderMetadata: {
          orderDate: new Date().toISOString(),
          orderSource: "web",
          hasSpecifications: selectedItems.some(item => 
            item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0
          ),
          totalItems: selectedItems.length,
          totalQuantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
          specificationDetails: selectedItems
            .filter(item => item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0)
            .map(item => ({
              productId: item.productId || item.id.split('-')[0],
              productName: item.name,
              specifications: item.selectedSpecs!,
              variantId: item.variantId,
              sku: item.sku
            }))
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order');
      }
      
      setIsLoading(false);
      
      return {
        success: true,
        orderId: result.data?.orderId || `ORD-${Date.now()}`,
        message: 'Order placed successfully!',
        orderData: result.data,
        specificationsSaved: orderPayload.orderMetadata.hasSpecifications
      };
      
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getOrderPreview = () => {
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
      hasSpecifications: selectedItems.some(item => 
        item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0
      ),
      specificationSummary: selectedItems
        .filter(item => item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0)
        .map(item => `${item.name}: ${Object.entries(item.selectedSpecs!).map(([k, v]) => `${k}: ${v}`).join(', ')}`)
        .join(' | ')
    };
  };

  return { 
    submitOrderWithSpecifications, 
    isLoading, 
    selectedItems, 
    getOrderPreview 
  };
};
