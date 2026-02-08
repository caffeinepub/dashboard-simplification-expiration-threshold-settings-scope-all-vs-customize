import { useParams, Link } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '../../components/profile/UserAvatar';
import { useGetPublicUserInfo } from '../../hooks/useQueries';
import { ArrowLeft, User, Building2, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UserProfileDetailsPage() {
  const { userId } = useParams({ from: '/users/$userId' });

  // Parse the principal
  let userPrincipal: Principal | null = null;
  let parseError = false;
  try {
    userPrincipal = Principal.fromText(userId);
  } catch (error) {
    parseError = true;
  }

  const { data: userInfo, isLoading, error } = useGetPublicUserInfo(userPrincipal);

  if (parseError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/benches">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Benches
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            Invalid user ID format. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/benches">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Benches
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading user profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/benches">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Benches
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            User not found. This user may not have completed their profile setup yet.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/benches">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Benches
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <UserAvatar
              profilePicture={userInfo.profilePicture}
              name={userInfo.username}
              size="lg"
              className="h-32 w-32"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Username</span>
            </div>
            <p className="text-lg font-semibold">
              {userInfo.username || 'No username set'}
            </p>
          </div>

          {/* Entity */}
          {userInfo.entity && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>Entity</span>
              </div>
              <p className="text-lg">{userInfo.entity}</p>
            </div>
          )}

          {/* Bio */}
          {userInfo.bio && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Biography</span>
              </div>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {userInfo.bio}
              </p>
            </div>
          )}

          {/* Show message if profile is incomplete */}
          {!userInfo.username && !userInfo.entity && !userInfo.bio && (
            <Alert>
              <AlertDescription>
                This user has not completed their profile yet.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
