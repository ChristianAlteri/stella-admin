import axios from "axios";

export async function postOrderConfirmationEmail(
  orderId: string,
  email: string | undefined | null,
  name: string | undefined | null,
  address: string | undefined | null,
  klaviyoProfileId: string,
  products: any
) {
  const apiKey = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;

  let orderConfirmationPayload = JSON.stringify({
      "data": {
        "type": "event",
        "attributes": {
          "properties": {
            "orderId": `${orderId}`,
            "Billing Address": {
              "Name": `${name}`,
              "Address": address
            },
            "Products": products
          },
          "unique_id": `${orderId}`,
          "metric": {
            "data": {
              "type": "metric",
              "attributes": {
                "name": "Order Confirmation Trigger"
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



  const options = {
    method: "post",
    url: `https://a.klaviyo.com/api/events/`,
    headers: {
      accept: "application/json",
      revision: "2024-06-15",
      "content-type": "application/json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
    },
    data: orderConfirmationPayload,
  };

  try {
    const response = await axios(options);
    // console.log("SUCCESS order confirmation", response);  
    return response;
  } catch (error) {
    console.error("Error posting order confirmation", error);
    return null;
  }
}


// {
//   "data": {
//     "type": "event",
//     "attributes": {
//       "properties": {
//         "orderId": "123456789",
//         "Billing Address": {
//           "FirstName": "Christian",
//           "LastName": "Alteri"
//         }
//       },
//       "unique_id": "123456789",
//       "metric": {
//         "data": {
//           "type": "metric",
//           "attributes": {
//             "name": "Order Confirmation Trigger"
//           }
//         }
//       },
//       "profile": {
//         "data": {
//           "type": "profile",
//           "id": "01J35TG1TTTXACK32JMVM7RVHW",
//           "attributes": {
//             "email": "alteri.christian@gmail.com"
//           }
//         }
//       }
//     }
//   }
// }