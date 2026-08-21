import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "@/app/admin/actions";
import ProductForm from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Product · Admin",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl">New product</h1>
      <div className="mt-8">
        <ProductForm action={createProductAction} categories={categories} submitLabel="Create product" />
      </div>
    </div>
  );
}
