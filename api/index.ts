import express, { Request, Response, NextFunction } from "express";
import { insertKeywordSchema } from "../shared/schema";

// For Vercel deployment, some services might not be available
// Use lazy loading and fallbacks
let storage: any;
let agentService: any;
let tavilyService: any;
let mem0Service: any;

try {
    storage = (await import("../server/storage")).storage;
    agentService = (await import("../server/services/agentService")).agentService;
    tavilyService = (await import("../server/services/tavilyService")).tavilyService;
    mem0Service = (await import("../server/services/mem0Service")).mem0Service;
} catch (error) {
    console.warn("Some services failed to load:", error);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for Vercel
// In production, restrict the origin to your frontend's domain for better security.
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://your-production-domain.vercel.app'] // Replace with your actual domain
  : ['*'];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Define a custom request type that includes the userId
interface AuthenticatedRequest extends Request {
    userId?: string;
}

// Authentication Middleware
const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No valid authorization header' });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // For demo purposes, check for dev token
        if (idToken === 'dev-mock-token') {
            req.userId = 'demo-user';
            return next();
        }

        const { auth } = await import('../server/firebaseAdmin');
        const decodedToken = await auth.verifyIdToken(idToken);
        req.userId = decodedToken.uid;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
};

// Optional Authentication Middleware for public/demo routes
const optionalAuthenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token, just proceed without a userId for public access
        return next();
    }

    try {
        const idToken = authHeader.split('Bearer ')[1];

        if (idToken === 'dev-mock-token') {
            req.userId = 'demo-user';
            return next();
        }

        const { auth } = await import('../server/firebaseAdmin');
        const decodedToken = await auth.verifyIdToken(idToken);
        req.userId = decodedToken.uid;
        next();
    } catch (error) {
        // Token is present but invalid. Proceed without a user.
        next();
    }
};

app.get('/api/auth/user', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Check for demo/development token
    if (idToken === 'dev-mock-token') {
      const demoUser = {
        id: 'demo-user',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: 'https://via.placeholder.com/150'
      };
      return res.json(demoUser);
    }
    
    // Verify the Firebase ID token
    const { auth } = await import('../server/firebaseAdmin');
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create or update user in our database
    const user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      firstName: decodedToken.name?.split(' ')[0] || 'User',
      lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: decodedToken.picture || 'https://via.placeholder.com/150',
    };

    await storage.upsertUser(user);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
});

// Keyword routes
app.post('/api/keywords', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!storage) {
      return res.status(503).json({ message: "Service temporarily unavailable" });
    }
    
    // userId is now available from the middleware
    const keywordData = insertKeywordSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    const keyword = await storage.createKeyword(keywordData);
    
    // Start monitoring in the background (don't wait for completion)
    if (agentService) {
      agentService.processKeywordMonitoring(req.userId, keyword.keyword).catch(console.error);
    }
    
    res.json(keyword);
  } catch (error) {
    console.error("Error creating keyword:", error);
    res.status(400).json({ message: "Invalid keyword data or authentication failed" });
  }
});

app.get('/api/keywords', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!storage) {
      return res.json([]); // Return empty array if storage not available
    }
    
    const keywords = await storage.getUserKeywords(req.userId!);
    res.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    res.status(500).json({ message: "Failed to fetch keywords" });
  }
});

// Mention routes
app.get('/api/mentions', optionalAuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      // Return sample data for public/unauthenticated users
      return res.json([
        {
          id: 1,
          content: "This is amazing technology that's revolutionizing the industry!",
          sentiment: "positive",
          source: "Twitter",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          content: "Interesting developments in AI and machine learning.",
          sentiment: "neutral", 
          source: "LinkedIn",
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    }
    
    if (!storage) return res.status(503).json({ message: "Service temporarily unavailable" });

    const limit = parseInt(req.query.limit as string) || 10;
    const mentions = await storage.getUserMentions(req.userId, limit);
    res.json(mentions);
  } catch (error) {
    console.error("Error fetching mentions:", error);
    res.status(500).json({ message: "Failed to fetch mentions" });
  }
});
 
