"use client";

import * as React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import KitchenIcon from "@mui/icons-material/Kitchen";
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import {
  AppBar,
  Button,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { getNavigationForRole, type NavigationLink } from "../../config/navigation";
import { useRole } from "../providers/RoleProvider";
import { RoleSwitcher } from "./RoleSwitcher";

type NavigationItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const ICON_MAP = {
  customer: <RestaurantMenuIcon fontSize="small" />,
  dashboard: <DashboardIcon fontSize="small" />,
  kitchen: <KitchenIcon fontSize="small" />,
  home: <HomeIcon fontSize="small" />,
} as const;

function mapNavigationItems(items: NavigationLink[]): NavigationItem[] {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon ? ICON_MAP[item.icon] : undefined,
  }));
}

type AppShellProps = {
  children: React.ReactNode;
  links?: NavigationItem[];
};

const DRAWER_WIDTH = 240;

export function AppShell({ children, links }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const { role } = useRole();

  const navigationLinks = React.useMemo(() => {
    if (links && links.length > 0) {
      return links;
    }

    return mapNavigationItems(getNavigationForRole(role));
  }, [links, role]);

  const showNavigation = role !== "customer" && navigationLinks.length > 0;

  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawerContent = (
    <Box sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h6" component="div">
          Ghuman Restaurant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Control Center
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {navigationLinks.map((item) => {
          const selected = pathname === item.href;

          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, mx: 1, my: 0.5 }}
            >
              {item.icon ? (
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              ) : null}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected ? 600 : undefined,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Staff access coming soon.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          backdropFilter: "blur(18px)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 2, justifyContent: "space-between", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {showNavigation && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer}
                aria-label="open navigation"
                sx={{ display: { md: "none", xs: "inline-flex" } }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" component="div">
                Ghuman Restaurant
              </Typography>
            </Box>
          </Box>

          {isDesktop && showNavigation && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
              {navigationLinks.map((item) => {
                const selected = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    color={selected ? "primary" : "inherit"}
                    variant={selected ? "contained" : "text"}
                    size="small"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          )}

          {role !== "customer" && <RoleSwitcher />}
        </Toolbar>
      </AppBar>

      {showNavigation && (
        <Box
          component="nav"
          sx={{ display: { xs: "block", md: "none" } }}
          aria-label="primary navigation"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
                borderRight: 1,
                borderColor: "divider",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, px: { xs: 2, md: 6 }, py: { xs: 4, md: 6 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
