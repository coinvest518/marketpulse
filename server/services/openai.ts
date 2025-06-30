import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SentimentAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  reasoning: string;
}

export interface InsightGeneration {
  insights: string[];
  recommendations: string[];
  trends: string[];
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert. Analyze the sentiment of the given text and classify it as positive, negative, or neutral. Also provide a confidence score between 0 and 1, and a brief reasoning for your classification.

          Respond with JSON in this exact format: 
          {
            "sentiment": "positive|negative|neutral",
            "confidence": 0.85,
            "reasoning": "Brief explanation of why this sentiment was chosen"
          }`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      sentiment: result.sentiment || "neutral",
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      reasoning: result.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    // Fallback neutral sentiment
    return {
      sentiment: "neutral",
      confidence: 0.5,
      reasoning: "Analysis failed, defaulting to neutral",
    };
  }
}

export async function generateInsights(mentions: Array<{ content: string; sentiment: string; source: string }>): Promise<InsightGeneration> {
  try {
    const mentionsSummary = mentions.map(m => `${m.sentiment.toUpperCase()}: "${m.content}" (from ${m.source})`).join('\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a market research analyst. Based on the provided mentions, generate actionable insights, recommendations, and trend observations.

          Respond with JSON in this exact format:
          {
            "insights": ["Key insight 1", "Key insight 2"],
            "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
            "trends": ["Trend observation 1", "Trend observation 2"]
          }`,
        },
        {
          role: "user",
          content: `Analyze these brand mentions and provide insights:\n\n${mentionsSummary}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      insights: result.insights || [],
      recommendations: result.recommendations || [],
      trends: result.trends || [],
    };
  } catch (error) {
    console.error("Insight generation failed:", error);
    return {
      insights: ["Unable to generate insights at this time"],
      recommendations: ["Please try again later"],
      trends: ["No trends available"],
    };
  }
}

export async function chatWithAI(message: string, context?: any): Promise<string> {
  try {
    const contextStr = context ? `Context: ${JSON.stringify(context)}\n\n` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are SentimentAI, an AI assistant specialized in market research and sentiment analysis. You help users understand their brand perception data, sentiment trends, and provide actionable business insights. Be helpful, concise, and professional.`,
        },
        {
          role: "user",
          content: `${contextStr}${message}`,
        },
      ],
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request at the moment.";
  } catch (error) {
    console.error("Chat AI failed:", error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}