// This route should be authenticated to ensure users only see their own keyword mentions.
app.get('/api/mentions/keyword/:keywordId', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!storage) {
      return res.json([]); // Return empty array if storage not available
    }
    
    const keywordId = parseInt(req.params.keywordId);
    const limit = parseInt(req.query.limit as string) || 10;

    // Security Check: Verify the user owns the keyword.
    const keyword = await storage.getKeywordById(keywordId);

    // If the keyword doesn't exist or doesn't belong to the user, return 404.
    // This prevents leaking information about which keyword IDs are valid.
    if (!keyword || keyword.userId !== req.userId) {
      return res.status(404).json({ message: "Keyword not found" });
    }

    const mentions = await storage.getMentionsByKeyword(keywordId, limit);
    res.json(mentions);
  } catch (error) {
    console.error("Error fetching keyword mentions:", error);
    res.status(500).json({ message: "Failed to fetch keyword mentions" });
  }
});

// Analytics routes
app.get('/api/analytics/sentiment', optionalAuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json({
        total: 150,
        positive: 85,
        negative: 35,
        neutral: 30
      });
    }
    
    if (!storage) return res.status(503).json({ message: "Service temporarily unavailable" });

    const keywordId = req.query.keywordId ? parseInt(req.query.keywordId as string) : undefined;
    const stats = await storage.getSentimentStats(req.userId, keywordId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching sentiment stats:", error);
    res.status(500).json({ message: "Failed to fetch sentiment stats" });
  }
});
app.get('/api/analytics/trending', optionalAuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json([
        { keyword: "AI", sentimentScore: 0.8, mentionCount: 45 },
        { keyword: "Machine Learning", sentimentScore: 0.7, mentionCount: 32 },
        { keyword: "Technology", sentimentScore: 0.6, mentionCount: 28 }
      ]);
    }
    
    if (!storage) return res.status(503).json({ message: "Service temporarily unavailable" });

    const trending = await storage.getTrendingKeywords(req.userId);
    res.json(trending);
  } catch (error) {
    console.error("Error fetching trending keywords:", error);
    res.status(500).json({ message: "Failed to fetch trending keywords" });
  }
});
// Chat routes
app.post('/api/chat', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: "Message is required" });
    }
    
    const response = await agentService.processUserQuery(req.userId, message);
    res.json({ response });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ message: "Failed to process chat message" });
  }
});

app.get('/api/chat/history', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!storage) {
      return res.json([]);
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const history = await storage.getUserChatHistory(req.userId!, limit);
    res.json(history.reverse()); // Return in chronological order
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
});

// Test integration endpoint
app.post('/api/test-integration', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { keyword = "OpenAI" } = req.body;

    console.log(`Testing API integration for keyword: ${keyword}`);

    // Test Tavily API
    const tavilyResults = await tavilyService.searchMentions(keyword, 3);
    console.log(`Tavily found ${tavilyResults.length} results`);

    // Test Mem0 API
    const memoryAdded = await mem0Service.addMemory(req.userId, `Testing integration with keyword: ${keyword}`);
    console.log(`Mem0 memory added: ${memoryAdded}`);

    // Test OpenAI sentiment analysis
    let sentimentTest: any = null;
    if (tavilyResults.length > 0) {
      const { analyzeSentiment } = await import("../server/services/openai");
      sentimentTest = await analyzeSentiment(tavilyResults[0].content);
      console.log(`OpenAI sentiment analysis completed`);
    }

    res.json({
      tavily: {
        status: tavilyResults.length > 0 ? 'success' : 'no_results',
        resultCount: tavilyResults.length,
        sample: tavilyResults[0] || null
      },
      mem0: {
        status: memoryAdded ? 'success' : 'failed',
        memoryAdded
      },
      openai: {
        status: sentimentTest ? 'success' : 'no_test_data',
        sentiment: sentimentTest
      }
    });
  } catch (error) {
    console.error("Integration test failed:", error);
    res.status(500).json({ 
      message: "Integration test failed", 
      error: (error as Error).message || 'Unknown error'
    });
  }
});

// Export for Vercel serverless functions
export default app;
