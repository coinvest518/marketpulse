import SentimentChart from "@/components/sentiment-chart";
import TestIntegration from "@/components/test-integration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, BarChart3 } from "lucide-react";

export default function AIAnalysisContent() {
  return (
    <div className="p-6 space-y-6">
      {/* API Integration Test */}
      <TestIntegration />

      {/* Sentiment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart />
        
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
          <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Analysis Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AI Models Active</span>
                <span className="text-white font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">OpenAI GPT-4o</span>
                <span className="text-green-400 text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">CopilotKit</span>
                <span className="text-green-400 text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tavily Search</span>
                <span className="text-green-400 text-sm">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mem0 Memory</span>
                <span className="text-green-400 text-sm">✓ Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Sentiment Analysis</h3>
              <p className="text-gray-400 text-sm">
                Real-time emotion detection using advanced NLP models
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trend Detection</h3>
              <p className="text-gray-400 text-sm">
                Identify emerging patterns and market trends automatically
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Insights Generation</h3>
              <p className="text-gray-400 text-sm">
                AI-powered recommendations and actionable insights
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}