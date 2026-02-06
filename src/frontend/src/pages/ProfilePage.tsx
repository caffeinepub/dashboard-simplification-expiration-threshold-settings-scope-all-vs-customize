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

  // Profile fields (removed name and displayName)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [entity, setEntity] = useState('');
  const [thresholdMode, setThresholdMode] = useState<'all' | 'customize'>('all');
  const [globalThreshold, setGlobalThreshold] = useState(30);
  const [selectedBenches, setSelectedBenches] = useState<Set<string>>(new Set());
  const [benchThresholds, setBenchThresholds] = useState<Map<string, number>>(new Map());
  const [errors, setErrors] = useState<{ username?: string; email?: string; entity?: string; threshold?: string }>({});

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
      setUsername(profile.username || '');
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
      toast.success(t('profile.languageUpdated'));
    } catch (error: any) {
      toast.error(error.message || t('profile.languageUpdateFailed'));
    }
  };

  const handleSave = async () => {
    const newErrors: { username?: string; email?: string; entity?: string; threshold?: string } = {};

    if (!username.trim()) {
      newErrors.username = t('profile.usernameRequired');
    }

    if (!entity.trim()) {
      newErrors.entity = t('profile.entityRequired');
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

      // Save profile with all fields (removed name and displayName)
      await saveMutation.mutateAsync({
        userId: identity?.getPrincipal().toString() || '',
        username: username.trim(),
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

      toast.success(t('profile.saved'));
    } catch (error: any) {
      toast.error(error.message || t('profile.saveFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
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
          {t('profile.manageAccount')}
        </p>
      </div>

      {isNewProfile && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('profile.welcomeNew')} {t('profile.completeProfile')}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.information')}</CardTitle>
            <CardDescription>
              {t('profile.informationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t('profile.picture')}</Label>
              <Tabs value={avatarMode} onValueChange={(v) => setAvatarMode(v as 'predefined' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="predefined">{t('profile.predefined')}</TabsTrigger>
                  <TabsTrigger value="custom">{t('profile.customUpload')}</TabsTrigger>
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
                          {t('profile.remove')}
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t('profile.clickToUpload')}</span>
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

            <div className="space-y-2">
              <Label htmlFor="username">{t('profile.username')} *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')} *</Label>
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
              <Label htmlFor="avatarUrl">{t('profile.avatarUrl')}</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.avatarUrlDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('profile.bio')}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {t('profile.bioDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity">{t('profile.entity')} *</Label>
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
              <Label htmlFor="language">{t('profile.language')}</Label>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('profile.expirationSettings')}
            </CardTitle>
            <CardDescription>
              {t('profile.expirationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>{t('profile.thresholdMode')}</Label>
              <RadioGroup value={thresholdMode} onValueChange={(v) => setThresholdMode(v as 'all' | 'customize')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    {t('profile.allBenches')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="customize" id="customize" />
                  <Label htmlFor="customize" className="font-normal cursor-pointer">
                    {t('profile.customizeBenches')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="globalThreshold">{t('profile.globalThreshold')}</Label>
              <Input
                id="globalThreshold"
                type="number"
                min="1"
                max="365"
                value={globalThreshold}
                onChange={(e) => setGlobalThreshold(parseInt(e.target.value) || 30)}
              />
              {errors.threshold && <p className="text-sm text-destructive">{errors.threshold}</p>}
            </div>

            {thresholdMode === 'customize' && (
              <div className="space-y-4">
                <Label>{t('profile.selectBenches')}</Label>
                <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {benches.map((bench) => (
                    <div key={bench.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={bench.id}
                          checked={selectedBenches.has(bench.id)}
                          onCheckedChange={(checked) => handleBenchToggle(bench.id, checked as boolean)}
                        />
                        <Label htmlFor={bench.id} className="font-normal cursor-pointer flex-1">
                          {bench.name}
                        </Label>
                      </div>
                      {selectedBenches.has(bench.id) && (
                        <div className="ml-6 flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={benchThresholds.get(bench.id) || globalThreshold}
                            onChange={(e) => handleBenchThresholdChange(bench.id, parseInt(e.target.value) || 30)}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">days</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || updatePreferencesMutation.isPending || setProfilePictureMutation.isPending}
            size="lg"
          >
            {saveMutation.isPending || updatePreferencesMutation.isPending || setProfilePictureMutation.isPending
              ? t('profile.saving')
              : t('profile.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
