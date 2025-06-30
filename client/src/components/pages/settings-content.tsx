import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Bell, 
  Shield, 
  Database,
  Key,
} from "lucide-react";

type Settings = {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weeklyReport: boolean;
    instantAlerts: boolean;
  };
  privacy: {
    profilePublic: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  monitoring: {
    autoGenerate: boolean;
    frequency: string;
    sentimentThreshold: number;
    volumeThreshold: number;
  };
  display: {
    theme: string;
    language: string;
    timezone: string;
  };
};

type SettingsCategory = keyof Settings;

export default function SettingsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      weeklyReport: true,
      instantAlerts: true,
    },
    privacy: {
      profilePublic: false,
      dataSharing: false,
      analytics: true,
    },
    monitoring: {
      autoGenerate: true,
      frequency: 'daily',
      sentimentThreshold: 0.7,
      volumeThreshold: 50,
    },
    display: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
    }
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  const handleSettingChange = (
    category: SettingsCategory,
    key: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader className="border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xl">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300 text-sm">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={user?.firstName || ''}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-300 text-sm">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={user?.lastName || ''}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ''}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Push Notifications</Label>
                    <p className="text-sm text-gray-400">Browser notifications for alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Weekly Reports</Label>
                    <p className="text-sm text-gray-400">Automated weekly summary</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReport}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReport', checked)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Instant Alerts</Label>
                    <p className="text-sm text-gray-400">Real-time sentiment changes</p>
                  </div>
                  <Switch
                    checked={settings.notifications.instantAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'instantAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Settings */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Generate Reports</Label>
                    <p className="text-sm text-gray-400">Automatically create daily reports</p>
                  </div>
                  <Switch
                    checked={settings.monitoring.autoGenerate}
                    onCheckedChange={(checked) => handleSettingChange('monitoring', 'autoGenerate', checked)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div>
                  <Label className="text-white text-sm">Sentiment Alert Threshold</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.monitoring.sentimentThreshold}
                    onChange={(e) => handleSettingChange('monitoring', 'sentimentThreshold', parseFloat(e.target.value))}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Trigger alerts when sentiment drops below this value</p>
                </div>
                <div>
                  <Label className="text-white text-sm">Volume Alert Threshold</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.monitoring.volumeThreshold}
                    onChange={(e) => handleSettingChange('monitoring', 'volumeThreshold', parseInt(e.target.value))}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Trigger alerts when mention volume exceeds this number</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Analytics Tracking</Label>
                    <p className="text-sm text-gray-400">Help improve our service with usage analytics</p>
                  </div>
                  <Switch
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'analytics', checked)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Data Sharing</Label>
                    <p className="text-sm text-gray-400">Share anonymized insights for research</p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataSharing}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'dataSharing', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-white">OpenAI GPT-4o</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-white">Tavily Search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-white">Mem0 Memory</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-white">CopilotKit</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  All API services are configured and operational. Contact support for configuration changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white px-8 py-3 rounded-xl"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}