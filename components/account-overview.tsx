"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, User, Package } from "lucide-react";
import { Marketplace } from "./marketplace";

type UserData = {
  coins: number;
  cartItems: number;
  cartTotal: number;
  purchaseItems: number;
  purchaseTotal: number;
};

interface AccountOverviewProps {
  id: string; // User ID passed as a prop
}

export function AccountOverview({ id }: AccountOverviewProps) {
  const [userData, setUserData] = useState<UserData>({
    coins: 0,
    cartItems: 0,
    cartTotal: 0,
    purchaseItems: 0,
    purchaseTotal: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("User not logged in");
        }

        const res = await fetch(`/api/marketplace?user_id=${id}`);
        const marketplaceData = await res.json();

        if (!res.ok) {
          throw new Error(marketplaceData.error || "Failed to fetch data");
        }

        const { userBalance, cartItems, purchases } = marketplaceData.data;

        const cartTotal = cartItems.reduce(
          (sum: number, item: { quantity: number; price: number }) =>
            sum + item.quantity * item.price,
          0
        );
        const purchaseTotal = purchases.reduce(
          (sum: number, purchase: { price: number }) => sum + purchase.price,
          0
        );

        setUserData({
          coins: userBalance || 0,
          cartItems: cartItems.length,
          cartTotal,
          purchaseItems: purchases.length,
          purchaseTotal,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "An unexpected error occurred");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="relative h-52 w-full overflow-hidden rounded-t-lg bg-black">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-UyJlafCvkvI4stCm8gkypp9kACO1XG.png"
              alt="Life RPG Marketplace - Isometric View"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-8">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <CardTitle className="text-2xl">My Account</CardTitle>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6" />
                  <div>
                    <p className="text-lg font-medium">My Cart</p>
                    <p className="text-base text-muted-foreground">
                      Total: {userData.cartItems} items • {userData.cartTotal} coins
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6" />
                  <div>
                    <p className="text-lg font-medium">My Purchases</p>
                    <p className="text-base text-muted-foreground">
                      Total: {userData.purchaseItems} items • {userData.purchaseTotal} coins
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Marketplace balance={userData.coins} id={id} />
    </>
  );
}
