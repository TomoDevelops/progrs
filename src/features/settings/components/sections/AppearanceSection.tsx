"use client";

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import { toast } from 'sonner'
import { Monitor, Moon, Sun, Palette } from 'lucide-react'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  compactMode: boolean
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  sidebarCollapsed: boolean
}

interface AppearanceSectionProps {
  id?: string;
  ref?: React.Ref<HTMLElement>;
}

export const AppearanceSection = React.forwardRef<HTMLElement, AppearanceSectionProps>(
  ({ id }, ref) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'system',
    colorScheme: 'blue',
    compactMode: false,
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    sidebarCollapsed: false
  })
  const [originalSettings, setOriginalSettings] = useState<AppearanceSettings>(appearanceSettings)

  useEffect(() => {
    fetchAppearanceSettings()
  }, [])

  const fetchAppearanceSettings = async () => {
    try {
      const response = await fetch('/api/me/settings')
      if (response.ok) {
        const data = await response.json()
        const settings = {
          theme: data.theme || 'system',
          colorScheme: data.colorScheme || 'blue',
          compactMode: data.compactMode || false,
          reducedMotion: data.reducedMotion || false,
          highContrast: data.highContrast || false,
          fontSize: data.fontSize || 'medium',
          sidebarCollapsed: data.sidebarCollapsed || false
        }
        setAppearanceSettings(settings)
        setOriginalSettings(settings)
      }
    } catch (error) {
      console.error('Failed to fetch appearance settings:', error)
      toast.error('Failed to load appearance settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/me/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearanceSettings)
      })

      if (response.ok) {
        setOriginalSettings(appearanceSettings)
        setIsEditing(false)
        toast.success('Appearance settings updated successfully')
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to update appearance settings:', error)
      toast.error('Failed to update appearance settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setAppearanceSettings(originalSettings)
    setIsEditing(false)
  }

  const handleSettingChange = (key: keyof AppearanceSettings, value: string | boolean) => {
    setAppearanceSettings(prev => ({ ...prev, [key]: value }))
    if (!isEditing) setIsEditing(true)
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      case 'system': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <section ref={ref} id={id} className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance & Accessibility
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Theme, colors, fonts, and accessibility options
            </p>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section ref={ref} id={id} className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance & Accessibility
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Theme, colors, fonts, and accessibility options
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Theme</h4>
            <Select
              value={appearanceSettings.theme}
              onValueChange={(value) => handleSettingChange('theme', value as AppearanceSettings['theme'])}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {getThemeIcon(appearanceSettings.theme)}
                    <span className="capitalize">{appearanceSettings.theme}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Color Scheme */}
          <div className="space-y-3">
            <h4 className="font-medium">Color Scheme</h4>
            <Select
              value={appearanceSettings.colorScheme}
              onValueChange={(value) => handleSettingChange('colorScheme', value as AppearanceSettings['colorScheme'])}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${appearanceSettings.colorScheme}-500`}></div>
                    <span className="capitalize">{appearanceSettings.colorScheme}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Blue
                  </div>
                </SelectItem>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Green
                  </div>
                </SelectItem>
                <SelectItem value="purple">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Purple
                  </div>
                </SelectItem>
                <SelectItem value="orange">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    Orange
                  </div>
                </SelectItem>
                <SelectItem value="red">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Red
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <h4 className="font-medium">Font Size</h4>
            <Select
              value={appearanceSettings.fontSize}
              onValueChange={(value) => handleSettingChange('fontSize', value as AppearanceSettings['fontSize'])}
            >
              <SelectTrigger>
                <SelectValue>
                  <span className="capitalize">{appearanceSettings.fontSize}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Display Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Display Options</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing and padding for a denser layout
                </p>
              </div>
              <Switch
                checked={appearanceSettings.compactMode}
                onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Collapsed Sidebar</Label>
                <p className="text-xs text-muted-foreground">
                  Start with sidebar collapsed by default
                </p>
              </div>
              <Switch
                checked={appearanceSettings.sidebarCollapsed}
                onCheckedChange={(checked) => handleSettingChange('sidebarCollapsed', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Accessibility Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Accessibility</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Reduced Motion</Label>
                  <Badge variant="secondary" className="text-xs">A11Y</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                checked={appearanceSettings.reducedMotion}
                onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">High Contrast</Label>
                  <Badge variant="secondary" className="text-xs">A11Y</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                checked={appearanceSettings.highContrast}
                onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <>
              <Separator />
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
});

AppearanceSection.displayName = "AppearanceSection";