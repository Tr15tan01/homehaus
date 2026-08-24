import type { Locale } from "@/lib/locale";

// Every string here is hand-written, not machine-translated. Keep both
// languages in sync when adding new keys — TypeScript will error if a key
// exists in one language but not the other, since both objects share the
// same `Dictionary` type.
export type Dictionary = {
  nav: {
    decor: string;
    smartHome: string;
    shopByRoom: string;
    search: string;
    cart: string;
    signIn: string;
    signOut: string;
    dashboard: string;
    account: string;
  };
  home: {
    heroEyebrow: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroBody: string;
    shopAll: string;
    shopByRoom: string;
    lampCaption: string;
    shopByRoomHeading: string;
    viewAllRooms: string;
    featuredHeading: string;
    viewAll: string;
    assistantEyebrow: string;
    assistantHeading: string;
    assistantBody: string;
    assistantCta: string;
    categoriesHeading: string;
    recentlyViewedHeading: string;
    trustFreeShipping: string;
    trustFreeShippingSub: string;
    trustReturns: string;
    trustReturnsSub: string;
    trustSecure: string;
    trustSecureSub: string;
  };
  footer: {
    tagline: string;
    shop: string;
    help: string;
    company: string;
    featured: string;
    shipping: string;
    contact: string;
    trackOrder: string;
    about: string;
    sustainability: string;
    rights: string;
  };
  product: {
    addToCart: string;
    outOfStock: string;
    adding: string;
    option: string;
    materials: string;
    reviews: string;
    noReviews: string;
    writeReview: string;
    signInToReview: string;
    verifiedPurchase: string;
    youMightAlsoLike: string;
    smartHomeBadge: string;
    sale: string;
  };
  theme: {
    light: string;
    dark: string;
  };
  common: {
    loading: string;
  };
};

const en: Dictionary = {
  nav: {
    decor: "Decor",
    smartHome: "Smart Home",
    shopByRoom: "Shop by Room",
    search: "Search",
    cart: "Cart",
    signIn: "Sign in",
    signOut: "Sign out",
    dashboard: "Dashboard",
    account: "Account",
  },
  home: {
    heroEyebrow: "Home decor & smart devices",
    heroTitleLine1: "Quietly smart,",
    heroTitleLine2: "beautifully placed.",
    heroBody:
      "We choose every device the way we choose every vase — by how it lives in your room. No blinking hubs, no gadget-aisle clutter. Just pieces that belong.",
    shopAll: "Shop all",
    shopByRoom: "Shop by room",
    lampCaption: "Table lamp — on, dimmed for evening",
    shopByRoomHeading: "Shop by room",
    viewAllRooms: "View all rooms",
    featuredHeading: "Featured this season",
    viewAll: "View all",
    assistantEyebrow: "HomeHaus Assistant",
    assistantHeading: "Describe your room. We'll style it.",
    assistantBody:
      "Tell the assistant what you're working with — a small bedroom, a bare entryway, a kitchen that needs warmth — and get a curated set back in seconds.",
    assistantCta: "Open the assistant in the corner →",
    categoriesHeading: "Browse categories",
    recentlyViewedHeading: "Recently viewed",
    trustFreeShipping: "Free shipping",
    trustFreeShippingSub: "On orders over $75",
    trustReturns: "30-day returns",
    trustReturnsSub: "No questions asked",
    trustSecure: "Secure checkout",
    trustSecureSub: "Powered by Stripe",
  },
  footer: {
    tagline:
      "Decor and smart home devices chosen for how they look in a room, not just what they do.",
    shop: "Shop",
    help: "Help",
    company: "Company",
    featured: "Featured",
    shipping: "Shipping & Returns",
    contact: "Contact",
    trackOrder: "Track an Order",
    about: "About",
    sustainability: "Sustainability",
    rights: "All rights reserved.",
  },
  product: {
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    adding: "Adding…",
    option: "Option",
    materials: "Materials",
    reviews: "Reviews",
    noReviews: "No reviews yet — be the first.",
    writeReview: "Write a review",
    signInToReview: "Sign in to write a review.",
    verifiedPurchase: "Verified purchase",
    youMightAlsoLike: "You might also like",
    smartHomeBadge: "Smart",
    sale: "Sale",
  },
  theme: {
    light: "Light",
    dark: "Dark",
  },
  common: {
    loading: "Loading…",
  },
};

