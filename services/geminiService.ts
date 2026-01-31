
import { GoogleGenAI, Type } from "@google/genai";
import { CategoryID, ContentItem, ContentFormat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const contentSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      author: { type: Type.STRING },
      views: { type: Type.NUMBER },
      likes: { type: Type.NUMBER },
      comments: { type: Type.NUMBER },
      description: { type: Type.STRING },
      thumbnail: { type: Type.STRING },
      publishedAt: { type: Type.STRING },
    },
    required: ["id", "title", "author", "views", "likes", "comments", "description", "thumbnail"],
  },
};

export async function fetchDiscoveryContent(
  category: CategoryID,
  query: string,
  format: ContentFormat
): Promise<ContentItem[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Act as a high-authority content filter for FocusStream. 
  The user is searching for "${query}" in the category "${category}" focusing on "${format}".
  Strictly provide the TOP 10 high-value, non-distractive resources.
  Avoid clickbait, comedy, or low-quality entertainment.
  Focus on academic, professional, and verified sources.
  For each item, generate realistic engagement metrics.
  Calculate the 'High-Engagement Ratio' where ratio = (likes + comments) / views.
  Generate valid mock IDs and relevant descriptions.
  Provide a random placeholder image URL from picsum.photos for the thumbnail.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contentSchema,
      },
    });

    const items = JSON.parse(response.text || "[]");
    return items.map((item: any) => {
      const ratio = (item.likes + item.comments) / (item.views || 1);
      return {
        ...item,
        ratio,
        format,
        category,
        verified: true,
        thumbnail: `https://picsum.photos/seed/${item.id}/400/225`,
        publishedAt: item.publishedAt || new Date().toISOString()
      };
    }).sort((a: ContentItem, b: ContentItem) => b.ratio - a.ratio);
  } catch (error) {
    console.error("Error fetching discovery content:", error);
    return [];
  }
}

export async function getAIBrief(topic: string, context?: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide a concise, factual, and high-level summary of the following: "${topic}". 
  Context: ${context || 'General search'}. 
  Format: Use bullet points for key facts. Stay neutral and academic. Max 200 words.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "No brief available.";
  } catch (error) {
    console.error("Error getting AI brief:", error);
    return "Failed to generate brief.";
  }
}
