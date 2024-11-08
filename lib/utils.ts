import { type ClassValue, clsx } from "clsx";
import Decimal from "decimal.js";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { Order, StoreAddress } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export const formatCurrency = (value: number) => {
  return value.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function currencyConvertor(countryCode: string) {
  let currency;

  switch (countryCode) {
    case 'AU':
      currency = '$'; 
      break;
    case 'GB':
      currency = '£'; 
      break;
    default:
      currency = '£'; 
      break;
  }

  return currency;
}

// Utility function to convert Decimal fields to numbers
export function convertDecimalFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalFields);
  } else if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (value instanceof Decimal) {
          return [key, value.toNumber()];
        } else if (typeof value === "object" && value !== null) {
          return [key, convertDecimalFields(value)];
        }
        return [key, value];
      })
    );
  }
  return obj;
}

// Calculate seller's monthly revenue for all 12 months
export function calculateMonthlyRevenue(
  payouts: { amount: Decimal | null; createdAt: Date }[]
): Record<string, string> {
  const monthlyRevenue = payouts.reduce((acc, payout) => {
    const payoutDate = new Date(payout.createdAt);
    const year = payoutDate.getFullYear();
    const month = payoutDate.getMonth() + 1; // getMonth() returns 0-based month, so +1 to make it 1-based

    const key = `${year}-${month.toString().padStart(2, "0")}`; // Format the key as "YYYY-MM"
    if (!acc[key]) {
      acc[key] = new Decimal(0);
    }

    acc[key] = acc[key].plus(payout.amount || 0);
    return acc;
  }, {} as Record<string, Decimal>);

  // Convert all Decimal values to strings for final output
  const formattedMonthlyRevenue = Object.keys(monthlyRevenue).reduce(
    (acc, key) => {
      acc[key] = monthlyRevenue[key].toFixed(2);
      return acc;
    },
    {} as Record<string, string>
  );

  return formattedMonthlyRevenue;
}

// Get popular designers by number of products sold and total revenue
export function getPopularDesigners(
  products: { designer: { name: string }; ourPrice: number }[]
) {
  const designerSales = products.reduce((acc, product) => {
    const designerName = product.designer.name;
    if (!acc[designerName]) acc[designerName] = { count: 0, totalRevenue: 0 };
    acc[designerName].count++;
    acc[designerName].totalRevenue += product.ourPrice;
    return acc;
  }, {} as Record<string, { count: number; totalRevenue: number }>);

  return designerSales;
}

// Get sales by category (number of products sold and total revenue)
export function getSalesByCategory(
  products: { category: { name: string }; ourPrice: number }[]
) {
  const categorySales = products.reduce((acc, product) => {
    const categoryName = product.category.name;
    if (!acc[categoryName]) acc[categoryName] = { count: 0, totalRevenue: 0 };
    acc[categoryName].count++;
    acc[categoryName].totalRevenue += product.ourPrice;
    return acc;
  }, {} as Record<string, { count: number; totalRevenue: number }>);

  return categorySales;
}

// Calculate total likes and clicks across all products
export function getTotalLikesAndClicks(
  products: { likes: number; clicks: number }[]
) {
  const totalLikes = products.reduce((acc, product) => acc + product.likes, 0);
  const totalClicks = products.reduce(
    (acc, product) => acc + product.clicks,
    0
  );
  return { totalLikes, totalClicks };
}

// Calculate average sale price
export function calculateAverageSalePrice(products: { ourPrice: number }[]) {
  const totalRevenue = products.reduce(
    (acc, product) => acc + product.ourPrice,
    0
  );
  return (totalRevenue / products.length).toFixed(2);
}

// Calculate total payout from a list of payouts
export function calculateTotalPayout(
  payouts: { amount: Decimal | null }[] = []
): string {
  const total = payouts.reduce(
    (sum, payout) => sum.plus(payout.amount || 0),
    new Decimal(0)
  );
  return total.toFixed(2);
}

// Calculate Order Conversion Rate for products sold by a seller
export function calculateSellerOrderConversionRate(
  totalClicks: number,
  itemsSold: number
): number {
  if (totalClicks === 0) return 0; // Avoid division by zero
  const conversionRate = (itemsSold / totalClicks) * 100;
  return parseFloat(conversionRate.toFixed(2)); // Return conversion rate rounded to 2 decimal places
}

// Function to transform sellers data
export function calculateTopSellersByMonth(sellers: any[]) {
  // Group sellers by soldCount, then group soldCount by month
  const sellerData = sellers.map((seller) => {
    const monthlySales: Record<string, { count: number; payout: number }> = {};

    seller.payouts.forEach(
      (payout: { createdAt: string | number | Date; amount: any }) => {
        const month = format(new Date(payout.createdAt), "MMMM"); // Extract the month
        if (!monthlySales[month]) {
          monthlySales[month] = { count: 0, payout: 0 };
        }
        monthlySales[month].count += 1; // Add 1 to the sold count
        monthlySales[month].payout += payout.amount; // Sum payout
      }
    );

    return {
      id: seller.id,
      storeName: seller.storeName || seller.instagramHandle,
      monthlySales,
    };
  });

  // Sort sellers by total sold count
  sellerData.sort((a, b) => {
    const totalSalesA = Object.values(a.monthlySales).reduce(
      (sum, monthData) => sum + monthData.count,
      0
    );
    const totalSalesB = Object.values(b.monthlySales).reduce(
      (sum, monthData) => sum + monthData.count,
      0
    );
    return totalSalesB - totalSalesA;
  });

  // Limit to top 10 sellers
  return sellerData.slice(0, 10);
}

