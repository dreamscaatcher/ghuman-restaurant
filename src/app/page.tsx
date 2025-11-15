import { Box, Card, CardActions, CardContent, CardMedia, Container, Stack, Typography, Button } from "@mui/material";

import { RoleGuard } from "../components/security/RoleGuard";
import { listMenuItems } from "../services/menu";
import { AddToCartButton } from "./_components/AddToCartButton";
import { getCustomerById } from "../services/users";
import Link from "next/link";
import { getSafeServerSession } from "../lib/session";
import { LogoutButton } from "./_components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, menuItems] = await Promise.all([getSafeServerSession(), listMenuItems()]);
  const profile = session?.user?.id ? await getCustomerById(session.user.id) : null;

  return (
    <RoleGuard allowedRoles={["customer", "manager"]}>
      <Box component="main" sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography component="h1" variant="h3" sx={{ fontWeight: 700 }}>
              {profile ? `Welcome back, ${profile.name.split(" ")[0]}!` : "Ghuman Restaurant"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile
                ? "Your favourites are ready. Place an order and we’ll notify the kitchen instantly."
                : "Join our community to save your preferences and get faster pickup at the counter."}
            </Typography>
            {profile ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Link href="/profile">
                  <Button variant="outlined">View profile</Button>
                </Link>
                <LogoutButton />
              </Stack>
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Link href="/register">
                  <Button variant="contained">Create profile</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outlined">Sign in</Button>
                </Link>
              </Stack>
            )}
          </Stack>

          <Stack spacing={3} sx={{ mt: 6 }}>
            {menuItems.length === 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1">
                    We&apos;re preparing the menu. Check back soon for new dishes.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              menuItems.map((item) => (
                <Card key={item.id} variant="outlined" sx={{ display: "flex", alignItems: "stretch" }}>
                  {item.photoUrl ? (
                    <CardMedia
                      component="img"
                      image={item.photoUrl}
                      alt={item.name}
                      sx={{ width: { xs: 140, md: 180 }, objectFit: "cover" }}
                    />
                  ) : null}
                  <CardContent sx={{ textAlign: "left" }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight={600} gutterBottom>
                      {item.price != null ? `€${item.price.toFixed(2)}` : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 3, pb: 3 }}>
                    {item.price != null ? (
                      <AddToCartButton
                        id={item.id}
                        name={item.name}
                        price={item.price}
                        photoUrl={item.photoUrl}
                      />
                    ) : null}
                  </CardActions>
                </Card>
              ))
            )}
          </Stack>
        </Container>
      </Box>
    </RoleGuard>
  );
}
