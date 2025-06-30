import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SentimentChart from "@/components/sentiment-chart";
import RecentMentions from "@/components/recent-mentions";
import ChatInterface from "@/components/chat-interface";
import { TrendingUp, Users, MessageSquare, BarChart3 } from "lucide-react";

export default function DashboardContent() {
  // Fetch dashboard data
  type SentimentStats = { positive: number; negative: number; neutral: number };
  const { data: sentimentStats } = useQuery<SentimentStats>({
    queryKey: ["/api/analytics/sentiment"],
  });

  const { data: trendingKeywords } = useQuery({
    queryKey: ["/api/analytics/trending"],
  });

  const { data: mentions } = useQuery({
    queryKey: ["/api/mentions"],
  });

  const totalMentions = Array.isArray(mentions) ? mentions.length : 0;
  const positiveSentiment = sentimentStats?.positive || 0;
  const negativeSentiment = sentimentStats?.negative || 0;
  const neutralSentiment = sentimentStats?.neutral || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Total Mentions</p>
                <p className="text-3xl font-bold text-white">{totalMentions}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Positive</p>
                <p className="text-3xl font-bold text-green-400">{positiveSentiment}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Negative</p>
                <p className="text-3xl font-bold text-red-400">{negativeSentiment}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Neutral</p>
                <p className="text-3xl font-bold text-gray-300">{neutralSentiment}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Chart */}
        <SentimentChart />

        {/* Trending Keywords */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
              Trending Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {Array.isArray(trendingKeywords) && trendingKeywords.length > 0 ? (
              <div className="space-y-4">
                {trendingKeywords.slice(0, 5).map((keyword: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white font-medium">{keyword.keyword}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">
                        {keyword.mentionCount} mentions
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${
                        keyword.sentimentScore > 0.6 ? 'bg-green-400' :
                        keyword.sentimentScore > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 font-medium mb-2">No trending keywords yet</p>
                <p className="text-sm text-gray-400">Start monitoring keywords to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Section */}
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Ask questions about your sentiment data and get instant AI-powered insights
            </p>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Ask me anything about your data..."
                className="flex-1 h-12 px-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 flex items-center space-x-2 shadow-lg">
                <span>Ask</span>
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMentions />
        <ChatInterface />
      </div>
    </div>
  );
}