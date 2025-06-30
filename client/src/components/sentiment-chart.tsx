import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface ChartData {
  day: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export default function SentimentChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  
  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ['/api/sentiment-stats'],
    enabled: false // Disable for now since we're showing empty state
  });

  const generateChartData = (): ChartData[] => {
    // Return empty array for clean empty state
    return [];
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => d.total), 1);

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
      <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardTitle className="text-xl font-bold text-white flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <span className="text-white">Sentiment Trends</span>
            <p className="text-sm text-gray-400 font-normal">Real-time sentiment analysis over time</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium mb-2">No sentiment data available</p>
            <p className="text-gray-400 text-sm">Start monitoring keywords to see sentiment trends</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}