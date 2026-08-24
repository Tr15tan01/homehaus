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
    { slug: "lighting", name: "Lighting", nameKa: "განათება", group: "DECOR" as const },
    { slug: "textiles", name: "Textiles & Throws", nameKa: "ტექსტილი და პლედები", group: "DECOR" as const },
    { slug: "ceramics", name: "Ceramics & Vases", nameKa: "კერამიკა და ვაზები", group: "DECOR" as const },
    { slug: "storage", name: "Storage & Organization", nameKa: "შენახვა და ორგანიზება", group: "DECOR" as const },
    { slug: "smart-lighting", name: "Smart Lighting", nameKa: "ჭკვიანი განათება", group: "SMART_HOME" as const },
    { slug: "smart-climate", name: "Smart Climate", nameKa: "ჭკვიანი კლიმატი", group: "SMART_HOME" as const },
    { slug: "smart-security", name: "Smart Security", nameKa: "ჭკვიანი უსაფრთხოება", group: "SMART_HOME" as const },
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
  type SeedVariant = {
    name: string;
    nameKa?: string;
    attributes: Record<string, string>;
    priceDelta?: number;
    stock: number;
  };

  type SeedProduct = {
    slug: string;
    name: string;
    nameKa?: string;
    shortDescription: string;
    shortDescriptionKa?: string;
    description: string;
    descriptionKa?: string;
    category: string;
    group: "DECOR" | "SMART_HOME";
    room: string[];
    basePrice: number;
    compareAtPrice?: number;
    images: string[];
    materials?: string[];
    materialsKa?: string[];
    smartFeatures?: string[];
    smartFeaturesKa?: string[];
    featured?: boolean;
    variants: SeedVariant[];
  };

  const products: SeedProduct[] = [
    {
      slug: "linden-ceramic-table-lamp",
      name: "Linden Ceramic Table Lamp",
      nameKa: "ლინდენის კერამიკული სამაგიდო ლამპარი",
      shortDescription: "Hand-thrown ceramic base with a linen shade.",
      shortDescriptionKa: "ხელით ნაძერწი კერამიკული ფუძე სელის აბაჟურით.",
      description:
        "A softly imperfect ceramic base, glazed in a warm sand tone, paired with a natural linen shade. Warm-white bulb included.",
      descriptionKa:
        "რბილად არასრულყოფილი კერამიკული ფუძე, დაფარული თბილი ქვიშისფერი მოჭიქვით, ბუნებრივი სელის აბაჟურთან ერთად. კომპლექტში შედის თბილი-თეთრი ნათურა.",
      category: "lighting",
      group: "DECOR",
      room: ["LIVING_ROOM", "BEDROOM"],
      basePrice: 8900,
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80"],
      materials: ["Ceramic", "Linen", "Oak"],
      materialsKa: ["კერამიკა", "სელი", "მუხა"],
      featured: true,
      variants: [
        { name: "Sand", nameKa: "ქვიშისფერი", attributes: { color: "Sand" }, stock: 24 },
        { name: "Clay", nameKa: "თიხისფერი", attributes: { color: "Clay" }, priceDelta: 500, stock: 12 },
      ],
    },
    {
      slug: "haven-smart-table-lamp",
      name: "Haven Smart Table Lamp",
      nameKa: "Haven ჭკვიანი სამაგიდო ლამპარი",
      shortDescription: "Looks like ceramic decor. Dims, schedules, and syncs like a smart device.",
      shortDescriptionKa: "გამოიყურება როგორც კერამიკული დეკორი, მაგრამ იბინდება, იგეგმება და მუშაობს როგორც ჭკვიანი მოწყობილობა.",
      description:
        "Same hand-finished ceramic silhouette as our Linden lamp, with app-controlled dimming, warm-to-cool tuning, and Matter compatibility hidden inside. No hub required.",
      descriptionKa:
        "იგივე ხელნაკეთი კერამიკული სილუეტი, რაც ჩვენს ლინდენის ლამპარს აქვს, დამალული აპლიკაციით მართვადი ბინდვით, თბილი-ცივი ტონის რეგულირებით და Matter-თან თავსებადობით. კვანძი (hub) არ არის საჭირო.",
      category: "smart-lighting",
      group: "SMART_HOME",
      room: ["LIVING_ROOM", "BEDROOM", "OFFICE"],
      basePrice: 12900,
      images: ["https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200&q=80"],
      materials: ["Ceramic", "Linen"],
      materialsKa: ["კერამიკა", "სელი"],
      smartFeatures: ["Matter compatible", "App dimming", "Schedules", "No hub required"],
      smartFeaturesKa: ["თავსებადი Matter-თან", "ბინდვა აპლიკაციიდან", "განრიგები", "კვანძის გარეშე"],
      featured: true,
      variants: [
        { name: "Sand", nameKa: "ქვიშისფერი", attributes: { color: "Sand" }, stock: 18 },
      ],
    },
    {
      slug: "wren-woven-throw",
      name: "Wren Woven Throw",
      nameKa: "Wren-ის ნაქსოვი პლედი",
      shortDescription: "Heavyweight cotton-wool throw, woven in a subtle herringbone.",
      shortDescriptionKa: "მძიმე ბამბა-მატყლის პლედი, ნაქსოვი ნატიფი ცხვირისებრი ორნამენტით.",
      description:
        "A substantial throw in a soft herringbone weave, in undyed natural wool and cotton. Gets softer with every wash.",
      descriptionKa:
        "მყარი პლედი, ნაქსოვი რბილი ცხვირისებრი ორნამენტით, შეუღებავი ბუნებრივი მატყლისა და ბამბისგან. ყოველი რეცხვის შემდეგ უფრო რბილი ხდება.",
      category: "textiles",
      group: "DECOR",
      room: ["LIVING_ROOM", "BEDROOM"],
      basePrice: 6800,
      images: ["https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1200&q=80"],
      materials: ["Wool", "Cotton"],
      materialsKa: ["მატყლი", "ბამბა"],
      variants: [
        { name: "Oatmeal", nameKa: "შვრიისფერი", attributes: { color: "Oatmeal" }, stock: 40 },
        { name: "Moss", nameKa: "ხავერდისფერი მწვანე", attributes: { color: "Moss" }, stock: 22 },
      ],
    },
    {
      slug: "arden-stoneware-vase-set",
      name: "Arden Stoneware Vase Set",
      nameKa: "Arden-ის ქვაფქვილის ვაზების ნაკრები",
      shortDescription: "Set of three stoneware vases in varying heights.",
      shortDescriptionKa: "სამი ქვაფქვილის ვაზის ნაკრები, სხვადასხვა სიმაღლის.",
      description:
        "Three stoneware vessels, each thrown individually, in a matte glaze that catches light differently through the day.",
      descriptionKa:
        "სამი ქვაფქვილის ჭურჭელი, თითოეული ინდივიდუალურად ნაძერწი, მქრქალი მოჭიქვით, რომელიც დღის განმავლობაში სხვადასხვანაირად ითამაშებს სინათლეს.",
      category: "ceramics",
      group: "DECOR",
      room: ["LIVING_ROOM", "ENTRYWAY", "KITCHEN"],
      basePrice: 7400,
      compareAtPrice: 8900,
      images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=1200&q=80"],
      materials: ["Stoneware"],
      materialsKa: ["ქვაფქვილი"],
      featured: true,
      variants: [{ name: "Set of 3", nameKa: "3 ცალის ნაკრები", attributes: {}, stock: 30 }],
    },
    {
      slug: "kettle-smart-plug-duo",
      name: "Kettle Smart Plug (Set of 2)",
      nameKa: "Kettle ჭკვიანი როზეტი (2 ცალი)",
      shortDescription: "A smart plug shaped like a smooth river stone, not a plastic brick.",
      shortDescriptionKa: "ჭკვიანი როზეტი, ფორმით მდინარის ქვის მსგავსი — არა პლასტმასის ბლოკი.",
      description:
        "Schedule lamps, control them by voice, or check they're off from your phone — without a beige plastic block hanging off your outlet.",
      descriptionKa:
        "დაგეგმეთ ლამპრების ჩართვა, მართეთ ხმით, ან შეამოწმეთ ტელეფონიდან, ჩართულია თუ არა — ჩვეულებრივი პლასტმასის ბლოკის გარეშე, რომელიც როზეტიდან ჩამოგდებულია.",
      category: "smart-lighting",
      group: "SMART_HOME",
      room: ["LIVING_ROOM", "BEDROOM", "OFFICE", "WHOLE_HOME"],
      basePrice: 4900,
      images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80"],
      materials: ["Recycled aluminum"],
      materialsKa: ["გადამუშავებული ალუმინი"],
      smartFeatures: ["Matter compatible", "Voice control", "Energy monitoring"],
      smartFeaturesKa: ["თავსებადი Matter-თან", "ხმით მართვა", "ენერგიის მონიტორინგი"],
      variants: [{ name: "Set of 2", nameKa: "2 ცალის ნაკრები", attributes: {}, stock: 50 }],
    },
    {
      slug: "birch-woven-storage-baskets",
      name: "Birch Woven Storage Baskets",
      nameKa: "Birch-ის ნაწნავი შესანახი კალათები",
      shortDescription: "Nesting set of three seagrass baskets.",
      shortDescriptionKa: "სამი ერთმანეთში ჩალაგებადი საზღვაო ბალახის კალათა.",
      description:
        "Hand-woven seagrass baskets that nest for storage, sized for closets, entryways, or open shelving.",
      descriptionKa:
        "ხელით ნაწნავი საზღვაო ბალახის კალათები, რომლებიც ერთმანეთში იკეცება შესანახად — შესაფერისია გარდერობის, წინკარის ან ღია თაროებისთვის.",
      category: "storage",
      group: "DECOR",
      room: ["BEDROOM", "ENTRYWAY", "OFFICE"],
      basePrice: 5600,
      images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&q=80"],
      materials: ["Seagrass"],
      materialsKa: ["საზღვაო ბალახი"],
      variants: [{ name: "Set of 3", nameKa: "3 ცალის ნაკრები", attributes: {}, stock: 35 }],
    },
    {
      slug: "solace-smart-thermostat",
      name: "Solace Smart Thermostat",
      nameKa: "Solace ჭკვიანი თერმოსტატი",
      shortDescription: "A brushed-brass dial that happens to learn your schedule.",
      shortDescriptionKa: "ხახუნით დამუშავებული ბრინჯაოს დისკი, რომელიც სწავლობს თქვენს განრიგს.",
      description:
        "Physical dial control with a barely-there display, wrapped in brushed brass instead of glossy plastic. Learns your schedule after about a week.",
      descriptionKa:
        "ფიზიკური დისკური მართვა, თითქმის უხილავი ეკრანით, გარსშემოსილი ხახუნით დამუშავებული ბრინჯაოთი პრიალა პლასტმასის ნაცვლად. თქვენს განრიგს სწავლობს დაახლოებით ერთ კვირაში.",
      category: "smart-climate",
      group: "SMART_HOME",
      room: ["WHOLE_HOME"],
      basePrice: 18900,
      images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80"],
      materials: ["Brushed brass", "Glass"],
      materialsKa: ["ხახუნით დამუშავებული ბრინჯაო", "მინა"],
      smartFeatures: ["Learns your schedule", "Energy reports", "App + physical control"],
      smartFeaturesKa: ["სწავლობს თქვენს განრიგს", "ენერგიის ანგარიშები", "მართვა აპლიკაციით და ხელით"],
      featured: true,
      variants: [{ name: "Brass", nameKa: "ბრინჯაო", attributes: { color: "Brass" }, stock: 15 }],
    },
    {
      slug: "amara-linen-cushion-covers",
      name: "Amara Linen Cushion Covers",
      nameKa: "Amara-ს სელის ბალიშის გარსაცმები",
      shortDescription: "Stonewashed linen covers, set of two.",
      shortDescriptionKa: "ქვით რეცხილი სელის გარსაცმები, ორი ცალის ნაკრები.",
      description:
        "Softly stonewashed European linen with a relaxed drape, in a set of two 20-inch covers. Inserts sold separately.",
      descriptionKa:
        "რბილად ქვით რეცხილი ევროპული სელი, თავისუფალი ჩამოშვებით, ორი 20-inch გარსაცმის ნაკრებში. ბალიშის ბირთვი იყიდება ცალკე.",
      category: "textiles",
      group: "DECOR",
      room: ["LIVING_ROOM", "BEDROOM"],
      basePrice: 5200,
      images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=1200&q=80"],
      materials: ["Linen"],
      materialsKa: ["სელი"],
      variants: [
        { name: "Stone", nameKa: "ქვისფერი", attributes: { color: "Stone" }, stock: 28 },
        { name: "Terracotta", nameKa: "ტერაკოტისფერი", attributes: { color: "Terracotta" }, stock: 20 },
      ],
    },
    {
      slug: "porter-smart-doorbell",
      name: "Porter Smart Doorbell",
      nameKa: "Porter ჭკვიანი ზარი",
      shortDescription: "A brass doorbell with a camera you'd never guess was there.",
      shortDescriptionKa: "ბრინჯაოს კარის ზარი კამერით, რომლის არსებობასაც ვერ მიხვდებით.",
      description:
        "Cast in solid brass with a hidden discreet camera and two-way audio. Looks like the doorbell your grandparents had; behaves like the one your neighbors are jealous of.",
      descriptionKa:
        "ჩამოსხმული მთლიანი ბრინჯაოსგან, დამალული დისკრეტული კამერითა და ორმხრივი აუდიოთი. გამოიყურება როგორც თქვენი ბებია-ბაბუის კარის ზარი, მაგრამ იქცევა ისე, რომ მეზობლებს შური აჰყვებათ.",
      category: "smart-security",
      group: "SMART_HOME",
      room: ["ENTRYWAY"],
      basePrice: 16900,
      images: ["https://images.unsplash.com/photo-1558002038-bacd0a9a1dbe?w=1200&q=80"],
      materials: ["Solid brass"],
      materialsKa: ["მთლიანი ბრინჯაო"],
      smartFeatures: ["1080p camera", "Two-way audio", "Motion alerts", "No subscription required for 30-day history"],
      smartFeaturesKa: ["1080p კამერა", "ორმხრივი აუდიო", "მოძრაობის შეტყობინებები", "30-დღიანი ისტორია გამოწერის გარეშე"],
      variants: [{ name: "Brass", nameKa: "ბრინჯაო", attributes: { color: "Brass" }, stock: 10 }],
    },
    {
      slug: "juniper-oak-shelf",
      name: "Juniper Floating Oak Shelf",
      nameKa: "Juniper-ის მოტივტივე მუხის თარო",
      shortDescription: "Solid oak floating shelf, hidden bracket mount.",
      shortDescriptionKa: "მთლიანი მუხის მოტივტივე თარო, დამალული სამაგრით.",
      description:
        "A single plank of solid oak with a hidden bracket for a clean, floating look. Ages beautifully with a natural oil finish.",
      descriptionKa:
        "მთლიანი მუხის ერთი ფიცარი დამალული სამაგრით, სუფთა, 'მოტივტივე' იერისთვის. დროთა განმავლობაში ლამაზად იცვლის ელფერს ბუნებრივი ზეთის საფარით.",
      category: "storage",
      group: "DECOR",
      room: ["LIVING_ROOM", "KITCHEN", "OFFICE"],
      basePrice: 6200,
      images: ["https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1200&q=80"],
      materials: ["Solid oak"],
      materialsKa: ["მთლიანი მუხა"],
      variants: [
        { name: '24"', nameKa: "24 დუიმი", attributes: { size: "24 inch" }, stock: 20 },
        { name: '36"', nameKa: "36 დუიმი", attributes: { size: "36 inch" }, priceDelta: 1500, stock: 14 },
      ],
    },
    {
      slug: "moss-air-purifier",
      name: "Moss Air Purifier",
      nameKa: "Moss ჰაერის გამწმენდი",
      shortDescription: "A purifier shaped like a planter, because it doubles as one.",
      shortDescriptionKa: "ჰაერის გამწმენდი, ქოთნის ფორმის, რადგან ქოთნადაც გამოიყენება.",
      description:
        "HEPA filtration hidden inside a plaster-finish planter shell — plant a small trailing plant on top and it disappears into the room.",
      descriptionKa:
        "HEPA ფილტრაცია დამალული თაბაშირის ზედაპირის მქონე ქოთნის კორპუსში — დარგეთ პატარა ჩამომყოლი მცენარე თავზე და ის ოთახში ისე ერწყმის, რომ თითქმის შეუმჩნეველი ხდება.",
      category: "smart-climate",
      group: "SMART_HOME",
      room: ["LIVING_ROOM", "BEDROOM", "OFFICE"],
      basePrice: 14900,
      images: ["https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?w=1200&q=80"],
      materials: ["Plaster composite"],
      materialsKa: ["თაბაშირის კომპოზიტი"],
      smartFeatures: ["HEPA filtration", "Air quality sensor", "App control", "Auto mode"],
      smartFeaturesKa: ["HEPA ფილტრაცია", "ჰაერის ხარისხის სენსორი", "მართვა აპლიკაციით", "ავტომატური რეჟიმი"],
      variants: [{ name: "Plaster", nameKa: "თაბაშირისფერი", attributes: {}, stock: 16 }],
    },
    {
      slug: "reed-bath-towel-set",
      name: "Reed Turkish Bath Towel Set",
      nameKa: "Reed-ის თურქული პირსახოცების ნაკრები",
      shortDescription: "Set of two Turkish cotton bath towels.",
      shortDescriptionKa: "ორი თურქული ბამბის საბანაო პირსახოცის ნაკრები.",
      description:
        "Long-staple Turkish cotton, densely woven for absorbency without the bulk. Set of two bath towels.",
      descriptionKa:
        "გრძელბოჭკოვანი თურქული ბამბა, მკვრივად ნაქსოვი, კარგად შთანთქავს წყალს და არ არის სქელი. ორი საბანაო პირსახოცის ნაკრები.",
      category: "textiles",
      group: "DECOR",
      room: ["BATHROOM"],
      basePrice: 4400,
      images: ["https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80"],
      materials: ["Turkish cotton"],
      materialsKa: ["თურქული ბამბა"],
      variants: [
        { name: "Ivory", nameKa: "სპილოს ძვლისფერი", attributes: { color: "Ivory" }, stock: 32 },
        { name: "Sage", nameKa: "სალბისფერი", attributes: { color: "Sage" }, stock: 25 },
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
        nameKa: p.nameKa,
        shortDescription: p.shortDescription,
        shortDescriptionKa: p.shortDescriptionKa,
        description: p.description,
        descriptionKa: p.descriptionKa,
        categoryId: categories[p.category],
        group: p.group,
        room: p.room as never,
        basePrice: p.basePrice,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        materials: p.materials ?? [],
        materialsKa: p.materialsKa ?? [],
        smartFeatures: p.smartFeatures ?? [],
        smartFeaturesKa: p.smartFeaturesKa ?? [],
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
          nameKa: v.nameKa,
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
