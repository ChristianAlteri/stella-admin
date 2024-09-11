import { type ClassValue, clsx } from "clsx"
import Decimal from "decimal.js";
import { twMerge } from "tailwind-merge"

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

// Calculate Order Conversion Rate for products
export function calculateOrderConversionRate(products: { clicks: number; orders: number }[]) {
  return products.map((product) => {
    const conversionRate = product.clicks > 0 ? (product.orders / product.clicks) * 100 : 0;
    return {
      ...product,
      conversionRate: conversionRate.toFixed(2), // Return rate as a percentage
    };
  });
}

// Prepare data for Sales Performance by Product (Scatter Plot: likes vs orders or clicks vs orders)
export function getSalesPerformanceData(products: { likes: number; clicks: number; orders: number }[]) {
  return products.map((product) => ({
    likes: product.likes,
    clicks: product.clicks,
    orders: product.orders,
  }));
}

// Calculate Product Sell-Through Rate
export function calculateSellThroughRate(products: { isArchived: boolean; createdAt: Date; soldCount: number; totalStock: number }[]) {
  return products.map((product) => {
    const daysOnSale = Math.floor((new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)); // Days since listed
    const sellThroughRate = product.totalStock > 0 ? (product.soldCount / product.totalStock) * 100 : 0;
    return {
      ...product,
      daysOnSale,
      sellThroughRate: sellThroughRate.toFixed(2), // Return rate as a percentage
    };
  });
}