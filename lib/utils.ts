import { type ClassValue, clsx } from "clsx"
import Decimal from "decimal.js";
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

// Calculate seller's monthly revenue for all 12 months
export function calculateMonthlyRevenue(payouts: { amount: Decimal | null, createdAt: Date }[]): Record<string, string> {
  const monthlyRevenue = payouts.reduce((acc, payout) => {
    const payoutDate = new Date(payout.createdAt);
    const year = payoutDate.getFullYear();
    const month = payoutDate.getMonth() + 1; // getMonth() returns 0-based month, so +1 to make it 1-based

    const key = `${year}-${month.toString().padStart(2, '0')}`; // Format the key as "YYYY-MM"
    if (!acc[key]) {
      acc[key] = new Decimal(0);
    }

    acc[key] = acc[key].plus(payout.amount || 0);
    return acc;
  }, {} as Record<string, Decimal>);

  // Convert all Decimal values to strings for final output
  const formattedMonthlyRevenue = Object.keys(monthlyRevenue).reduce((acc, key) => {
    acc[key] = monthlyRevenue[key].toFixed(2);
    return acc;
  }, {} as Record<string, string>);

  return formattedMonthlyRevenue;
}

// Get popular designers by number of products sold and total revenue
export function getPopularDesigners(products: { designer: { name: string }, ourPrice: number }[]) {
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
export function getSalesByCategory(products: { category: { name: string }; ourPrice: number }[]) {
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
export function getTotalLikesAndClicks(products: { likes: number; clicks: number }[]) {
  const totalLikes = products.reduce((acc, product) => acc + product.likes, 0);
  const totalClicks = products.reduce((acc, product) => acc + product.clicks, 0);
  return { totalLikes, totalClicks };
}

// Calculate average sale price
export function calculateAverageSalePrice(products: { ourPrice: number }[]) {
  const totalRevenue = products.reduce((acc, product) => acc + product.ourPrice, 0);
  return (totalRevenue / products.length).toFixed(2);
}

// Calculate total payout from a list of payouts
export function calculateTotalPayout(payouts: { amount: Decimal | null }[] = []): string {
  const total = payouts.reduce((sum, payout) => sum.plus(payout.amount || 0), new Decimal(0));
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

    seller.payouts.forEach((payout: { createdAt: string | number | Date; amount: any }) => {
      const month = format(new Date(payout.createdAt), 'MMMM'); // Extract the month
      if (!monthlySales[month]) {
        monthlySales[month] = { count: 0, payout: 0 };
      }
      monthlySales[month].count += 1; // Add 1 to the sold count
      monthlySales[month].payout += payout.amount; // Sum payout
    });

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
  } else if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc: Record<string, any>, key) => {
      const value = data[key];

      // Check if value is a Date and leave it as is
      if (value instanceof Date) {
        acc[key] = value;
      }
      // Check if value is a Prisma Decimal and convert it
      else if (value && typeof value === 'object' && 'toNumber' in value) {
        acc[key] = value.toNumber();
      } else {
        acc[key] = convertDecimalsToNumbers(value);
      }
      return acc;
    }, {});
  }
  return data;
}

export const totalRevenue = (orders: any): number => {
  return orders.reduce((acc: any, order: any) => {
    return (
      acc +
      order.orderItems.reduce((itemAcc: any, item: any) => {
        return (
          itemAcc +
          (typeof item.productAmount === "object" &&
          "toNumber" in item.productAmount
            ? item.productAmount.toNumber()
            : parseFloat(item.productAmount as any) || 0)
        );
      }, 0)
    );
  }, 0);
};
