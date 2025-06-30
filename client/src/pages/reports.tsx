import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, BarChart3, Plus } from "lucide-react";

export default function Reports() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reports/generate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Generated",
        description: "Your new report is ready to view",
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
        description: "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return 'text-green-400';
    if (sentiment >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Reports
                </h1>
                <p className="text-gray-400">Automated insights and analytics reports</p>
              </div>
            </div>
            <Button
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reportsLoading ? (
            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400">Loading reports...</div>
              </CardContent>
            </Card>
          ) : reports && reports.length > 0 ? (
            reports.map((report: any) => (
              <Card key={report.id} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all duration-300">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">
                          {report.reportType === 'daily' ? 'Daily' : 'Custom'} Report
                        </CardTitle>
                        <p className="text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                      {report.reportType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{report.totalMentions}</div>
                      <div className="text-sm text-gray-400">Total Mentions</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${getSentimentColor(report.positiveSentiment)}`}>
                        {Math.round(report.positiveSentiment)}%
                      </div>
                      <div className="text-sm text-gray-400">Positive</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${getSentimentColor(100 - report.negativeSentiment)}`}>
                        {Math.round(report.negativeSentiment)}%
                      </div>
                      <div className="text-sm text-gray-400">Negative</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-300 mb-1">
                        {Math.round(report.neutralSentiment)}%
                      </div>
                      <div className="text-sm text-gray-400">Neutral</div>
                    </div>
                  </div>

                  {/* Insights */}
                  {report.insights && (
                    <div className="space-y-4">
                      {report.insights.insights && report.insights.insights.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Key Insights
                          </h4>
                          <div className="space-y-2">
                            {report.insights.insights.slice(0, 3).map((insight: string, index: number) => (
                              <div key={index} className="text-gray-300 text-sm bg-white/5 rounded-lg p-3">
                                • {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.insights.recommendations && report.insights.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {report.insights.recommendations.slice(0, 2).map((rec: string, index: number) => (
                              <div key={index} className="text-gray-300 text-sm bg-white/5 rounded-lg p-3">
                                • {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Reports Yet</h3>
                <p className="text-gray-400 mb-4">
                  Generate your first report to start tracking insights and trends
                </p>
                <Button
                  onClick={() => generateReportMutation.mutate()}
                  disabled={generateReportMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {generateReportMutation.isPending ? "Generating..." : "Generate First Report"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}