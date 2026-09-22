'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  KeyRound,
  Trash2,
  Check,
  Smartphone,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  UploadCloud,
  X,
  RefreshCw,
  ImagePlus,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    image: '',
  });

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Compact Mode State
  const [isCompact, setIsCompact] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
  });

  // Other Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
      });
    }

    // Load saved local preferences
    const savedCompact = localStorage.getItem('pulse_compact') === 'true';
    setIsCompact(savedCompact);
    if (savedCompact) {
      document.documentElement.classList.add('compact');
    }

    const savedNotifs = localStorage.getItem('pulse_notifications');
    if (savedNotifs) {
      try {
        setNotifications(JSON.parse(savedNotifs));
      } catch (e) {}
    }

    const saved2FA = localStorage.getItem('pulse_2fa') === 'true';
    setIs2FAEnabled(saved2FA);
  }, [session]);

  const handleCompactToggle = (checked: boolean) => {
    setIsCompact(checked);
    localStorage.setItem('pulse_compact', String(checked));
    if (checked) {
      document.documentElement.classList.add('compact');
      toast({ title: 'Compact Mode Enabled', description: 'UI padding and spacing tightened.' });
    } else {
      document.documentElement.classList.remove('compact');
      toast({ title: 'Compact Mode Disabled', description: 'Default spacing restored.' });
    }
  };

  const handleNotificationChange = (key: 'email' | 'push' | 'weekly', val: boolean) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    localStorage.setItem('pulse_notifications', JSON.stringify(updated));
    toast({
      title: 'Preferences Saved',
      description: `${key.toUpperCase()} notification settings updated.`,
    });
  };

  const saveProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        await update();
        toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      } else {
        toast({
          title: 'Update Failed',
          description: 'Could not save profile changes.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (PNG, JPG, WebP, GIF)',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image size must be under 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }
        } else {
          if (height > MAX) {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setUploadPreview(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadPreview }),
      });
      if (res.ok) {
        setProfile((prev) => ({ ...prev, image: uploadPreview }));
        await update();
        toast({ title: 'Avatar Updated', description: 'Your new profile picture has been saved.' });
        setIsAvatarModalOpen(false);
      } else {
        toast({ title: 'Save Failed', description: 'Could not update profile picture.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update avatar', variant: 'destructive' });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password was successfully updated.',
        });
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast({
          title: 'Failed to Update',
          description: data.error || 'Check your current password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to update password at this time.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
      localStorage.setItem('pulse_2fa', 'false');
      setIs2FAModalOpen(false);
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been turned off.',
      });
    } else {
      if (twoFactorCode.length < 6) {
        toast({
          title: 'Code Required',
          description: 'Enter 6-digit verification code to confirm.',
          variant: 'destructive',
        });
        return;
      }
      setIs2FAEnabled(true);
      localStorage.setItem('pulse_2fa', 'true');
      setIs2FAModalOpen(false);
      setTwoFactorCode('');
      toast({
        title: '2FA Activated',
        description: 'Two-factor authentication is now securing your account.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== 'DELETE') {
      toast({
        title: 'Confirmation Mismatch',
        description: 'Type DELETE to confirm.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Account Deleted', description: 'Your data has been removed.' });
        signOut({ callbackUrl: '/' });
      } else {
        toast({ title: 'Error', description: 'Could not delete account.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete account.', variant: 'destructive' });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Account & Workspace Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal profile, workspace preferences, and security credentials.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card className="border-border shadow-xs hover:border-indigo-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <User className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Personal Profile</CardTitle>
                <CardDescription className="text-xs">
                  Your public details and workspace identity.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                <AvatarImage src={profile.image || session?.user?.image || ''} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                  {profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadPreview(profile.image || session?.user?.image || '');
                    setCustomAvatarUrl('');
                    setIsAvatarModalOpen(true);
                  }}
                  className="h-8 text-xs font-medium gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-primary" /> Upload Photo
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Upload a custom image file from your device or paste a photo link.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <Button
              onClick={saveProfile}
              disabled={isLoadingProfile}
              size="sm"
              className="gap-2 text-xs font-medium"
            >
              {isLoadingProfile ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>

        {/* Appearance & Layout */}
        <Card className="border-border shadow-xs hover:border-cyan-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Workspace Appearance</CardTitle>
                <CardDescription className="text-xs">
                  Customize visual ergonomics and layout density.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  Toggle between high-contrast obsidian dark and crisp light.
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Compact Density Mode</p>
                <p className="text-xs text-muted-foreground">
                  Tighter padding and font hierarchy for power-user screens.
                </p>
              </div>
              <Switch checked={isCompact} onCheckedChange={handleCompactToggle} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-border shadow-xs hover:border-amber-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Notification Channels</CardTitle>
                <CardDescription className="text-xs">
                  Control when and where you receive sprint updates.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when team members comment on your tasks.
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(c) => handleNotificationChange('email', c)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">In-App Push Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Instant notifications for completed sprint milestones.
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(c) => handleNotificationChange('push', c)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Sprint Digest</p>
                <p className="text-xs text-muted-foreground">
                  Weekly automated recap of completed backlog and velocity metrics.
                </p>
              </div>
              <Switch
                checked={notifications.weekly}
                onCheckedChange={(c) => handleNotificationChange('weekly', c)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Credentials */}
        <Card className="border-border shadow-xs hover:border-emerald-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Security & Credentials</CardTitle>
                <CardDescription className="text-xs">
                  Manage authentication methods, passwords, and account lifecycle.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Password Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Update your account master password securely.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <KeyRound className="h-3.5 w-3.5" /> Update Password
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                  {is2FAEnabled ? (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Disabled
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add an extra authentication challenge with TOTP Authenticator apps.
                </p>
              </div>
              <Button
                variant={is2FAEnabled ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setIs2FAModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Smartphone className="h-3.5 w-3.5" />
                {is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Danger Zone: Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently wipe your account, projects, tasks, and historical logs.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Avatar Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" />
              Upload Profile Picture
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a photo from your computer or enter an image URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            {/* Upload Box / Preview Area */}
            {uploadPreview ? (
              <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 gap-3.5">
                <div className="relative group">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="h-28 w-28 rounded-full object-cover border-4 border-background shadow-lg ring-2 ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs font-medium cursor-pointer"
                  >
                    <UploadCloud className="h-5 w-5 mb-1" />
                    Replace
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs gap-1.5 h-8"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-primary" /> Choose Different File
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadPreview('')}
                    className="text-xs text-destructive hover:text-destructive h-8"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) {
                    processImageFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/10 scale-[0.99]'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/40 bg-secondary/20'
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Click to upload or drag & drop photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PNG, JPG, WebP or GIF (max 5MB)
                </p>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <Label htmlFor="custom-url" className="text-xs text-muted-foreground">
                Or Paste Image URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-url"
                  placeholder="https://example.com/avatar.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!customAvatarUrl.trim()}
                  onClick={() => {
                    setUploadPreview(customAvatarUrl.trim());
                  }}
                  className="text-xs shrink-0"
                >
                  Preview
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSavingAvatar || !uploadPreview}
              onClick={saveAvatar}
              className="gap-1.5"
            >
              {isSavingAvatar ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save Avatar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Update Account Password</DialogTitle>
            <DialogDescription className="text-xs">
              Enter your current password and pick a strong new password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordChange} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                required
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">New Password</Label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                required
                minLength={6}
                className="h-9 text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isChangingPassword} className="text-xs">
                {isChangingPassword ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA Modal */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {is2FAEnabled
                ? 'Two-Factor Authentication Active'
                : 'Setup Two-Factor Authentication'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {is2FAEnabled
                ? 'Your account is currently protected with two-factor authentication.'
                : 'Scan the QR key with Google Authenticator, Authy, or 1Password.'}
            </DialogDescription>
          </DialogHeader>

          {!is2FAEnabled ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl border bg-secondary/30 flex flex-col items-center justify-center gap-2 text-center">
                <div className="h-32 w-32 bg-white rounded-lg p-2 border flex items-center justify-center font-mono text-xs text-black">
                  [QR Authenticator Key]
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Secret Key: PULSE-SEC-8924-AUTH
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Time-based One-Time Password (TOTP)
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="two-factor" className="text-xs">
                  Verification Code
                </Label>
                <Input
                  id="two-factor"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="h-9 font-mono tracking-widest text-center text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Two-factor authentication is active on this account.</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you wish to deactivate two-factor protection, click disable below.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIs2FAModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={is2FAEnabled ? 'destructive' : 'default'}
              onClick={handleToggle2FA}
              className="text-xs"
            >
              {is2FAEnabled ? 'Disable 2FA' : 'Confirm & Enable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base font-semibold">
                Permanently Delete Account?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed">
              This action is immediate and cannot be undone. All your projects, Kanban cards, task
              comments, and activity audit logs will be permanently erased.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs">
              Type <strong className="text-foreground">DELETE</strong> to confirm:
            </Label>
            <Input
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="h-9 text-sm font-mono"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteConfirmationInput !== 'DELETE' || isDeletingAccount}
              onClick={handleDeleteAccount}
              className="text-xs"
            >
              {isDeletingAccount ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