const ka: Dictionary = {
  nav: {
    decor: "დეკორი",
    smartHome: "სმარტ სახლი",
    shopByRoom: "ოთახების მიხედვით",
    search: "ძიება",
    cart: "კალათა",
    signIn: "შესვლა",
    signOut: "გასვლა",
    dashboard: "მართვის პანელი",
    account: "ჩემი გვერდი",
  },
  home: {
    heroEyebrow: "საოჯახო დეკორი და ჭკვიანი მოწყობილობები",
    heroTitleLine1: "მშვიდად ჭკვიანი,",
    heroTitleLine2: "მშვენივრად განთავსებული.",
    heroBody:
      "ყოველ მოწყობილობას ისევე ვირჩევთ, როგორც ვაზას — იმის მიხედვით, თუ როგორ ერწყმის ის თქვენს ოთახს. არანაირი მოციმციმე კვანძები, არანაირი ტექნიკის სავაჭროს ქაოსი. მხოლოდ ის, რაც ნამდვილად ერგება სივრცეს.",
    shopAll: "ყველას ნახვა",
    shopByRoom: "ოთახების მიხედვით",
    lampCaption: "სამაგიდო ლამპარი — ჩართული, საღამოსთვის დაბინდული",
    shopByRoomHeading: "შეარჩიეთ ოთახის მიხედვით",
    viewAllRooms: "ყველა ოთახის ნახვა",
    featuredHeading: "სეზონის რჩეულები",
    viewAll: "ყველას ნახვა",
    assistantEyebrow: "HomeHaus-ის ასისტენტი",
    assistantHeading: "აღწერეთ თქვენი ოთახი — ჩვენ დავალამაზებთ.",
    assistantBody:
      "უთხარით ასისტენტს რასთან გაქვთ საქმე — პატარა საძინებელი, ცარიელი წინკარი, სამზარეულო, რომელსაც სითბო აკლია — და წამებში მიიღებთ შერჩეულ კომპლექტს.",
    assistantCta: "გახსენით ასისტენტი კუთხეში →",
    categoriesHeading: "კატეგორიების დათვალიერება",
    recentlyViewedHeading: "ბოლოს ნანახი",
    trustFreeShipping: "უფასო მიწოდება",
    trustFreeShippingSub: "$75-ზე მეტ შეკვეთაზე",
    trustReturns: "30-დღიანი დაბრუნება",
    trustReturnsSub: "დამატებითი კითხვების გარეშე",
    trustSecure: "უსაფრთხო გადახდა",
    trustSecureSub: "Stripe-ის მეშვეობით",
  },
  footer: {
    tagline:
      "დეკორი და ჭკვიანი მოწყობილობები, შერჩეული იმის მიხედვით, თუ როგორ გამოიყურება ოთახში — არა მხოლოდ იმის, თუ რას აკეთებს.",
    shop: "მაღაზია",
    help: "დახმარება",
    company: "კომპანია",
    featured: "რჩეულები",
    shipping: "მიწოდება და დაბრუნება",
    contact: "კონტაქტი",
    trackOrder: "შეკვეთის თვალყურის დევნება",
    about: "ჩვენ შესახებ",
    sustainability: "მდგრადობა",
    rights: "ყველა უფლება დაცულია.",
  },
  product: {
    addToCart: "კალათაში დამატება",
    outOfStock: "არ არის მარაგში",
    adding: "მიმდინარეობს დამატება…",
    option: "ვარიანტი",
    materials: "მასალები",
    reviews: "შეფასებები",
    noReviews: "ჯერ არცერთი შეფასება — იყავით პირველი.",
    writeReview: "დაწერეთ შეფასება",
    signInToReview: "შესვლა შეფასების დასატოვებლად.",
    verifiedPurchase: "დადასტურებული შესყიდვა",
    youMightAlsoLike: "შესაძლოა ასევე მოგეწონოთ",
    smartHomeBadge: "ჭკვიანი",
    sale: "ფასდაკლება",
  },
  theme: {
    light: "ღია",
    dark: "მუქი",
  },
  common: {
    loading: "იტვირთება…",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, ka };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
