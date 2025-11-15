import { Card, CardContent, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";

import { getSafeServerSession } from "../../lib/session";
import { getCustomerById } from "../../services/users";
import { ProfileForm } from "./_components/ProfileForm";
import { ProfileActions } from "./_components/ProfileActions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSafeServerSession();
  if (!session?.user?.id) {
    redirect("/login?redirect=/profile");
  }

  const profile = await getCustomerById(session.user.id);
  if (!profile) {
    redirect("/register");
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography component="h1" variant="h4" fontWeight={700}>
          {profile.name.split(" ")[0] ? `${profile.name.split(" ")[0]}'s Profile` : "Your profile"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your pickup details so the kitchen can recognise your order.
        </Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <ProfileActions />
    </Stack>
  );
}
