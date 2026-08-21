"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/(shop)/actions";
import SubmitButton from "@/components/ui/submit-button";

export default function AddToCartForm({
  productId,
  variants,
  isAuthenticated,
  nextPath,
}: {
  productId: string;
  variants: { id: string; name: string; stock: number }[];
  isAuthenticated: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");

  const selectedVariant = variants.find((v) => v.id === variantId);
  const outOfStock = variants.length > 0 && selectedVariant?.stock === 0;

  async function handleSubmit(formData: FormData) {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    await addToCartAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />

      {variants.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="variant" className="text-sm font-medium text-ink">
            Option
          </label>
          <select
            id="variant"
            name="variantId"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="w-full rounded-lg border border-stone bg-surface px-4 py-2.5 text-sm"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock === 0}>
                {v.name} {v.stock === 0 ? "— Out of stock" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <SubmitButton className="w-full" pendingText="Adding…">
        {outOfStock ? "Out of stock" : "Add to cart"}
      </SubmitButton>
    </form>
  );
}
