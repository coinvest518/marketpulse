import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Play } from "lucide-react";

interface TestResult {
  tavily: {
    status: string;
    resultCount: number;
    sample: any;
  };
  mem0: {
    status: string;
    memoryAdded: boolean;
  };
  openai: {
    status: string;
    sentiment: any;
  };
  copilotkit: {
    status: string;
    response?: string;
    error?: string;
  };
}

export default function TestIntegration() {
  const [keyword, setKeyword] = useState("OpenAI");
  const [results, setResults] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const testMutation = useMutation({
    mutationFn: async (testKeyword: string) => {
      const response = await apiRequest("POST", "/api/test-integration", { keyword: testKeyword });
      return response.json();
    },
    onSuccess: (data: TestResult) => {
      setResults(data);
      toast({
        title: "Integration Test Complete",
        description: "Check the results below",
      });
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
        title: "Test Failed",
        description: "Failed to test API integrations",
        variant: "destructive",
      });
    },
  });

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      testMutation.mutate(keyword.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  return (
    <div className="mb-8">
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-crypto-purple/10 to-crypto-accent/10">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-accent bg-clip-text text-transparent">
            Test API Integrations
          </CardTitle>
          <p className="text-gray-400">Verify that Tavily, Mem0, and OpenAI APIs are working</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleTest} className="flex space-x-4 mb-6">
            <Input
              type="text"
              placeholder="Enter test keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 focus:ring-crypto-accent focus:border-crypto-accent text-white placeholder-gray-400 rounded-xl backdrop-blur-sm"
            />
            <Button
              type="submit"
              disabled={testMutation.isPending || !keyword.trim()}
              className="bg-gradient-to-r from-crypto-purple to-crypto-accent hover:from-crypto-accent hover:to-crypto-cyan transition-all duration-300 px-8 rounded-xl border border-white/20 group"
            >
              <Play className="w-4 h-4 mr-2" />
              {testMutation.isPending ? "Testing..." : "Test APIs"}
            </Button>
          </form>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Tavily Search</h3>
                    {getStatusIcon(results.tavily.status)}
                  </div>
                  <Badge className={getStatusColor(results.tavily.status)}>
                    {results.tavily.status}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Found {results.tavily.resultCount} results
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Mem0 Memory</h3>
                    {getStatusIcon(results.mem0.status)}
                  </div>
                  <Badge className={getStatusColor(results.mem0.status)}>
                    {results.mem0.status}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Memory added: {results.mem0.memoryAdded ? 'Yes' : 'No'}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">OpenAI Analysis</h3>
                    {getStatusIcon(results.openai.status)}
                  </div>
                  <Badge className={getStatusColor(results.openai.status)}>
                    {results.openai.status}
                  </Badge>
                  {results.openai.sentiment && (
                    <p className="text-sm text-gray-400 mt-2">
                      Sentiment: {results.openai.sentiment.sentiment}
                    </p>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">CopilotKit</h3>
                    {getStatusIcon(results.copilotkit.status)}
                  </div>
                  <Badge className={getStatusColor(results.copilotkit.status)}>
                    {results.copilotkit.status}
                  </Badge>
                  {results.copilotkit.response && (
                    <p className="text-sm text-gray-400 mt-2 truncate">
                      {results.copilotkit.response}
                    </p>
                  )}
                </div>
              </div>

              {results.tavily.sample && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="font-semibold text-white mb-2">Sample Result</h4>
                  <p className="text-sm text-gray-400 mb-2">{results.tavily.sample.title}</p>
                  <p className="text-xs text-gray-500 truncate">{results.tavily.sample.url}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}