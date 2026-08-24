import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "@/lib/locale";
import { getDictionary, ROOM_LABELS } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Shop by Room",
  description: "Browse HomeHaus decor and smart home pieces organized by room.",
};

const ROOMS = [
  {
    key: "LIVING_ROOM",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80",
  },
  {
    key: "BEDROOM",
    img: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=900&q=80",
  },
  {
    key: "KITCHEN",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900&q=80",
  },
  {
    key: "BATHROOM",
    img: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=900&q=80",
  },
  {
    key: "ENTRYWAY",
    img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=900&q=80",
  },
  {
    key: "OFFICE",
    img: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=900&q=80",
  },
  {
    key: "OUTDOOR",
    img: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=900&q=80",
  },
  {
    key: "WHOLE_HOME",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
  },
];

export default async function RoomsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const roomLabels = ROOM_LABELS[locale];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl">{dict.rooms.title}</h1>
      <p className="mt-2 max-w-xl text-ink-soft">{dict.rooms.subtitle}</p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {ROOMS.map((room) => (
          <Link
            key={room.key}
            href={`/products?room=${room.key}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
          >
            <Image
              src={room.img}
              alt={roomLabels[room.key]}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 font-display text-xl text-white">
              {roomLabels[room.key]}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
