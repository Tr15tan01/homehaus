import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- admin bootstrap ----------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@homehaus.example";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Store Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      cart: { create: {} },
    },
  });
  console.log(`Admin ready: ${admin.email} (password: ${adminPassword})`);

  // ---------- categories ----------
  const categoryDefs = [
    { slug: "lighting", name: "Lighting", group: "DECOR" as const },
    { slug: "textiles", name: "Textiles & Throws", group: "DECOR" as const },
    { slug: "ceramics", name: "Ceramics & Vases", group: "DECOR" as const },
    { slug: "storage", name: "Storage & Organization", group: "DECOR" as const },
    { slug: "smart-lighting", name: "Smart Lighting", group: "SMART_HOME" as const },
    { slug: "smart-climate", name: "Smart Climate", group: "SMART_HOME" as const },
    { slug: "smart-security", name: "Smart Security", group: "SMART_HOME" as const },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = category.id;
  }

  // ---------- products ----------
  type SeedProduct = {
    slug: string;
    name: string;
    shortDescription: string;
    description: string;
    category: string;
    group: "DECOR" | "SMART_HOME";
    room: string[];
    basePrice: number;
    compareAtPrice?: number;
    images: string[];
    materials?: string[];
    smartFeatures?: string[];
    featured?: boolean;
    variants: { name: string; attributes: Record<string, string>; priceDelta?: number; stock: number }[];
  };

  const products: SeedProduct[] = [
    {
      slug: "linden-ceramic-table-lamp",
      name: "Linden Ceramic Table Lamp",
      shortDescription: "Hand-thrown ceramic base with a linen shade.",
      description:
        "A softly imperfect ceramic base, glazed in a warm sand tone, paired with a natural linen shade. Warm-white bulb included.",
      category: "lighting",
      group: "DECOR",
      room: ["LIVING_ROOM", "BEDROOM"],
      basePrice: 8900,
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80"],
      materials: ["Ceramic", "Linen", "Oak"],
      featured: true,
      variants: [
        { name: "Sand", attributes: { color: "Sand" }, stock: 24 },
        { name: "Clay", attributes: { color: "Clay" }, priceDelta: 500, stock: 12 },
      ],
    },
    {
      slug: "haven-smart-table-lamp",
      name: "Haven Smart Table Lamp",
      shortDescription: "Looks like ceramic decor. Dims, schedules, and syncs like a smart device.",
      description:
        "Same hand-finished ceramic silhouette as our Linden lamp, with app-controlled dimming, warm-to-cool tuning, and Matter compatibility hidden inside. No hub required.",
      category: "smart-lighting",
      group: "SMART_HOME",
      room: ["LIVING_ROOM", "BEDROOM", "OFFICE"],
      basePrice: 12900,
      images: ["https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200&q=80"],
      materials: ["Ceramic", "Linen"],
      smartFeatures: ["Matter compatible", "App dimming", "Schedules", "No hub required"],
      featured: true,
      variants: [
        { name: "Sand", attributes: { color: "Sand" }, stock: 18 },
      ],
    },
    {
      slug: "wren-woven-throw",
      name: "Wren Woven Throw",
      shortDescription: "Heavyweight cotton-wool throw, woven in a subtle herringbone.",
      description:
        "A substantial throw in a soft herringbone weave, in undyed natural wool and cotton. Gets softer with every wash.",
      category: "textiles",
      group: "DECOR",
      room: ["LIVING_ROOM", "BEDROOM"],
      basePrice: 6800,
      images: ["https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1200&q=80"],
      materials: ["Wool", "Cotton"],
      variants: [
        { name: "Oatmeal", attributes: { color: "Oatmeal" }, stock: 40 },
        { name: "Moss", attributes: { color: "Moss" }, stock: 22 },
      ],
    },
    {
      slug: "arden-stoneware-vase-set",
      name: "Arden Stoneware Vase Set",
      shortDescription: "Set of three stoneware vases in varying heights.",
      description:
        "Three stoneware vessels, each thrown individually, in a matte glaze that catches light differently through the day.",
      category: "ceramics",
      group: "DECOR",
      room: ["LIVING_ROOM", "ENTRYWAY", "KITCHEN"],
      basePrice: 7400,
      compareAtPrice: 8900,
      images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=1200&q=80"],
      materials: ["Stoneware"],
      featured: true,
      variants: [{ name: "Set of 3", attributes: {}, stock: 30 }],
    },
    {
      slug: "kettle-smart-plug-duo",
      name: "Kettle Smart Plug (Set of 2)",
      shortDescription: "A smart plug shaped like a smooth river stone, not a plastic brick.",
      description:
        "Schedule lamps, control them by voice, or check they're off from your phone — without a beige plastic block hanging off your outlet.",
      category: "smart-lighting",
      group: "SMART_HOME",
      room: ["LIVING_ROOM", "BEDROOM", "OFFICE", "WHOLE_HOME"],
      basePrice: 4900,
      images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80"],
      materials: ["Recycled aluminum"],
      smartFeatures: ["Matter compatible", "Voice control", "Energy monitoring"],
      variants: [{ name: "Set of 2", attributes: {}, stock: 50 }],
    },
    {
      slug: "birch-woven-storage-baskets",
      name: "Birch Woven Storage Baskets",
      shortDescription: "Nesting set of three seagrass baskets.",
      description:
        "Hand-woven seagrass baskets that nest for storage, sized for closets, entryways, or open shelving.",
      category: "storage",
      group: "DECOR",
      room: ["BEDROOM", "ENTRYWAY", "OFFICE"],
      basePrice: 5600,
      images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80"],
      materials: ["Seagrass"],
      variants: [{ name: "Set of 3", attributes: {}, stock: 35 }],
    },
    {
      slug: "solace-smart-thermostat",
      name: "Solace Smart Thermostat",
      shortDescription: "A brushed-brass dial that happens to learn your schedule.",
      description:
        "Physical dial control with a barely-there display, wrapped in brushed brass instead of glossy plastic. Learns your schedule after about a week.",
      category: "smart-climate",
      group: "SMART_HOME",
      room: ["WHOLE_HOME"],
      basePrice: 18900,
      images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80"],
      materials: ["Brushed brass", "Glass"],
      smartFeatures: ["Learns your schedule", "Energy reports", "App + physical control"],
      featured: true,
      variants: [{ name: "Brass", attributes: { color: "Brass" }, stock: 15 }],
    },
    {
      slug: "amara-linen-cushion-covers",
      name: "Amara Linen Cushion Covers",
      shortDescription: "Stonewashed linen covers, set of two.",
      description:
        "Softly stonewashed European linen with a relaxed drape, in a set of two 20-inch covers. Inserts sold separately.",
      category: "textiles",
      group: "DECOR",
      room: ["LIVING_ROOM", "BEDROOM"],
      basePrice: 5200,
      images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=1200&q=80"],
      materials: ["Linen"],
      variants: [
        { name: "Stone", attributes: { color: "Stone" }, stock: 28 },
        { name: "Terracotta", attributes: { color: "Terracotta" }, stock: 20 },
      ],
    },
    {
      slug: "porter-smart-doorbell",
      name: "Porter Smart Doorbell",
      shortDescription: "A brass doorbell with a camera you'd never guess was there.",
      description:
        "Cast in solid brass with a hidden discreet camera and two-way audio. Looks like the doorbell your grandparents had; behaves like the one your neighbors are jealous of.",
      category: "smart-security",
      group: "SMART_HOME",
      room: ["ENTRYWAY"],
      basePrice: 16900,
      images: ["https://images.unsplash.com/photo-1558002038-bacd0a9a1dbe?w=1200&q=80"],
      materials: ["Solid brass"],
      smartFeatures: ["1080p camera", "Two-way audio", "Motion alerts", "No subscription required for 30-day history"],
      variants: [{ name: "Brass", attributes: { color: "Brass" }, stock: 10 }],
    },
    {
      slug: "juniper-oak-shelf",
      name: "Juniper Floating Oak Shelf",
      shortDescription: "Solid oak floating shelf, hidden bracket mount.",
      description:
        "A single plank of solid oak with a hidden bracket for a clean, floating look. Ages beautifully with a natural oil finish.",
      category: "storage",
      group: "DECOR",
      room: ["LIVING_ROOM", "KITCHEN", "OFFICE"],
      basePrice: 6200,
      images: ["https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1200&q=80"],
      materials: ["Solid oak"],
      variants: [
        { name: '24"', attributes: { size: "24 inch" }, stock: 20 },
        { name: '36"', attributes: { size: "36 inch" }, priceDelta: 1500, stock: 14 },
      ],
    },
    {
      slug: "moss-air-purifier",
      name: "Moss Air Purifier",
      shortDescription: "A purifier shaped like a planter, because it doubles as one.",
      description:
        "HEPA filtration hidden inside a plaster-finish planter shell — plant a small trailing plant on top and it disappears into the room.",
      category: "smart-climate",
      group: "SMART_HOME",
      room: ["LIVING_ROOM", "BEDROOM", "OFFICE"],
      basePrice: 14900,
      images: ["https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?w=1200&q=80"],
      materials: ["Plaster composite"],
      smartFeatures: ["HEPA filtration", "Air quality sensor", "App control", "Auto mode"],
      variants: [{ name: "Plaster", attributes: {}, stock: 16 }],
    },
    {
      slug: "reed-bath-towel-set",
      name: "Reed Turkish Bath Towel Set",
      shortDescription: "Set of two Turkish cotton bath towels.",
      description:
        "Long-staple Turkish cotton, densely woven for absorbency without the bulk. Set of two bath towels.",
      category: "textiles",
      group: "DECOR",
      room: ["BATHROOM"],
      basePrice: 4400,
      images: ["https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80"],
      materials: ["Turkish cotton"],
      variants: [
        { name: "Ivory", attributes: { color: "Ivory" }, stock: 32 },
        { name: "Sage", attributes: { color: "Sage" }, stock: 25 },
      ],
    },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        categoryId: categories[p.category],
        group: p.group,
        room: p.room as never,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        materials: p.materials ?? [],
        smartFeatures: p.smartFeatures ?? [],
        status: "ACTIVE",
        featured: p.featured ?? false,
      },
    });

    for (const v of p.variants) {
      await prisma.variant.upsert({
        where: { sku: `${p.slug}-${v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
        update: {},
        create: {
          productId: created.id,
          sku: `${p.slug}-${v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: v.name,
          attributes: v.attributes,
          priceDelta: v.priceDelta ?? 0,
          stock: v.stock,
        },
      });
    }
  }

  console.log(`Seeded ${products.length} products across ${categoryDefs.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
