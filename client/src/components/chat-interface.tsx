import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Brain, Send, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      setMessage("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      chatMutation.mutate(message.trim());
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl flex flex-col h-96 overflow-hidden">
      <CardHeader className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardTitle className="text-xl font-bold text-white flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span>AI Assistant</span>
        </CardTitle>
        <p className="text-gray-400">Ask questions about your sentiment data and get instant insights</p>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-64 p-6">
          <div className="space-y-4">
            {!(Array.isArray(chatHistory) && chatHistory.length > 0) ? (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-500">
                    <Brain className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm text-white">
                      Hello! I can help you analyze your sentiment data. What would you like to know?
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">AI Assistant</span>
                </div>
              </div>
            ) : (
              chatHistory.map((chat: any) => (
                <div key={chat.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex space-x-3 justify-end">
                    <div className="flex-1 max-w-xs">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg p-3">
                        <p className="text-sm text-white">{chat.message}</p>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-violet-500">
                        <User className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-500">
                        <Brain className="w-4 h-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-sm text-white whitespace-pre-wrap">{chat.response}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">AI Assistant</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Show loading if sending message */}
            {chatMutation.isPending && (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-500">
                    <Brain className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm text-white">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <Input
              type="text"
              placeholder="Ask me anything about your data..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={chatMutation.isPending || !message.trim()}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-4 py-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
