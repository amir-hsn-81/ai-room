import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = "AIzaSyBA_e9bIQ-OLuvEXMNAQxtZ31NB8LRiLFI";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateTryOnImage(
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

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: personImageBase64,
              mimeType: personImageMimeType,
            },
          },
          {
            inlineData: {
              data: itemImageBase64,
              mimeType: itemImageMimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    // The response can contain multiple parts, we need to find the image part.
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    
    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
}