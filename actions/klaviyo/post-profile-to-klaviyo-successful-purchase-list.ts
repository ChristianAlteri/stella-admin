import axios from "axios";

export async function postUserToKlaviyoSuccessfulPurchaseList(
  name: string,
  email: string,
  phoneNumber: string,
  profileId: string,
  listId: string
) {
  const apiKey = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;

  let data = JSON.stringify({
    data: [
      {
        type: "profile",
        id: profileId,
        attributes: {
          email_address: email,
          first_name: name,
          phone_number: phoneNumber
        },
      },
    ],
  });

  const options = {
    method: "post",
    url: `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`,
    headers: {
      accept: "application/json",
      revision: "2024-06-15",
      "content-type": "application/json",
      Authorization: `Klaviyo-API-Key ${apiKey}`,
    },

    data: data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error("Error posting user to Klaviyo list", error);
    return null;
  }
}
