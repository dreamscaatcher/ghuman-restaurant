"use client";

import * as React from "react";
import { Button } from "@mui/material";

import { useCart } from "../../components/providers/CartProvider";

type Props = {
  id: string;
  name: string;
  price: number;
  photoUrl?: string | null;
};

export function AddToCartButton({ id, name, price, photoUrl }: Props) {
  const { addItem } = useCart();

  const handleClick = React.useCallback(() => {
    addItem({ id, name, price, photoUrl });
  }, [addItem, id, name, photoUrl, price]);

  return (
    <Button variant="contained" color="primary" onClick={handleClick} size="large">
      Add to cart
    </Button>
  );
}
