"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import type { OrderStatus } from "@prisma/client";

function parseListField(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type AdminFormState = { error?: string } | undefined;

export async function createProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    group: formData.get("group"),
    room: formData.getAll("room"),
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    images: parseListField(formData.get("images")),
    materials: parseListField(formData.get("materials")),
    smartFeatures: parseListField(formData.get("smartFeatures")),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: "A product with this slug already exists." };
  }

  const product = await prisma.product.create({ data: parsed.data });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProductAction(
  productId: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    group: formData.get("group"),
    room: formData.getAll("room"),
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    images: parseListField(formData.get("images")),
    materials: parseListField(formData.get("materials")),
    smartFeatures: parseListField(formData.get("smartFeatures")),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }

  await prisma.product.update({ where: { id: productId }, data: parsed.data });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  return undefined;
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status")) as OrderStatus;
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
}
