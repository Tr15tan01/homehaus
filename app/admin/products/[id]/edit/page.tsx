import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProductAction } from "@/app/admin/actions";
import ProductForm from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Edit Product · Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div>
      <h1 className="font-display text-3xl">Edit product</h1>
      <div className="mt-8">
        <ProductForm
          action={boundAction}
          categories={categories}
          submitLabel="Save changes"
          defaults={{
            name: product.name,
            nameKa: product.nameKa,
            slug: product.slug,
            shortDescription: product.shortDescription,
            shortDescriptionKa: product.shortDescriptionKa,
            description: product.description,
            descriptionKa: product.descriptionKa,
            categoryId: product.categoryId,
            group: product.group,
            room: product.room,
            basePrice: product.basePrice,
            compareAtPrice: product.compareAtPrice,
            images: product.images,
            materials: product.materials,
            materialsKa: product.materialsKa,
            smartFeatures: product.smartFeatures,
            smartFeaturesKa: product.smartFeaturesKa,
            status: product.status,
            featured: product.featured,
          }}
        />
      </div>
    </div>
  );
}
