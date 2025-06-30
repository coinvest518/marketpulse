import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Brain, 
  Search, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

type Page = 'dashboard' | 'ai-analysis' | 'keywords' | 'reports' | 'settings';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function DashboardLayout({ children, currentPage, onPageChange }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      // User will be automatically redirected to landing page by auth state change
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: BarChart3 },
    { id: 'ai-analysis' as Page, label: 'AI Analysis', icon: Brain },
    { id: 'keywords' as Page, label: 'Keywords', icon: Search },
    { id: 'reports' as Page, label: 'Reports', icon: FileText },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  const getPageTitle = (page: Page) => {
    const titles = {
      dashboard: 'Dashboard',
      'ai-analysis': 'AI Analysis',
      keywords: 'Keywords',
      reports: 'Reports',
      settings: 'Settings'
    };
    return titles[page];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300 backdrop-blur-xl bg-black/20 border-r border-white/10 flex flex-col`}>
        {/* Logo/Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  SentimentAI
                </h1>
                <p className="text-xs text-gray-400">Market Research Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    onClick={() => onPageChange(item.id)}
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    } backdrop-blur-sm rounded-xl border border-transparent hover:border-white/20 transition-all duration-300`}
                  >
                    <Icon className={`${sidebarOpen ? 'w-5 h-5 mr-3' : 'w-5 h-5'}`} />
                    {sidebarOpen && item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/20 rounded-xl"
          >
            <LogOut className={`${sidebarOpen ? 'w-4 h-4 mr-3' : 'w-4 h-4'}`} />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 backdrop-blur-xl bg-black/10 border-b border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <h2 className="text-xl font-semibold text-white">
              {getPageTitle(currentPage)}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Welcome back, {user?.firstName}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}