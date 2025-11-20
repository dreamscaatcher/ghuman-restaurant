import Link from "next/link";
import { Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";

import { RoleGuard } from "../../components/security/RoleGuard";
import { ManagerQuickLinks } from "../_components/ManagerQuickLinks";

export const dynamic = "force-dynamic";

export default function ManagerHomePage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <Box component="main" sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Stack spacing={1.5} alignItems="center" textAlign="center">
              <Typography component="h1" variant="h3" fontWeight={700}>
                Manager workspace
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Jump to the tools you need to run the restaurant and preview the customer experience.
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="center"
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Button component={Link} href="/dashboard" variant="contained">
                Open dashboard
              </Button>
              <Button component={Link} href="/kitchen" variant="outlined">
                View kitchen queue
              </Button>
              <Button component={Link} href="/" variant="outlined">
                Customer view
              </Button>
            </Stack>

            <ManagerQuickLinks />

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Tips for managers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publish new dishes in the dashboard, monitor active tickets in the kitchen, and return here
                    anytime to switch contexts.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </RoleGuard>
  );
}
