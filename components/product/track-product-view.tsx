"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/components/product/recently-viewed";

export default function TrackProductView({
  slug,
  name,
  price,
  image,
}: {
  slug: string;
  name: string;
  price: number;
  image: string | undefined;
}) {
  useEffect(() => {
    trackRecentlyViewed({ slug, name, price, image });
  }, [slug, name, price, image]);

  return null;
}
