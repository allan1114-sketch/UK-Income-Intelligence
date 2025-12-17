
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TaxRates } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetch UK tax rates for a specific year using Search Grounding.
 */
export async function fetchCurrentTaxRates(year: string): Promise<TaxRates> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Fetch the official UK income tax bands, personal allowance, and National Insurance (Employee Class 1) rates for the ${year} tax year. Return only a valid JSON object.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let rawJson = {};
  try {
    rawJson = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.warn(`Failed to parse JSON for ${year}, using defaults`, error);
  }

  const sourceUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  // Default values for 24/25 as baseline
  const defaults: Partial<TaxRates> = {
    personalAllowance: 12570,
    basicRateThreshold: 50270,
    higherRateThreshold: 125140,
    additionalRateThreshold: 125140,
    basicRate: 0.20,
    higherRate: 0.40,
    additionalRate: 0.45,
    niThreshold: 12570,
    niRate: year === '2023/24' ? 0.12 : 0.08, // Adjusting for actual historically changing NI rates
    niUpperLimit: 50270,
    niUpperRate: 0.02,
  };

  return {
    ...defaults,
    ...rawJson,
    lastUpdated: new Date().toLocaleDateString(),
    sourceUrls: sourceUrls as any,
  } as TaxRates;
}

/**
 * Get a fast summary of the tax situation.
 */
export async function getFastSummary(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: prompt,
  });
  return response.text || "Summary unavailable.";
}

/**
 * Chat functionality using Gemini Pro for complex queries.
 */
export async function sendChatMessage(history: { role: string; parts: { text: string }[] }[], message: string) {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history as any,
    config: {
      systemInstruction: 'You are an expert UK Tax advisor. Provide helpful, accurate information about UK taxes, National Insurance, pensions, and student loans. Always clarify that you are an AI.',
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
