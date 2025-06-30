import fetch from 'node-fetch';

export interface CopilotAnalysis {
  insights: string[];
  recommendations: string[];
  reasoning: string;
  confidence: number;
}

export interface CopilotResponse {
  response: string;
  suggestions: string[];
  actions: string[];
}

export class CopilotKitService {
  private apiKey = process.env.COPILOTKIT_API_KEY;
  private baseUrl = 'https://api.copilotkit.ai/v1';

  async analyzeMarketData(data: {
    mentions: Array<{ content: string; sentiment: string; source: string }>;
    keyword: string;
    timeframe: string;
  }): Promise<CopilotAnalysis> {
    if (!this.apiKey) {
      console.warn('CopilotKit API key not configured');
      throw new Error('CopilotKit API key not configured');
    }

    try {
      const payload = {
        messages: [
          {
            role: 'system',
            content: 'You are an AI market research analyst. Analyze data and provide insights in JSON format.'
          },
          {
            role: 'user',
            content: `Analyze market research data for "${data.keyword}":

Mentions (${data.mentions.length} total):
${data.mentions.slice(0, 10).map((m, i) => `${i+1}. [${m.source}] ${m.sentiment}: ${m.content.substring(0, 200)}...`).join('\n')}

Provide insights[], recommendations[], reasoning, and confidence (0-1) in JSON format.`
          }
        ],
        model: 'gpt-4',
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CopilotKit API error: ${response.status} - ${errorText}`);
        throw new Error(`CopilotKit API error: ${response.status}`);
      }

      const result = await response.json() as { choices: { message: { content: string } }[] };
      const content = result.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return {
          insights: [content.substring(0, 500)],
          recommendations: ["Detailed analysis available in raw response"],
          reasoning: "CopilotKit provided analysis but format parsing failed",
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('Error analyzing market data with CopilotKit:', error);
      throw error;
    }
  }

  async copilotAssist(query: string, context: {
    userHistory?: any[];
    currentData?: any;
    preferences?: any;
  }): Promise<CopilotResponse> {
    if (!this.apiKey) {
      console.warn('CopilotKit API key not configured');
      throw new Error('CopilotKit API key not configured');
    }

    try {
      const payload = {
        messages: [
          {
            role: 'system',
            content: 'You are an AI copilot for a market research platform. Provide helpful, actionable responses with suggestions and next steps. Always respond in JSON format.'
          },
          {
            role: 'user',
            content: `User Query: "${query}"

Context:
- User has ${context.userHistory?.length || 0} previous interactions
- Current data: ${JSON.stringify(context.currentData || {}).substring(0, 300)}
- User preferences: ${JSON.stringify(context.preferences || {}).substring(0, 200)}

Provide: response (direct answer), suggestions[] (helpful next steps), actions[] (platform actions they can take)`
          }
        ],
        model: 'gpt-4',
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CopilotKit API error: ${response.status} - ${errorText}`);
        throw new Error(`CopilotKit API error: ${response.status}`);
      }

      const result = await response.json() as { choices: { message: { content: string } }[] };
      const content = result.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        // Fallback response
        return {
          response: content.substring(0, 500),
          suggestions: ["Try rephrasing your question", "Check the dashboard for updates"],
          actions: ["View recent mentions", "Generate new report"]
        };
      }
    } catch (error) {
      console.error('Error with CopilotKit:', error);
      throw error;
    }
  }

  async generateAdvancedReport(data: {
    keyword: string;
    mentions: any[];
    sentimentStats: any;
    timeframe: string;
  }): Promise<{
    summary: string;
    keyFindings: string[];
    strategicRecommendations: string[];
    riskAssessment: string;
    opportunities: string[];
  }> {
    if (!this.apiKey) {
      console.warn('Claude API key not configured');
      throw new Error('Claude API key not configured');
    }

    try {
      const prompt = `Generate an advanced market research report for "${data.keyword}":

Data Summary:
- Total mentions: ${data.mentions.length}
- Sentiment distribution: ${JSON.stringify(data.sentimentStats)}
- Timeframe: ${data.timeframe}
- Sample mentions: ${data.mentions.slice(0, 5).map(m => `[${m.source}] ${m.content.substring(0, 100)}`).join('; ')}

Create a comprehensive report with:
1. Executive summary
2. Key findings (3-5 bullet points)
3. Strategic recommendations for brand management
4. Risk assessment and mitigation strategies
5. Growth opportunities identified

Respond in JSON format with: summary, keyFindings[], strategicRecommendations[], riskAssessment, opportunities[]`;

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Claude API error: ${response.status} - ${errorText}`);
        throw new Error(`Claude API error: ${response.status}`);
      }

      const result = await response.json() as { content: { text: string }[] };
      const content = result.content[0].text;
      
      try {
        return JSON.parse(content);
      } catch {
        // Fallback response
        return {
          summary: content.substring(0, 500),
          keyFindings: ["Advanced analysis completed", "Detailed insights available"],
          strategicRecommendations: ["Continue monitoring brand mentions", "Implement sentiment tracking"],
          riskAssessment: "Standard market risks apply",
          opportunities: ["Expand monitoring scope", "Enhance engagement strategies"]
        };
      }
    } catch (error) {
      console.error('Error generating advanced report with Claude:', error);
      throw error;
    }
  }
}

export const copilotKitService = new CopilotKitService();