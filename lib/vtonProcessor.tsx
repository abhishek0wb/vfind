"use server";

import { GoogleGenAI, Modality } from "@google/genai";

export async function vtonProcessor(personImage: string, clothImage: string) {

  const apiKey = process.env.GOOGLE_API_KEY as string;
  const genAI = new GoogleGenAI({ apiKey });
  console.log("api", "t" + apiKey + "t");

  const prompt = "Generate a photorealistic image of the person wearing the clothing item.";
  // const prompt = "make the person in the first image wear the apparel of the second image. Do not change anything else in the image. Make it photorealistic."
  // const prompt = "outpaint the first image of the person to a fulll body shot, and make them wear the appearl/colthing item in the second image. Do not change the person's face, prreserve identity like beird tatoos etc."
  // const prompt = "Swap the face of the person in the second image to the face of the person in the first image. Do not change anything else in the image."
  // const prompt = "You are a virtual try-on assistant. The first image is a person with a plain background. Replace the background with a solid white or light gray color. Then, using the second image (a clothing item), generate a new image of the person wearing that clothing item. Make sure the new clothing fits naturally on the person, follows realistic folds, lighting, and alignment. Do not change the person's face, pose, or body shape. Keep the result clean, sharp, and as photorealistic as possible."

  const contents = [
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: personImage.split(",")[1], // remove base64 header
      },
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: clothImage.split(",")[1],
      },
    },
  ];

  try {
    console.log("vtonprocessor fired");
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = await response.candidates;


    if (!candidates || !candidates.length || !candidates[0].content) {
      throw new Error("No valid content returned from Gemini model.");
    }

    console.log(candidates);

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data,
        };
      }
    }

    throw new Error("No image was returned in the response.");
  } catch (error: any) {
    console.error("VTON Error:", error);
    throw new Error(`Failed to generate virtual try-on image: ${error.message}`);
  }
}
