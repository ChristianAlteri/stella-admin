import axios from "axios";

export async function postConfirmationOfSaleToSeller(
  klaviyoProfileId: string,
  email: string,
  sellerNetPayout: string,
  sellersProductData: { productId: string[]; productName: string[]; productPrice: number[] }
) {
  const apiKey = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
  let sellerSaleConfirmationPayload = JSON.stringify({
      "data": {
        "type": "event",
        "attributes": {
          "properties": {
            "sellerNetPayout": `${sellerNetPayout}`,
            "productNames": `${sellersProductData.productName.join(", ")}`,
            "productPrices": `${sellersProductData.productPrice.join(", ")}`,
          },
          "metric": {
            "data": {
              "type": "metric",
              "attributes": {
                "name": "Seller Sale Confirmation"
              }
            }
          },
          "profile": {
            "data": {
              "type": "profile",
              "id": `${klaviyoProfileId}`,
              "attributes": {
                "email": `${email}`
              }
            }
          }
        }
      }
    }
);

// console.log("sellerSaleConfirmationPayload", sellerSaleConfirmationPayload);

  const options = {
    method: "post",
    url: `https://a.klaviyo.com/api/events/`,
    headers: {
      accept: "application/json",
      revision: "2024-06-15",
      "content-type": "application/json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
    },
    data: sellerSaleConfirmationPayload,
  };

  try {
    const response = await axios(options);
    console.log("SUCCESS KLAVIYO SELLER SALE");  
    return response;
  } catch (error) {
    console.error("Error KLAVIYO SELLER SALE", error);
    return null;
  }
}
