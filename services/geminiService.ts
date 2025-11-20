import { GoogleGenAI } from "@google/genai";
import { CatReaction, GameAssets } from "../types";

// Initialize Gemini Client
// IMPORTANT: Process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameAssets = async (): Promise<GameAssets> => {
  // We generate two images with similar prompts to keep the style somewhat consistent,
  // but distinct enough to show the state change.
  
  const basePrompt = "oil painting style, low angle view from the floor, a fluffy white cat on a traditional Japanese wooden porch (engawa) with cherry blossoms in the garden background. Warm sunlight, anime art style, Studio Ghibli vibe.";
  
  const sleepingPrompt = `${basePrompt} The cat is sleeping peacefully, curled up on the floor, eyes closed, relaxed.`;
  const awakePrompt = `${basePrompt} The cat is sitting up alert, staring directly at the camera with wide intense eyes, checking for intruders.`;

  try {
    // We run these in parallel to speed up loading
    const [sleepingResp, awakeResp] = await Promise.all([
      ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: sleepingPrompt,
        config: { numberOfImages: 1, aspectRatio: '16:9' }
      }),
      ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: awakePrompt,
        config: { numberOfImages: 1, aspectRatio: '16:9' }
      })
    ]);

    const sleepingBg = `data:image/png;base64,${sleepingResp.generatedImages[0].image.imageBytes}`;
    const awakeBg = `data:image/png;base64,${awakeResp.generatedImages[0].image.imageBytes}`;

    return { sleepingBg, awakeBg };
  } catch (error) {
    console.error("Failed to generate assets:", error);
    // Fallback logic is handled in the UI or we could return placeholders here
    throw error;
  }
};

export const getCatReaction = async (
  result: 'WIN' | 'LOSS', 
  distance: number
): Promise<CatReaction> => {
  
  const modelId = "gemini-2.5-flash";
  
  let prompt = "";

  if (result === 'WIN') {
    prompt = `
      You are a lazy, sleepy, white cat sleeping on a wooden porch. 
      A little mouse just successfully snuck past you without waking you up.
      
      Generate a JSON response with two fields:
      1. "mood": A short 1-2 word mood (e.g., "Dreaming", "Blissful", "Unaware").
      2. "message": A haiku or a very short, sleepy poetic thought about what you are dreaming about, completely unaware that you lost.
    `;
  } else {
    prompt = `
      You are a lazy but sharp white cat sleeping on a wooden porch.
      You just woke up and caught a mouse trying to sneak past you. You are at ${Math.floor(distance)}% alertness.
      
      Generate a JSON response with two fields:
      1. "mood": A short 1-2 word mood (e.g., "Annoyed", "Sharp", "Hungry").
      2. "message": A short, slightly haughty or grumpy sentence scolding the sneaker for waking you up.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as CatReaction;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      mood: result === 'WIN' ? "Sleeping" : "Awake",
      message: result === 'WIN' 
        ? "Zzz... tuna... zzz..." 
        : "Did you think I wouldn't hear that?",
    };
  }
};