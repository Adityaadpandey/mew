'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bell,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  User,
  Zap,
  Mail,
  Building2,
  LogOut,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const [isSaving, setIsSaving] = useState(false)
  
  // Profile settings
  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [projectUpdates, setProjectUpdates] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  
  // Appearance settings
  const [compactMode, setCompactMode] = useState(false)
  const [showAvatars, setShowAvatars] = useState(true)
  
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
    }
  }, [session])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className={cn("min-h-screen relative overflow-hidden", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#E85002]/10 to-[#F16001]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#C10801]/10 to-[#E85002]/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Header */}
      <div className={cn(
        "border-b px-6 py-4 backdrop-blur-sm relative z-10",
        isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-white/80 border-slate-200"
      )}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2 hover:gap-3 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                Settings
              </h1>
              <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                Manage your account and preferences
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className={cn(
            "grid w-full grid-cols-5 h-auto p-1",
            isDark ? "bg-neutral-900/50 backdrop-blur-xl" : "bg-white/50 backdrop-blur-xl"
          )}>
            <TabsTrigger value="profile" className="gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 py-3">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2 py-3">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                "backdrop-blur-xl",
                isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-slate-200"
              )}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white" : ""}>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-[#E85002]/20">
                      <AvatarImage src={session?.user?.image || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-[#C10801] to-[#F16001] text-white text-2xl">
                        {session?.user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className={cn("font-semibold mb-1", isDark ? "text-white" : "text-slate-900")}>
                        Profile Picture
                      </h3>
                      <p className={cn("text-sm mb-3", isDark ? "text-neutral-400" : "text-slate-600")}>
                        Upload a new profile picture or remove the current one
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className={isDark ? "border-neutral-700" : ""}>
                          Upload New
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className={isDark ? "bg-neutral-800" : ""} />

                  {/* Form Fields */}
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className={isDark ? "text-neutral-300" : ""}>
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className={cn(
                          "h-11",
                          isDark ? "bg-neutral-800/50 border-neutral-700" : ""
                        )}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email" className={isDark ? "text-neutral-300" : ""}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={cn(
                          "h-11",
                          isDark ? "bg-neutral-800/50 border-neutral-700" : ""
                        )}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bio" className={isDark ? "text-neutral-300" : ""}>
                        Bio
                      </Label>
                      <textarea
                        id="bio"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className={cn(
                          "flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "border-input bg-background"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                "backdrop-blur-xl",
                isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-slate-200"
              )}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white" : ""}>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified about updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-start gap-3">
                        <Mail className={cn("h-5 w-5 mt-0.5", isDark ? "text-neutral-400" : "text-slate-500")} />
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                            Email Notifications
                          </h4>
                          <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                            Receive email updates about your account activity
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-start gap-3">
                        <Bell className={cn("h-5 w-5 mt-0.5", isDark ? "text-neutral-400" : "text-slate-500")} />
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                            Task Reminders
                          </h4>
                          <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                            Get notified about upcoming task deadlines
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={taskReminders}
                        onCheckedChange={setTaskReminders}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-start gap-3">
                        <Building2 className={cn("h-5 w-5 mt-0.5", isDark ? "text-neutral-400" : "text-slate-500")} />
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                            Project Updates
                          </h4>
                          <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                            Stay informed about changes in your projects
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={projectUpdates}
                        onCheckedChange={setProjectUpdates}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-start gap-3">
                        <Globe className={cn("h-5 w-5 mt-0.5", isDark ? "text-neutral-400" : "text-slate-500")} />
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                            Weekly Digest
                          </h4>
                          <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                            Receive a weekly summary of your activity
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={weeklyDigest}
                        onCheckedChange={setWeeklyDigest}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                "backdrop-blur-xl",
                isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-slate-200"
              )}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white" : ""}>Appearance Settings</CardTitle>
                  <CardDescription>Customize how the app looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className={cn("font-medium mb-4", isDark ? "text-white" : "text-slate-900")}>
                      Theme
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          resolvedTheme === 'light'
                            ? "border-[#E85002] bg-[#E85002]/5"
                            : isDark ? "border-neutral-700 hover:border-neutral-600" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="h-16 w-full rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <Sun className="h-8 w-8 text-amber-500" />
                        </div>
                        <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                          Light
                        </span>
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          resolvedTheme === 'dark'
                            ? "border-[#E85002] bg-[#E85002]/5"
                            : isDark ? "border-neutral-700 hover:border-neutral-600" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="h-16 w-full rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                          <Moon className="h-8 w-8 text-blue-400" />
                        </div>
                        <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                          Dark
                        </span>
                      </button>

                      <button
                        onClick={() => setTheme('system')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          resolvedTheme !== 'light' && resolvedTheme !== 'dark'
                            ? "border-[#E85002] bg-[#E85002]/5"
                            : isDark ? "border-neutral-700 hover:border-neutral-600" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="h-16 w-full rounded-lg bg-gradient-to-r from-white to-neutral-900 border border-slate-300 flex items-center justify-center">
                          <Zap className="h-8 w-8 text-[#E85002]" />
                        </div>
                        <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                          System
                        </span>
                      </button>
                    </div>
                  </div>

                  <Separator className={isDark ? "bg-neutral-800" : ""} />

                  <div className="space-y-4">
                    <h4 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                      Display Options
                    </h4>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div>
                        <h5 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                          Compact Mode
                        </h5>
                        <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                          Reduce spacing for a more condensed view
                        </p>
                      </div>
                      <Switch
                        checked={compactMode}
                        onCheckedChange={setCompactMode}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div>
                        <h5 className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                          Show Avatars
                        </h5>
                        <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                          Display user avatars throughout the app
                        </p>
                      </div>
                      <Switch
                        checked={showAvatars}
                        onCheckedChange={setShowAvatars}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className={cn(
                "backdrop-blur-xl",
                isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-slate-200"
              )}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white" : ""}>Password & Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password" className={isDark ? "text-neutral-300" : ""}>
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        className={cn(
                          "h-11",
                          isDark ? "bg-neutral-800/50 border-neutral-700" : ""
                        )}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="new-password" className={isDark ? "text-neutral-300" : ""}>
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className={cn(
                          "h-11",
                          isDark ? "bg-neutral-800/50 border-neutral-700" : ""
                        )}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password" className={isDark ? "text-neutral-300" : ""}>
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className={cn(
                          "h-11",
                          isDark ? "bg-neutral-800/50 border-neutral-700" : ""
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]">
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "backdrop-blur-xl",
                isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-slate-200"
              )}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </CardTitle>
                  <CardDescription>Sign out from your account on this device</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className={cn(
                      "w-full sm:w-auto",
                      isDark ? "border-neutral-700 hover:bg-neutral-800" : ""
                    )}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              <Card className={cn(
                "backdrop-blur-xl border-red-500/20",
                isDark ? "bg-red-950/20" : "bg-red-50/50"
              )}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2 text-red-500")}>
                    <AlertCircle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                "backdrop-blur-xl",
                isDark ? "bg-neutral-900/90 border-neutral-800" : "bg-white/90 border-slate-200"
              )}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white" : ""}>Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className={cn("h-12 w-12 mx-auto mb-4", isDark ? "text-neutral-600" : "text-slate-400")} />
                    <p className={cn("text-sm mb-4", isDark ? "text-neutral-400" : "text-slate-600")}>
                      View detailed billing information and manage your subscription
                    </p>
                    <Button
                      onClick={() => router.push('/settings/billing')}
                      className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]"
                    >
                      Go to Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
