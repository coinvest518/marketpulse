import fetch from 'node-fetch';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilyResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  follow_up_questions?: string[];
}

export class TavilyService {
  private apiKey = process.env.TAVILY_API_KEY;
  private baseUrl = 'https://api.tavily.com';

  async searchMentions(keyword: string, maxResults = 10): Promise<TavilySearchResult[]> {
    if (!this.apiKey) {
      console.warn('Tavily API key not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          query: `"${keyword}" OR ${keyword} mention review opinion sentiment`,
          search_depth: 'advanced',
          include_answer: false,
          include_raw_content: true,
          max_results: maxResults,
          include_domains: [
            'twitter.com', 'reddit.com', 'linkedin.com', 'facebook.com',
            'news.ycombinator.com', 'medium.com', 'quora.com', 'trustpilot.com',
            'glassdoor.com', 'capterra.com', 'g2.com'
          ]
        })
      });

      if (!response.ok) {
        console.error('Tavily API error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json() as TavilyResponse;
      return data.results || [];
    } catch (error) {
      console.error('Error fetching from Tavily:', error);
      return [];
    }
  }

  async getNewsAndSocialMentions(keyword: string): Promise<TavilySearchResult[]> {
    if (!this.apiKey) {
      console.warn('Tavily API key not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          query: `${keyword} latest news social media mentions`,
          search_depth: 'advanced',
          include_answer: false,
          include_raw_content: true,
          max_results: 15,
          days: 7 // Last 7 days
        })
      });

      if (!response.ok) {
        console.error('Tavily news search error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json() as TavilyResponse;
      return data.results || [];
    } catch (error) {
      console.error('Error fetching news from Tavily:', error);
      return [];
    }
  }
}

export const tavilyService = new TavilyService();