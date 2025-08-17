import SettingsLayout from "@/components/View/settings/SettingsLayout";
import { getUserDetails } from "@/components/Models/settings/userModel";
import { auth } from "@/app/(dashboard-screens)/auth";

export default async function SettingsPage() {
  const session = await auth();

  // Always use getUserDetails for all user types
  const userResponse = await getUserDetails();

  return (
    <SettingsLayout
      userData={userResponse.data}
      loading={false}
      error={!userResponse.success ? userResponse.message : null}
    />
  );
}
