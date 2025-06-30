import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TestIntegration from "@/components/test-integration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Search, 
  Plus, 
  Smile, 
  Frown, 
  Meh, 
  BarChart3,
  Bell,
  Settings,
  FileText,
  Send
} from "lucide-react";
import ChatInterface from "@/components/chat-interface";
import SentimentChart from "@/components/sentiment-chart";
import KeywordMonitor from "@/components/keyword-monitor";
import RecentMentions from "@/components/recent-mentions";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState("");

  // Define the type for sentiment stats
  type SentimentStats = {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };

  // Fetch dashboard data
  const { data: sentimentStats, isLoading: statsLoading } = useQuery<SentimentStats>({
    queryKey: ["/api/analytics/sentiment"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: keywords, isLoading: keywordsLoading } = useQuery({
    queryKey: ["/api/keywords"],
    enabled: !!user,
  });

  const { data: mentions, isLoading: mentionsLoading } = useQuery({
    queryKey: ["/api/mentions"],
    enabled: !!user,
  });

  const { data: trendingKeywords } = useQuery({
    queryKey: ["/api/analytics/trending"],
    enabled: !!user,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      setChatInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      chatMutation.mutate(chatInput.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-r from-crypto-accent to-crypto-violet rounded-full flex items-center justify-center animate-pulse">
          <Brain className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  // Calculate sentiment percentages
  const total = sentimentStats?.total || 1;
  const positivePercent = ((sentimentStats?.positive || 0) / total) * 100;
  const negativePercent = ((sentimentStats?.negative || 0) / total) * 100;
  const neutralPercent = ((sentimentStats?.neutral || 0) / total) * 100;

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      {/* Header */}
      <header className="backdrop-blur-xl bg-crypto-surface/80 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-crypto-purple via-crypto-accent to-crypto-cyan rounded-xl flex items-center justify-center relative group">
              <Brain className="w-7 h-7 text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-crypto-purple via-crypto-accent to-crypto-cyan rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-crypto-purple via-crypto-accent to-crypto-cyan bg-clip-text text-transparent">
                SentimentAI
              </h1>
              <p className="text-sm text-gray-400">AI-Powered Market Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Bell className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                {user && user.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-crypto-cyan to-crypto-violet">
                    {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium">
                {user?.firstName || user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 backdrop-blur-xl bg-crypto-surface/80 h-screen sticky top-0 border-r border-white/10">
          <nav className="p-6">
            <ul className="space-y-3">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-r from-crypto-purple to-crypto-accent text-white hover:from-crypto-accent hover:to-crypto-cyan transition-all duration-300 rounded-xl border border-white/20"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/ai-analysis'}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl border border-transparent hover:border-white/20 transition-all duration-300"
                >
                  <Brain className="w-5 h-5 mr-3" />
                  AI Analysis
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/keywords'}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl border border-transparent hover:border-white/20 transition-all duration-300"
                >
                  <Search className="w-5 h-5 mr-3" />
                  Keywords
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/reports'}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl border border-transparent hover:border-white/20 transition-all duration-300"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Reports
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/settings'}
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl border border-transparent hover:border-white/20 transition-all duration-300"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Market Sentiment Dashboard</h2>
            <p className="text-gray-400">Real-time brand monitoring and sentiment analysis</p>
          </div>

          {/* Keyword Monitor */}
          <KeywordMonitor />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-crypto-success/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-crypto-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Positive Sentiment</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {positivePercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-crypto-success font-medium">
                      {sentimentStats?.positive || 0} mentions
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-crypto-success to-crypto-cyan rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Smile className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-crypto-error/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-crypto-error/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Negative Sentiment</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {negativePercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-crypto-error font-medium">
                      {sentimentStats?.negative || 0} mentions
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-crypto-error to-crypto-pink rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Frown className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-crypto-warning/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-crypto-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Neutral Sentiment</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {neutralPercent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-crypto-warning font-medium">
                      {sentimentStats?.neutral || 0} mentions
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-crypto-warning to-crypto-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Meh className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-crypto-cyan/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-crypto-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Mentions</p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {sentimentStats?.total || 0}
                    </p>
                    <p className="text-xs text-crypto-cyan font-medium">All time</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-crypto-cyan to-crypto-blue rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sentiment Chart */}
            <div className="lg:col-span-2">
              <SentimentChart />
            </div>

            {/* Top Keywords */}
            <Card className="bg-crypto-surface border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Trending Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Array.isArray(trendingKeywords) ? trendingKeywords : []).slice(0, 5).map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{keyword.keyword}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-crypto-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-crypto-success to-crypto-accent"
                            style={{ width: `${Math.min(100, keyword.sentimentScore * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {keyword.mentionCount}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(trendingKeywords) || trendingKeywords.length === 0) && (
                    <p className="text-gray-400 text-sm">No trending keywords yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Mentions */}
            <RecentMentions />

            {/* AI Chat Interface */}
            <ChatInterface />
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-crypto-accent to-crypto-violet hover:scale-110 transition-transform animate-pulse-glow"
        onClick={() => {
          const chatInput = document.querySelector('input[placeholder*="Ask me anything"]') as HTMLInputElement;
          if (chatInput) {
            chatInput.focus();
            chatInput.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    </div>
  );
}
