"use client";

import React, { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import { Eye, Download, Trash2, Users, BarChart3, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface PrivacySectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const PrivacySection = React.forwardRef<HTMLElement, PrivacySectionProps>(
  ({ id }, ref) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    workoutDataSharing: false,
    analyticsOptIn: true,
    marketingEmails: false,
    dataCollection: true
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSettingChange = async (key: keyof typeof privacySettings, value: string | boolean) => {
    setIsUpdating(true)
    try {
      const newSettings = { ...privacySettings, [key]: value }
      
      const response = await fetch('/api/me/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error('Failed to update privacy settings')
      }

      setPrivacySettings(newSettings)
      toast.success('Privacy settings updated')
    } catch {
      toast.error('Failed to update privacy settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/me/export-data', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'my-data-export.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Data export started')
    } catch {
      toast.error('Failed to export data')
    }
  }

  return (
    <section ref={ref} id={id} className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Privacy & Data</CardTitle>
          <p className="text-sm text-muted-foreground">
            Profile visibility, data collection, and privacy controls
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Profile Visibility
            </h4>
            <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow others to find and view your profile
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={privacySettings.profileVisibility === 'public' ? 'default' : 'secondary'}>
                    {privacySettings.profileVisibility === 'public' ? 'Public' : 'Private'}
                  </Badge>
                  <Switch
                    checked={privacySettings.profileVisibility === 'public'}
                    onCheckedChange={(checked) => 
                      handleSettingChange('profileVisibility', checked ? 'public' : 'private')
                    }
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Workout Data Sharing</Label>
                  <p className="text-xs text-muted-foreground">
                    Share your workout statistics with other users
                  </p>
                </div>
                <Switch
                  checked={privacySettings.workoutDataSharing}
                  onCheckedChange={(checked) => handleSettingChange('workoutDataSharing', checked)}
                  disabled={isUpdating}
                />
              </div>
            </div>
            </div>
          </div>

          <Separator />

          {/* Data Collection */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Data Collection
            </h4>
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics & Performance</Label>
                <p className="text-xs text-muted-foreground">
                  Help us improve the app by sharing usage analytics
                </p>
              </div>
              <Switch
                checked={privacySettings.analyticsOptIn}
                onCheckedChange={(checked) => handleSettingChange('analyticsOptIn', checked)}
                disabled={isUpdating}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Communications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive emails about new features and tips
                </p>
              </div>
              <Switch
                checked={privacySettings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                disabled={isUpdating}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Collection</Label>
                <p className="text-xs text-muted-foreground">
                  Allow collection of workout and usage data
                </p>
              </div>
              <Switch
                checked={privacySettings.dataCollection}
                onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
                disabled={isUpdating}
              />
            </div>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Data Management
            </h4>
            <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of all your data in JSON format
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDataExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Data Retention</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Workout data: Retained indefinitely unless you delete your account</p>
                  <p>• Analytics data: Anonymized after 2 years</p>
                  <p>• Account data: Deleted within 30 days of account deletion</p>
                  <p>• Backup data: Retained for 90 days after deletion</p>
                </div>
              </div>

              <Separator />

              <div className="p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Delete All Data</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanently delete all your workout data, progress, and personal information. 
                      This action cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3">
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          <Separator />

          {/* Legal & Compliance */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Legal & Compliance
            </h4>
            <div className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Terms of Service
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Cookie Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Data Processing Agreement
              </Button>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
});

PrivacySection.displayName = "PrivacySection";