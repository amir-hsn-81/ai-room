
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

// API Key is hardcoded as requested to ensure functionality on Vercel without environment variables.
const API_KEY = "AIzaSyBA_e9bIQ-OLuvEXMNAQxtZ31NB8LRiLFI";

if (!API_KEY) {
  throw new Error("API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function generate(
  personImageBase64: string,
  personImageMimeType: string,
  itemImageBase64: string,
  itemImageMimeType: string,
  category: string,
): Promise<string | null> {
  const model = 'gemini-2.5-flash-image-preview';
  
  let itemDescription = "item";
  let placementInstruction = "place the item from the second image onto the person in the first image.";
  
  switch(category.toLowerCase()) {
    case 'shirt':
      itemDescription = "shirt";
      placementInstruction = "dress the person in the first image with the shirt from the second image. Ensure it fits naturally on their torso.";
      break;
    case 'pants':
      itemDescription = "pants";
      placementInstruction = "dress the person in the first image with the pants from the second image. Ensure they fit naturally on their legs.";
      break;
    case 'shoes':
      itemDescription = "shoes";
      placementInstruction = "put the shoes from the second image on the person's feet in the first image.";
      break;
    case 'hair':
      itemDescription = "hairstyle";
      placementInstruction = "replace the hairstyle of the person in the first image with the one from the second image. Match the head size, angle, and blend it seamlessly with their head.";
      break;
  }

  const prompt = `
  Act as a professional virtual stylist.
  Your task is to realistically ${placementInstruction}
  - Maintain the original background, lighting, and shadows of the person's photo as much as possible.
  - The final image should be photorealistic and high-quality.
  - Adjust the ${itemDescription} to match the person's posture and body shape.
  `;
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: personImageBase64, mimeType: personImageMimeType } },
        { inlineData: { data: itemImageBase64, mimeType: itemImageMimeType } },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
  }
  
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { 
      personImageBase64, 
      personImageMimeType, 
      itemImageBase64, 
      itemImageMimeType, 
      category 
    } = req.body;

    if (!personImageBase64 || !personImageMimeType || !itemImageBase64 || !itemImageMimeType || !category) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const imageBase64 = await generate(
      personImageBase64,
      personImageMimeType,
      itemImageBase64,
      itemImageMimeType,
      category
    );

    if (imageBase64) {
      return res.status(200).json({ imageBase64 });
    } else {
      return res.status(500).json({ error: 'Image generation failed on the server.' });
    }
  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
}
