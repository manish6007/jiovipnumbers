import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { profile } = await getCurrentUser();
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
