import prismadb from "@/lib/prismadb";

interface SellerData {
  name: string;
  totalItemsSold: number; // Track total items sold per seller per month
}

interface GraphData {
  name: string; // This represents the month
  sellers: SellerData[]; // Array to hold sellers' data for the month
}

export const getGraphTopSeller = async (storeId: string): Promise<GraphData[]> => {
  const sellersSoldItems = await prismadb.seller.findMany({
    where: {
      storeId,
    },
    include: {
      products: {
        where: {
          isArchived: true, // Assuming this means the product has been sold
        },
      },
    },
  });
  // const alternateSellersSoldItems = await prismadb.seller.findMany({
  //   where: { storeId },
  // });
  
  // const sellerTally: { [key: string]: number } = {};
  
  // alternateSellersSoldItems.forEach(seller => {
  //   sellerTally[seller.name] = (sellerTally[seller.name] || 0) + seller.soldCount;
  // });
  // console.log("alternateSellersSoldItems", alternateSellersSoldItems);
  // console.log("sellerTally", sellerTally);


  // console.log("sellersSoldItems", sellersSoldItems);

  // Object to track items sold by seller and month
  const itemsSold: { [key: string]: { [key: number]: number } } = {};

  // Accumulate sales per seller per month
  for (const seller of sellersSoldItems) {
    for (const product of seller.products) {
      const sellerName = seller.name;
      const month = new Date(product.createdAt).getMonth(); // Ensure date is correct
      if (!itemsSold[sellerName]) {
        itemsSold[sellerName] = {};
      }
      itemsSold[sellerName][month] = (itemsSold[sellerName][month] || 0) + 1;
    }
  }


  // console.log("itemsSold", itemsSold);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const graphData: GraphData[] = months.map((monthName, index) => ({
    name: monthName,
    sellers: [],
  }));

  // Populate graph data with sales info
  for (const [sellerName, salesByMonth] of Object.entries(itemsSold)) {
    for (const [month, totalItemsSold] of Object.entries(salesByMonth)) {
      const monthIndex = parseInt(month);
      // Ensure month index is within range
      if (monthIndex >= 0 && monthIndex < months.length) {
        // Create or update SellerData for the month
        let sellerEntry = graphData[monthIndex].sellers.find(seller => seller.name === sellerName);
        if (sellerEntry) {
          sellerEntry.totalItemsSold += totalItemsSold; // Update existing
        } else {
          graphData[monthIndex].sellers.push({ name: sellerName, totalItemsSold: totalItemsSold }); // Add new
        }
      }
    }
  }


  // console.log("graphData", graphData);

  return graphData; // Return the prepared graph data
};
