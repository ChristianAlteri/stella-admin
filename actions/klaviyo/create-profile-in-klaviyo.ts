import axios from 'axios';

export async function createProfileInKlaviyo(name: string, email: string) {
  const apiKey = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;

  if (!apiKey) {
    throw new Error('Klaviyo API key is not set');
  }

  let data = JSON.stringify({
    data: {
      type: "profile",
      attributes: {
        email: email,
        first_name: name,
      },
      properties: {
        newKey: "New Value",
      },
    },
  });

  const options = {
    method: 'post',
    maxBodyLength: Infinity, 
    url: 'https://a.klaviyo.com/api/profiles/',
    headers: {
      Revision: '2024-06-15',
      'Content-Type': 'application/json',
      Authorization: `Klaviyo-API-Key ${apiKey}`  
    },
    data: data
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error("Error posting user to Klaviyo list", error);
    throw error;  
  }
}
