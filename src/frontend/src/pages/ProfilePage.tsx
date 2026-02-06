import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useUpdateExpirationPreferences,
  useGetAllTestBenches,
  useSetProfilePicture,
  useGetAllowedEmailDomain,
  useIsCallerAdmin,
  useGetUniqueEntities,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { validateEmailAgainstDomain } from '../utils/validation';
import { AlertCircle, User, Clock, Upload, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { ExpirationThresholdMode, ExternalBlob, ProfilePicture } from '../backend';
import { PredefinedAvatarPicker } from '../components/profile/PredefinedAvatarPicker';
import { EntityTagInput } from '../components/profile/EntityTagInput';
import { useI18n } from '../i18n/useI18n';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';

const DEFAULT_SECTIONS = ['statistics', 'charts', 'criticalComponents', 'expiringComponents', 'documents', 'quickActions'];

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const { data: benches = [] } = useGetAllTestBenches();
  const { data: allowedDomain = 'safrangroup.com' } = useGetAllowedEmailDomain();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: entitySuggestions = [] } = useGetUniqueEntities();
  const saveMutation = useSaveCallerUserProfile();
  const updatePreferencesMutation = useUpdateExpirationPreferences();
  const setProfilePictureMutation = useSetProfilePicture();
  const { t, languageTag, setLanguageTag } = useI18n();

  // Extended profile fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [entity, setEntity] = useState('');
  const [thresholdMode, setThresholdMode] = useState<'all' | 'customize'>('all');
  const [globalThreshold, setGlobalThreshold] = useState(30);
  const [selectedBenches, setSelectedBenches] = useState<Set<string>>(new Set());
  const [benchThresholds, setBenchThresholds] = useState<Map<string, number>>(new Map());
  const [errors, setErrors] = useState<{ name?: string; email?: string; entity?: string; threshold?: string }>({});

  // Avatar state
  const [avatarMode, setAvatarMode] = useState<'predefined' | 'custom'>('predefined');
  const [selectedAvatar, setSelectedAvatar] = useState('duck');
  const [customPhotoFile, setCustomPhotoFile] = useState<File | null>(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(null);
  const [uploadedCustomBlob, setUploadedCustomBlob] = useState<ExternalBlob | null>(null);

  const isNewProfile = isFetched && profile === null;

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUsername(profile.username || '');
      setDisplayName(profile.displayName || '');
      setEmail(profile.email);
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
      setEntity(profile.entity || '');
      setGlobalThreshold(Number(profile.thresholdAllBenches));
      
      if (profile.expirationThresholdMode === ExpirationThresholdMode.customizedBenches) {
        setThresholdMode('customize');
        const customBenches = new Set(profile.thresholdCustomizedBenches.map(([id]) => id));
        setSelectedBenches(customBenches);
        const thresholds = new Map(
          profile.thresholdCustomizedBenches.map(([id, threshold]) => [id, Number(threshold)])
        );
        setBenchThresholds(thresholds);
      } else {
        setThresholdMode('all');
      }

      // Initialize avatar
      const profilePicture = profile.profilePicture;
      if (profilePicture.__kind__ === 'avatar') {
        setAvatarMode('predefined');
        setSelectedAvatar(profilePicture.avatar);
      } else if (profilePicture.__kind__ === 'custom') {
        setAvatarMode('custom');
        setUploadedCustomBlob(profilePicture.custom);
        // Load custom photo preview
        const customBlob = profilePicture.custom;
        const loadCustomPhoto = async () => {
          try {
            const bytes = await customBlob.getBytes();
            const blob = new Blob([bytes], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            setCustomPhotoPreview(url);
          } catch (error) {
            console.error('Failed to load custom photo:', error);
          }
        };
        loadCustomPhoto();
      }
    }
  }, [profile]);

  const handleBenchToggle = (benchId: string, checked: boolean) => {
    const newSelected = new Set(selectedBenches);
    if (checked) {
      newSelected.add(benchId);
      if (!benchThresholds.has(benchId)) {
        setBenchThresholds(new Map(benchThresholds).set(benchId, globalThreshold));
      }
    } else {
      newSelected.delete(benchId);
    }
    setSelectedBenches(newSelected);
  };

  const handleBenchThresholdChange = (benchId: string, value: number) => {
    setBenchThresholds(new Map(benchThresholds).set(benchId, value));
  };

  const handleCustomPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  };

  const handleLanguageChange = async (newLanguageTag: string) => {
    try {
      await setLanguageTag(newLanguageTag);
      toast.success('Language updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update language');
    }
  };

  const handleSave = async () => {
    const newErrors: { name?: string; email?: string; entity?: string; threshold?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!entity.trim()) {
      newErrors.entity = 'Entity is required';
    }

    const emailError = isAdmin ? null : validateEmailAgainstDomain(email, allowedDomain);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (globalThreshold < 1 || globalThreshold > 365) {
      newErrors.threshold = 'Threshold must be between 1 and 365 days';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      // Build the new profile picture from current state
      let newProfilePicture: ProfilePicture;
      
      if (avatarMode === 'predefined') {
        newProfilePicture = { __kind__: 'avatar', avatar: selectedAvatar };
      } else if (avatarMode === 'custom') {
        if (customPhotoFile) {
          // New custom photo uploaded - convert to ExternalBlob
          const photoBytes = new Uint8Array(await customPhotoFile.arrayBuffer());
          const photoBlob = ExternalBlob.fromBytes(photoBytes);
          newProfilePicture = { __kind__: 'custom', custom: photoBlob };
          setUploadedCustomBlob(photoBlob);
          setCustomPhotoFile(null);
        } else if (uploadedCustomBlob) {
          // Use existing uploaded custom blob
          newProfilePicture = { __kind__: 'custom', custom: uploadedCustomBlob };
        } else {
          // Fallback to default avatar if no custom photo available
          newProfilePicture = { __kind__: 'avatar', avatar: 'duck' };
        }
      } else {
        // Fallback
        newProfilePicture = { __kind__: 'avatar', avatar: 'duck' };
      }

      // Save profile picture first
      await setProfilePictureMutation.mutateAsync(newProfilePicture);

      // Save profile with all fields including new ones
      await saveMutation.mutateAsync({
        userId: identity?.getPrincipal().toString() || '',
        name: name.trim(),
        username: username.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        entity: entity.trim(),
        expirationThresholdMode: profile?.expirationThresholdMode || ExpirationThresholdMode.allBenches,
        thresholdAllBenches: profile?.thresholdAllBenches || BigInt(30),
        thresholdCustomizedBenches: profile?.thresholdCustomizedBenches || [],
        dashboardSectionsOrdered: profile?.dashboardSectionsOrdered || DEFAULT_SECTIONS,
        profilePicture: newProfilePicture,
        languageTag: languageTag,
        lastSeen: profile?.lastSeen,
      });

      // Save expiration preferences
      const mode = thresholdMode === 'all' 
        ? ExpirationThresholdMode.allBenches 
        : ExpirationThresholdMode.customizedBenches;

      const customThresholds: Array<[string, bigint]> = 
        thresholdMode === 'customize'
          ? Array.from(selectedBenches).map((benchId) => [
              benchId,
              BigInt(benchThresholds.get(benchId) || globalThreshold),
            ])
          : [];

      await updatePreferencesMutation.mutateAsync({
        mode,
        thresholdAll: BigInt(globalThreshold),
        thresholdCustom: customThresholds,
      });

      toast.success('Profile and preferences saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="h-8 w-8" />
          {t('profile.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {isNewProfile && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Welcome! Please complete your profile to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your profile information is used for identification across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <Tabs value={avatarMode} onValueChange={(v) => setAvatarMode(v as 'predefined' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="predefined">Predefined</TabsTrigger>
                  <TabsTrigger value="custom">Custom Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="predefined" className="space-y-3 mt-4">
                  <PredefinedAvatarPicker selectedId={selectedAvatar} onSelect={setSelectedAvatar} />
                </TabsContent>
                <TabsContent value="custom" className="space-y-3 mt-4">
                  <div className="border-2 border-dashed rounded-lg p-6">
                    {customPhotoPreview ? (
                      <div className="space-y-3">
                        <img
                          src={customPhotoPreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-full mx-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomPhotoFile(null);
                            setCustomPhotoPreview(null);
                          }}
                          className="w-full"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomPhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear to other users
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`user@${allowedDomain}`}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Only {allowedDomain} email addresses are allowed
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Optional: External URL for your avatar image
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                A brief description about yourself
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity">Entity *</Label>
              <EntityTagInput
                value={entity}
                onChange={setEntity}
                suggestions={entitySuggestions}
              />
              {errors.entity && <p className="text-sm text-destructive">{errors.entity}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('profile.language')}
            </CardTitle>
            <CardDescription>
              {t('profile.languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={languageTag} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changes take effect immediately across the entire application
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Expiration Thresholds
            </CardTitle>
            <CardDescription>
              Configure when components are considered expiring soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={thresholdMode} onValueChange={(v) => setThresholdMode(v as 'all' | 'customize')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  Apply same threshold to all benches
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customize" id="customize" />
                <Label htmlFor="customize" className="font-normal cursor-pointer">
                  Customize threshold per bench
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="globalThreshold">
                {thresholdMode === 'all' ? 'Global Threshold (days)' : 'Default Threshold (days)'}
              </Label>
              <Input
                id="globalThreshold"
                type="number"
                min="1"
                max="365"
                value={globalThreshold}
                onChange={(e) => setGlobalThreshold(Number(e.target.value))}
              />
              {errors.threshold && <p className="text-sm text-destructive">{errors.threshold}</p>}
              <p className="text-xs text-muted-foreground">
                Components expiring within this many days will be marked as "Expiring Soon"
              </p>
            </div>

            {thresholdMode === 'customize' && (
              <div className="space-y-3 border rounded-lg p-4">
                <Label>Select Benches to Customize</Label>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {benches.map((bench) => (
                    <div key={bench.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`bench-${bench.id}`}
                          checked={selectedBenches.has(bench.id)}
                          onCheckedChange={(checked) => handleBenchToggle(bench.id, checked as boolean)}
                        />
                        <Label htmlFor={`bench-${bench.id}`} className="font-normal cursor-pointer flex-1">
                          {bench.name}
                        </Label>
                      </div>
                      {selectedBenches.has(bench.id) && (
                        <div className="ml-6 space-y-1">
                          <Label htmlFor={`threshold-${bench.id}`} className="text-xs">
                            Threshold (days)
                          </Label>
                          <Input
                            id={`threshold-${bench.id}`}
                            type="number"
                            min="1"
                            max="365"
                            value={benchThresholds.get(bench.id) || globalThreshold}
                            onChange={(e) => handleBenchThresholdChange(bench.id, Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || updatePreferencesMutation.isPending}
            size="lg"
          >
            {saveMutation.isPending || updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
