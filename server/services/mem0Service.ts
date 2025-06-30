import fetch from 'node-fetch';

export interface MemoryData {
  id?: string;
  memory: string;
  user_id: string;
  metadata?: Record<string, any>;
}

export class Mem0Service {
  private apiKey = process.env.MEM0_API_KEY;
  private baseUrl = 'https://api.mem0.ai/v1';

  async addMemory(userId: string, memory: string, metadata?: Record<string, any>): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Mem0 API key not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/memories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: memory }],
          user_id: userId,
          metadata
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding memory to Mem0:', error);
      return false;
    }
  }

  async getUserMemories(userId: string): Promise<MemoryData[]> {
    if (!this.apiKey) {
      console.warn('Mem0 API key not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/memories/?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as { memories?: MemoryData[] };
      return data.memories || [];
    } catch (error) {
      console.error('Error fetching memories from Mem0:', error);
      return [];
    }
  }

  async searchMemories(userId: string, query: string): Promise<MemoryData[]> {
    if (!this.apiKey) {
      console.warn('Mem0 API key not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/memories/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          user_id: userId
        })
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as { memories?: MemoryData[] };
      return data.memories || [];
    } catch (error) {
      console.error('Error searching memories in Mem0:', error);
      return [];
    }
  }
}

export const mem0Service = new Mem0Service();