import KeywordMonitor from "@/components/keyword-monitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, TrendingUp } from "lucide-react";

export default function KeywordsContent() {
  return (
    <div className="p-6 space-y-6">
      {/* Keyword Monitor Component */}
      <KeywordMonitor />

      {/* Monitoring Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Search</h3>
              <p className="text-gray-400 text-sm">
                Monitor mentions across news sites, social media, and blogs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Alerts</h3>
              <p className="text-gray-400 text-sm">
                Get notified when sentiment changes or volume spikes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Trend Analysis</h3>
              <p className="text-gray-400 text-sm">
                Identify patterns and emerging topics in your keyword space
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
          <CardTitle className="text-xl font-bold text-white">Monitoring Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">0</div>
              <div className="text-sm text-gray-400">Active Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">0</div>
              <div className="text-sm text-gray-400">Total Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">0</div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">100%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}