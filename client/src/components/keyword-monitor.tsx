import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function KeywordMonitor() {
  const [keyword, setKeyword] = useState("");
  const { toast } = useToast();

  const addKeywordMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const response = await apiRequest("POST", "/api/keywords", { keyword });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/sentiment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/trending"] });
      setKeyword("");
      toast({
        title: "Success",
        description: "Keyword monitoring started successfully",
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
        title: "Error",
        description: "Failed to start monitoring keyword",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      addKeywordMutation.mutate(keyword.trim());
    }
  };

  return (
    <div className="mb-8">
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-crypto-purple/10 to-crypto-accent/10">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-accent bg-clip-text text-transparent">
            Monitor New Brand
          </CardTitle>
          <p className="text-gray-400">Start tracking sentiment for any brand or keyword</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              type="text"
              placeholder="Enter brand or keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 focus:ring-crypto-accent focus:border-crypto-accent text-white placeholder-gray-400 rounded-xl backdrop-blur-sm"
            />
            <Button
              type="submit"
              disabled={addKeywordMutation.isPending || !keyword.trim()}
              className="bg-gradient-to-r from-crypto-purple to-crypto-accent hover:from-crypto-accent hover:to-crypto-cyan transition-all duration-300 px-8 rounded-xl border border-white/20 group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              {addKeywordMutation.isPending ? "Starting..." : "Start Monitoring"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
