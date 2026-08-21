"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ReviewFormState } from "@/app/(shop)/actions";
import SubmitButton from "@/components/ui/submit-button";

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState<ReviewFormState, FormData>(
    submitReviewAction,
    undefined,
  );
  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="productId" value={productId} />

      {state?.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="rating" className="text-sm font-medium text-ink">
          Rating
        </label>
        <select
          id="rating"
          name="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1.5 block rounded-lg border border-stone bg-surface px-4 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium text-ink">
          Title (optional)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="mt-1.5 block w-full rounded-lg border border-stone bg-surface px-4 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium text-ink">
          Your review
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          rows={4}
          className="mt-1.5 block w-full rounded-lg border border-stone bg-surface px-4 py-2 text-sm"
        />
      </div>

      <SubmitButton pendingText="Submitting…">Submit review</SubmitButton>
    </form>
  );
}
