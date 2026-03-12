// ORDER DATA STRUCTURE WITH SPECIFICATIONS
// This shows how your order data will look when customer selects specifications

// 1. CART ITEM WITH SPECIFICATIONS
const cartItemExample = {
  id: "69b169f695aa9bb27a53fae8-69b16c5595aa9bb27a53fba9", // product-variant
  productId: "69b169f695aa9bb27a53fae8",
  variantId: "69b16c5595aa9bb27a53fba9",
  name: "Apple Airbuds",
  brand: "AYraveL",
  image: "https://res.cloudinary.com/dxe878eei/image/upload/v1773234697/wrop6bu8me-1773234673710-e5b23c70b92d51ac06d54b59f4ebddf5.jpg",
  price: 8500,
  originalPrice: 10000,
  quantity: 2,
  stock: 20,
  selected: true,
  superDeal: true,
  sku: "ai-1080-Red-s",
  selectedSpecs: {
    color: "Red",
    size: "s"
  }
};

// 2. ORDER PAYLOAD TO BACKEND
const orderPayloadExample = {
  orderInfo: [
    {
      productInfo: "69b169f695aa9bb27a53fae8",
      variantId: "69b16c5595aa9bb27a53fba9",
      selectedSpecs: {
        color: "Red",
        size: "s"
      },
      quantity: 2,
      totalAmount: {
        subTotal: 17000, // 8500 * 2
        tax: 850, // 5% tax
        shipping: { name: "Standard", type: "amount" },
        discount: 3000, // (10000 - 8500) * 2
        total: 17850
      },
      trackingNumber: 1001,
      status: "pending",
      isCancelled: false,
      productName: "Apple Airbuds",
      productImage: "https://res.cloudinary.com/dxe878eei/image/upload/v1773234697/wrop6bu8me-1773234673710-e5b23c70b92d51ac06d54b59f4ebddf5.jpg",
      productSKU: "ai-1080-Red-s",
      selectedSpecifications: "color: Red, size: s"
    }
  ],
  customerInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+8801234567890",
    address: "123 Main Street",
    city: "Dhaka",
    postalCode: "1000",
    country: "Bangladesh"
  },
  paymentInfo: "cash-on",
  deliveryCharge: 60,
  totalAmount: 17910, // 17850 + 60
  orderSummary: {
    subtotal: 17000,
    tax: 850,
    discount: 3000,
    shipping: 60,
    total: 17910,
    itemCount: 1,
    totalQuantity: 2
  },
  orderDate: "2026-03-11T14:30:00.000Z",
  orderSource: "web",
  hasVariants: true,
  specifications: [
    {
      productId: "69b169f695aa9bb27a53fae8",
      productName: "Apple Airbuds",
      specifications: {
        color: "Red",
        size: "s"
      }
    }
  ]
};

// 3. HOW TO USE IN PRODUCT PAGE
/*
// In your product page component:
import ProductDetails from "@/Component/Page/ProductDetails";

// Your existing product data from API
const product = {
  _id: "69b169f695aa9bb27a53fae8",
  description: { name: "Apple Airbuds", description: "..." },
  productInfo: { price: 10000, salePrice: 8500, quantity: 100 },
  hasVariants: true,
  specifications: { color: ["Red", "Green"], size: ["s", "M", "xL"] },
  variants: [
    {
      _id: "69b16c5595aa9bb27a53fba9",
      sku: "ai-1080-Red-s",
      price: 10000,
      salePrice: 8500,
      quantity: 20,
      specifications: { color: "Red", size: "s" }
    }
    // ... more variants
  ]
};

// Pass to ProductDetails component:
<ProductDetails
  // ... your existing props
  productData={product}
  hasVariants={product.hasVariants}
  specifications={product.specifications}
  variants={product.variants}
/>
*/

// 4. CART DISPLAY WITH SPECIFICATIONS
/*
import { CartItemWithSpecs } from "@/Component/Page/cart/CartItemWithSpecs";

// In your cart page:
{cartItems.map(item => (
  <CartItemWithSpecs key={item.id} item={item} />
))}
*/

// 5. ORDER SUBMISSION
/*
import { useOrderSubmission } from "@/hooks/useOrderSubmission";

// In your checkout component:
const { submitOrder, isLoading, selectedItems, getOrderSummary } = useOrderSubmission();

const handlePlaceOrder = async () => {
  try {
    const result = await submitOrder(customerInfo, paymentMethod, 60);
    console.log('Order placed:', result);
    // Handle success
  } catch (error) {
    console.error('Order failed:', error);
    // Handle error
  }
};
*/

export default orderPayloadExample;