"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/app/admin/actions";
import SubmitButton from "@/components/ui/submit-button";

const ROOMS = [
  "LIVING_ROOM",
  "BEDROOM",
  "KITCHEN",
  "BATHROOM",
  "ENTRYWAY",
  "OFFICE",
  "OUTDOOR",
  "WHOLE_HOME",
] as const;

type ProductDefaults = {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string;
  group?: string;
  room?: string[];
  basePrice?: number;
  compareAtPrice?: number | null;
  images?: string[];
  materials?: string[];
  smartFeatures?: string[];
  status?: string;
  featured?: boolean;
};

export default function ProductForm({
  action,
  categories,
  defaults,
  submitLabel,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: { id: string; name: string }[];
  defaults?: ProductDefaults;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state?.error && (
        <p role="alert" className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      )}

      <Field label="Name">
        <input name="name" defaultValue={defaults?.name} required className="input" />
      </Field>

      <Field label="Slug (URL-safe, unique)">
        <input name="slug" defaultValue={defaults?.slug} required className="input" />
      </Field>

      <Field label="Short description">
        <input
          name="shortDescription"
          defaultValue={defaults?.shortDescription}
          required
          maxLength={300}
          className="input"
        />
      </Field>

      <Field label="Full description">
        <textarea
          name="description"
          defaultValue={defaults?.description}
          required
          rows={5}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select name="categoryId" defaultValue={defaults?.categoryId} required className="input">
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Group">
          <select name="group" defaultValue={defaults?.group ?? "DECOR"} required className="input">
            <option value="DECOR">Decor</option>
            <option value="SMART_HOME">Smart Home</option>
          </select>
        </Field>
      </div>

      <Field label="Rooms">
        <div className="flex flex-wrap gap-3">
          {ROOMS.map((room) => (
            <label key={room} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="room"
                value={room}
                defaultChecked={defaults?.room?.includes(room)}
              />
              {room.replace("_", " ").toLowerCase()}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (cents)">
          <input
            type="number"
            name="basePrice"
            defaultValue={defaults?.basePrice}
            required
            min={0}
            className="input"
          />
        </Field>
        <Field label="Compare-at price (cents, optional)">
          <input
            type="number"
            name="compareAtPrice"
            defaultValue={defaults?.compareAtPrice ?? undefined}
            min={0}
            className="input"
          />
        </Field>
      </div>

      <Field label="Image URLs (comma-separated)">
        <input name="images" defaultValue={defaults?.images?.join(", ")} required className="input" />
      </Field>

      <Field label="Materials (comma-separated)">
        <input name="materials" defaultValue={defaults?.materials?.join(", ")} className="input" />
      </Field>

      <Field label="Smart features (comma-separated, smart-home only)">
        <input
          name="smartFeatures"
          defaultValue={defaults?.smartFeatures?.join(", ")}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select name="status" defaultValue={defaults?.status ?? "DRAFT"} className="input">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
        <label className="mt-6 flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={defaults?.featured} />
          Featured on homepage
        </label>
      </div>

      <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-stone);
          background: var(--color-surface);
          padding: 0.55rem 0.9rem;
          font-size: 0.875rem;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}