export function convertDecimalsToNumbers(data: any): any {
  if (Array.isArray(data)) {
    return data.map(convertDecimalsToNumbers);
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data).reduce((acc: Record<string, any>, key) => {
      const value = data[key];

      // Check if value is a Date and leave it as is
      if (value instanceof Date) {
        acc[key] = value;
      }
      // Check if value is a Prisma Decimal and convert it
      else if (value && typeof value === "object" && "toNumber" in value) {
        acc[key] = value.toNumber();
      } else {
        acc[key] = convertDecimalsToNumbers(value);
      }
      return acc;
    }, {});
  }
  return data;
}

// export const totalRevenue = (orders: any): number => {
//   return orders.reduce((acc: any, order: any) => {
//     return (
//       acc +
//       order.orderItems.reduce((itemAcc: any, item: any) => {
//         return (
//           itemAcc +
//           (typeof item.productAmount === "object" &&
//           "toNumber" in item.productAmount
//             ? item.productAmount.toNumber()
//             : parseFloat(item.productAmount as any) || 0)
//         );
//       }, 0)
//     );
//   }, 0);
// };
export const totalRevenue = (orders: Order[]): number => {
  return orders.reduce((acc, order) => {
    const orderAmount =
      typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
        ? order.totalAmount.toNumber()
        : parseFloat(order.totalAmount as any) || 0;

    return acc + orderAmount;
  }, 0);
};

// export const filterLastMonthOrders = (orders: Order[]) => {
//   const currentDate = new Date();
//   const lastMonth = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() - 1, // Subtract 1 month
//     currentDate.getDate(),
//     currentDate.getHours(),
//     currentDate.getMinutes(),
//     currentDate.getSeconds()
//   );
//   return orders.filter((order) => {
//     const createdAt = new Date(order.createdAt);
//     return createdAt >= lastMonth && createdAt < currentDate;
//   });
// };
export const filterLastMonthOrders = (orders: Order[]) => {
  const currentDate = new Date();

  // Get the date for the same day last month
  const sameDayLastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1, // One month back
    currentDate.getDate(), // Same day of the month as today
    23,
    59,
    59 // End of the day
  );

  // Start from the beginning of last month
  const startOfLastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1, // One month back
    1, // First day of the last month
    0,
    0,
    0 // Beginning of the day
  );

  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return createdAt >= startOfLastMonth && createdAt <= sameDayLastMonth;
  });
};

export const filterThisMonthOrders = (orders: Order[]) => {
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(), // Current month (no subtraction)
    1, // First day of the current month
    0,
    0,
    0 // Set time to the beginning of the day
  );
  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return createdAt >= startOfMonth && createdAt <= currentDate;
  });
};

export const getPayoutSums = (payouts: any[], storeId: string) => {
  let storePayoutSum = new Decimal(0);
  let sellerPayoutSum = new Decimal(0);

  payouts.forEach((payout) => {
    const payoutAmount = new Decimal(payout.amount);
    if (payout.sellerId === storeId) {
      storePayoutSum = storePayoutSum.plus(payoutAmount);
    } else {
      sellerPayoutSum = sellerPayoutSum.plus(payoutAmount);
    }
  });

  return {
    storePayoutSum: storePayoutSum.toNumber(),  
    sellerPayoutSum: sellerPayoutSum.toNumber(),  
  };
};

export const getFieldTypeSingular = (fieldType: string) => {
  if (fieldType === "sub-categories") {
    return "subcategory";
  } else if (fieldType === "categories") {
    return "category";
  }
  return fieldType.slice(0, -1);
};

export function sanitiseAddress(address: StoreAddress | null) {
  if (!address) {
    return {
      city: undefined,
      country: undefined,
      line1: undefined,
      line2: undefined,
      postalCode: undefined,
      state: undefined,
    };
  }

  return {
    ...address,
    city: address.city ?? undefined,
    country: address.country ?? undefined,
    line1: address.line1 ?? undefined,
    line2: address.line2 ?? undefined,
    postalCode: address.postalCode ?? undefined,
    state: address.state ?? undefined,
  };
}


// export function cleanDecimals(object: any) {
//   return JSON.parse(
//     JSON.stringify(object, (key, value) => {
//       if (value instanceof Decimal) {
//         return value.toNumber().toLocaleString("en-GB", { minimumFractionDigits: 2 });
//       }
//       return value;
//     })
//   );
// }
export function cleanDecimals(object: any) {
  return JSON.parse(
    JSON.stringify(object, (key, value) => {
      if (value instanceof Decimal) {
        return value.toNumber(); 
      }
      return value;
    })
  );
}
