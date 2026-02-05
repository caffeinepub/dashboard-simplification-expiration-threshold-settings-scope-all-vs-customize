import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { AlertCircle, CheckCircle2, User, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExpirationThresholdMode, ExternalBlob, ProfilePicture } from '../backend';
import { PredefinedAvatarPicker } from '../components/profile/PredefinedAvatarPicker';
import { EntityTagInput } from '../components/profile/EntityTagInput';

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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
      setEmail(profile.email);
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

      // Save profile with the new profile picture
      await saveMutation.mutateAsync({
        userId: identity?.getPrincipal().toString() || '',
        name: name.trim(),
        email: email.trim(),
        entity: entity.trim(),
        expirationThresholdMode: profile?.expirationThresholdMode || ExpirationThresholdMode.allBenches,
        thresholdAllBenches: profile?.thresholdAllBenches || BigInt(30),
        thresholdCustomizedBenches: profile?.thresholdCustomizedBenches || [],
        dashboardSectionsOrdered: profile?.dashboardSectionsOrdered || DEFAULT_SECTIONS,
        profilePicture: newProfilePicture,
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          User Profile
        </h1>
        <p className="text-muted-foreground mt-1">
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your profile information is used for identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <Tabs value={avatarMode} onValueChange={(v) => setAvatarMode(v as 'predefined' | 'custom')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="predefined">Predefined</TabsTrigger>
                <TabsTrigger value="custom">Custom Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="predefined" className="space-y-3">
                <PredefinedAvatarPicker selectedId={selectedAvatar} onSelect={setSelectedAvatar} />
              </TabsContent>
              <TabsContent value="custom" className="space-y-3">
                <div className="border-2 border-dashed rounded-md p-4">
                  {customPhotoPreview ? (
                    <div className="space-y-2">
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
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="custom-photo"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={handleCustomPhotoChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('custom-photo')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo (PNG/JPEG)
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="principal">Principal ID</Label>
            <Input
              id="principal"
              value={identity?.getPrincipal().toString() || ''}
              disabled
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your unique identifier on the Internet Computer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Corporate Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`your.name@${allowedDomain}`}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Admins can use any domain' : `Must end with @${allowedDomain}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity">
              Entity <span className="text-destructive">*</span>
            </Label>
            <EntityTagInput
              value={entity}
              onChange={setEntity}
              suggestions={entitySuggestions}
              error={errors.entity}
            />
            {errors.entity && (
              <p className="text-sm text-destructive">{errors.entity}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Your team or department (e.g., T2I, IVV, Qualite, IMI, RLI)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Expiration Preferences
          </CardTitle>
          <CardDescription>
            Configure when components are considered "expiring soon"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="threshold">
              Global Threshold (days)
            </Label>
            <Input
              id="threshold"
              type="number"
              min="1"
              max="365"
              value={globalThreshold}
              onChange={(e) => setGlobalThreshold(parseInt(e.target.value) || 30)}
              className={errors.threshold ? 'border-destructive' : ''}
            />
            {errors.threshold && (
              <p className="text-sm text-destructive">{errors.threshold}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Components expiring within this many days will be highlighted (default: 30 days)
            </p>
          </div>

          <div className="space-y-4">
            <Label>Apply Threshold To</Label>
            <RadioGroup value={thresholdMode} onValueChange={(v) => setThresholdMode(v as 'all' | 'customize')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="mode-all" />
                <Label htmlFor="mode-all" className="font-normal cursor-pointer">
                  All benches
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customize" id="mode-customize" />
                <Label htmlFor="mode-customize" className="font-normal cursor-pointer">
                  Customize per bench
                </Label>
              </div>
            </RadioGroup>
          </div>

          {thresholdMode === 'customize' && (
            <div className="space-y-4 border rounded-md p-4">
              <Label>Select Benches and Set Thresholds</Label>
              {benches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No benches available</p>
              ) : (
                <div className="space-y-3">
                  {benches.map((bench) => (
                    <div key={bench.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`bench-${bench.id}`}
                          checked={selectedBenches.has(bench.id)}
                          onCheckedChange={(checked) => handleBenchToggle(bench.id, checked as boolean)}
                        />
                        <Label htmlFor={`bench-${bench.id}`} className="font-normal cursor-pointer flex-1">
                          {bench.name} {bench.agileCode && `(${bench.agileCode})`}
                        </Label>
                      </div>
                      {selectedBenches.has(bench.id) && (
                        <div className="ml-6 flex items-center gap-2">
                          <Label htmlFor={`threshold-${bench.id}`} className="text-xs">
                            Threshold:
                          </Label>
                          <Input
                            id={`threshold-${bench.id}`}
                            type="number"
                            min="1"
                            max="365"
                            value={benchThresholds.get(bench.id) || globalThreshold}
                            onChange={(e) =>
                              handleBenchThresholdChange(bench.id, parseInt(e.target.value) || 30)
                            }
                            className="w-20 h-8"
                          />
                          <span className="text-xs text-muted-foreground">days</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 pt-6">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || updatePreferencesMutation.isPending || setProfilePictureMutation.isPending}
          className="flex-1"
        >
          {(saveMutation.isPending || updatePreferencesMutation.isPending || setProfilePictureMutation.isPending) ? (
            <>Saving...</>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Profile & Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
