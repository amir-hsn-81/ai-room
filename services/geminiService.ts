export async function generateTryOnImage(
  personImageBase64: string,
  personImageMimeType: string,
  itemImageBase64: string,
  itemImageMimeType: string,
  category: string,
): Promise<string | null> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personImageBase64,
        personImageMimeType,
        itemImageBase64,
        itemImageMimeType,
        category,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error("API Error Response:", errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.imageBase64 || null;

  } catch (error) {
    console.error("Error calling backend API:", error);
    // The user-facing error message is handled in App.tsx, so we re-throw.
    throw error;
  }
}
