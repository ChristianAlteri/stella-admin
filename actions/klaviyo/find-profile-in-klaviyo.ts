import axios from 'axios';

export async function findProfileInKlaviyo(email: string) {
  const apiKey = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;

  if (!apiKey) {
    throw new Error('Klaviyo API key is not set');
  }

  const options = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://a.klaviyo.com/api/profiles/?filter=equals(email,"${email}")`,
    headers: {
      'Revision': '2024-06-15',
      'Content-Type': 'application/json',
      'Authorization': `Klaviyo-API-Key ${apiKey}`
    }
  };

  try {
    const response = await axios(options);
    console.log("FOUND USER IN KLAVIYO", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user from Klaviyo", error);
    throw error;
  }
}
