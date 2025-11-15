"use client";

import * as React from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { useCart } from "../providers/CartProvider";
import type { KitchenTicketStatus } from "../../services/menu";

const ORDER_STORAGE_KEY = "ghuman-restaurant-latest-order";

type OrderTicketSummary = {
  id: string;
  name: string;
  quantity: number;
  status: KitchenTicketStatus;
};

type RawOrderTicket = {
  id?: unknown;
  ticketId?: unknown;
  item?: { name?: unknown } | null;
  menuItem?: { name?: unknown } | null;
  quantity?: unknown;
  status?: unknown;
};

const STATUS_LABELS: Record<KitchenTicketStatus, string> = {
  queued: "Queued",
  prepping: "In Prep",
  completed: "Ready",
};

const VALID_TICKET_STATUSES = new Set<KitchenTicketStatus>(["queued", "prepping", "completed"]);

export function CartIndicator() {
  const { items, totalItems, totalPrice, clearCart, removeItem } = useCart();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [latestOrderId, setLatestOrderId] = React.useState<string | null>(null);
  const [orderTickets, setOrderTickets] = React.useState<OrderTicketSummary[]>([]);
  const [isPolling, setIsPolling] = React.useState(false);

  const open = Boolean(anchorEl);

  const persistLatestOrder = React.useCallback((orderId: string | null) => {
    if (typeof window === "undefined") return;
    if (orderId) {
      window.localStorage.setItem(ORDER_STORAGE_KEY, orderId);
    } else {
      window.localStorage.removeItem(ORDER_STORAGE_KEY);
    }
  }, []);

  const normalizeOrderTickets = React.useCallback((payload: unknown): OrderTicketSummary[] => {
    if (!Array.isArray(payload)) {
      return [];
    }
    return (payload as RawOrderTicket[])
      .map((ticket) => {
        const status = typeof ticket.status === "string" ? (ticket.status as KitchenTicketStatus) : undefined;
        if (!status || !VALID_TICKET_STATUSES.has(status)) {
          return null;
        }
        const idCandidate = ticket.id ?? ticket.ticketId;
        if (typeof idCandidate !== "string" || idCandidate.length === 0) {
          return null;
        }
        const itemName =
          (ticket.item && typeof ticket.item.name === "string" && ticket.item.name) ||
          (ticket.menuItem && typeof ticket.menuItem.name === "string" && ticket.menuItem.name) ||
          "Dish";
        return {
          id: idCandidate,
          name: itemName,
          quantity: Number(ticket.quantity) || 0,
          status,
        };
      })
      .filter((ticket): ticket is OrderTicketSummary => Boolean(ticket));
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (stored) {
      setLatestOrderId(stored);
    }
  }, []);

  React.useEffect(() => {
    if (!latestOrderId || typeof window === "undefined") {
      setOrderTickets([]);
      return;
    }

    let cancelled = false;
    const fetchStatus = async () => {
      try {
        setIsPolling(true);
        const response = await fetch(`/api/orders/${latestOrderId}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          console.warn("Failed to fetch order status", data);
          return;
        }
        setOrderTickets(normalizeOrderTickets(data?.tickets));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load order status", error);
        }
      } finally {
        if (!cancelled) {
          setIsPolling(false);
        }
      }
    };

    fetchStatus();
    const intervalId = window.setInterval(fetchStatus, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [latestOrderId, normalizeOrderTickets]);

  const handleCheckout = React.useCallback(() => {
    if (items.length === 0) {
      setFeedback({ type: "error", message: "Your cart is empty." });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setFeedback({ type: "error", message: data?.error ?? "Failed to place order." });
          return;
        }

        clearCart();
        const orderId = data?.orderId?.toString();
        if (orderId) {
          persistLatestOrder(orderId);
          setLatestOrderId(orderId);
          setOrderTickets(normalizeOrderTickets(data?.tickets));
        }
        setFeedback({
          type: "success",
          message: orderId ? `Order #${orderId} sent to the kitchen.` : "Order sent to the kitchen.",
        });
      } catch (error) {
        console.error("Checkout failed", error);
        setFeedback({ type: "error", message: "Could not submit the order." });
      }
    });
  }, [items, clearCart, startTransition, persistLatestOrder, normalizeOrderTickets]);

  const handleClearOrderTracking = React.useCallback(() => {
    persistLatestOrder(null);
    setLatestOrderId(null);
    setOrderTickets([]);
  }, [persistLatestOrder]);

  const handleViewOrder = React.useCallback(() => {
    if (!latestOrderId) return;
    setAnchorEl(null);
    router.push(`/orders/${latestOrderId}`);
  }, [latestOrderId, router]);

  const allTicketsCompleted =
    orderTickets.length > 0 && orderTickets.every((ticket) => ticket.status === "completed");

  return (
    <>
      <IconButton
        color="primary"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Shopping cart"
      >
        <Badge color="secondary" badgeContent={totalItems} overlap="circular">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 320, p: 2 } }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>
              Cart
            </Typography>
            <Button
              size="small"
              onClick={clearCart}
              disabled={totalItems === 0}
              startIcon={<DeleteSweepIcon fontSize="small" />}
            >
              Clear
            </Button>
          </Stack>
          <Divider />

          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Your cart is empty.
            </Typography>
          ) : (
            <List dense disablePadding>
              {items.map((item) => (
                <ListItem key={item.id} disableGutters>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`€${item.price.toFixed(2)} • Qty ${item.quantity}`}
                    />
                    <Button size="small" onClick={() => removeItem(item.id)}>
                      Remove
                    </Button>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}

          <Divider />
          {feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              €{totalPrice.toFixed(2)}
            </Typography>
          </Box>
          <Button variant="contained" color="primary" disabled={items.length === 0 || isPending} onClick={handleCheckout}>
            {isPending ? "Submitting..." : "Checkout"}
          </Button>

          {latestOrderId ? (
            <>
              <Divider />
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Order status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{latestOrderId}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={handleViewOrder}>
                      View
                    </Button>
                    <Button size="small" onClick={handleClearOrderTracking}>
                      Clear
                    </Button>
                  </Stack>
                </Stack>

                {orderTickets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {isPolling ? "Updating status..." : "Waiting for the kitchen to accept your order."}
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {orderTickets.map((ticket) => (
                      <Stack
                        key={ticket.id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {ticket.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty {ticket.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {STATUS_LABELS[ticket.status]}
                        </Typography>
                      </Stack>
                    ))}
                    {allTicketsCompleted ? (
                      <Alert severity="success">Your order is ready for pickup.</Alert>
                    ) : null}
                  </Stack>
                )}
              </Stack>
            </>
          ) : null}
        </Stack>
      </Popover>
    </>
  );
}
