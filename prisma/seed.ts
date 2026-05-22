import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const adapter = new PrismaLibSql({
  url: `file:${path.resolve(__dirname, "../dev.db")}`,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.projectTypeKit.deleteMany();
  await prisma.equipmentRelation.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.damageReport.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();

  // Reset auto-increment so IDs start from 1 on every seed
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence`).catch(() => {});

  // ── Users ──────────────────────────────────────────────
  const leticia = await prisma.user.create({
    data: { name: "Leticia De Bortoli", email: "leticia@studio.com", role: "admin" },
  });
  await prisma.user.create({
    data: { name: "Marco Reyes", email: "marco@studio.com", role: "member" },
  });
  await prisma.user.create({
    data: { name: "Jin Park", email: "jin@studio.com", role: "member" },
  });

  // ── Cameras ────────────────────────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "ARRI Alexa MINI Kit",
        category: "camera",
        brand: "ARRI",
        model: "Alexa MINI",
        status: "available",
        quantity: 2,
        photo: "https://hotrodcameras.com/cdn/shop/products/arri_k1_0024074_alexa_mini_lf_camera_1553766339_1470346__00256_500x500.jpg?v=1684605606",
      },
      {
        name: "Sony FS7",
        category: "camera",
        brand: "Sony",
        model: "PXW-FS7",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/p/x/pxw-fs7m2-3.jpg",
      },
      {
        name: "Sony FS5",
        category: "camera",
        brand: "Sony",
        model: "PXW-FS5",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/p/x/pxw-fs5m2k-6.jpg",
      },
      {
        name: "Sony a7C",
        category: "camera",
        brand: "Sony",
        model: "ILCE-7C",
        status: "available",
        quantity: 8,
        photo: "https://www.filmtools.com/media/catalog/product/a/7/a7c_1.jpg",
      },
      {
        name: "Sony a7s",
        category: "camera",
        brand: "Sony",
        model: "ILCE-7S",
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/s/o/sony_alpha_a7s_iii_mirrorless_digital_camera_body_only_1_.jpg",
      },
      {
        name: "Sony a6100",
        category: "camera",
        brand: "Sony",
        model: "ILCE-6100",
        status: "available",
        quantity: 3,
        photo: "https://www.filmtools.com/media/catalog/product/i/l/ilce6100_b-8.jpg",
      },
      {
        name: "Blackmagic Pocket Cinema Camera 4K",
        category: "camera",
        brand: "Blackmagic",
        model: "BMPCC 4K",
        status: "available",
        quantity: 5,
        photo: "https://www.filmtools.com/media/catalog/product/9/6/96542.jpg",
      },
    ],
  });

  // ── Lenses — PL / EF Mount ─────────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "DZOFilm Pictor 20-55 / 50-125mm T2.8 Bundle",
        category: "lens",
        brand: "DZOFilm",
        model: "Pictor 20-55mm + 50-125mm T2.8",
        status: "available",
        quantity: 1,
        notes: "PL Mount. Two-lens zoom bundle.",
        photo: "https://www.filmtools.com/media/catalog/product/d/z/dzofilm_pictor_20_55mm_50_125mm_t2_8_cinema_lens_kit_1.jpg",
      },
      {
        name: "DZOFilm Vespid2 T1.9 Prime Set",
        category: "lens",
        brand: "DZOFilm",
        model: "Vespid2 T1.9 Prime 6-Lens Kit",
        status: "available",
        quantity: 1,
        notes: "ARRI PL Mount. 6-lens prime kit.",
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1604004490_1602171.jpg",
      },
      {
        name: "Xeen 24mm",
        category: "lens",
        brand: "Xeen",
        model: "24mm T1.5",
        status: "available",
        quantity: 2,
        notes: "Canon EF Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/r/o/rokinon-xeen-24mm-t26-15.jpg",
      },
      {
        name: "Xeen 50mm",
        category: "lens",
        brand: "Xeen",
        model: "50mm T1.5",
        status: "available",
        quantity: 2,
        notes: "Canon EF Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/r/o/rokinon-xeen-50mm-t15.jpg",
      },
      {
        name: "Canon 70-200mm Zoom",
        category: "lens",
        brand: "Canon",
        model: "EF 70-200mm f/2.8L IS",
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/7/1/71857.jpg",
      },
      {
        name: "Rokinon 16mm",
        category: "lens",
        brand: "Rokinon",
        model: "16mm T2.2",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/c/i/cine-ds-16mm.png",
      },
      {
        name: "Rokinon 35mm",
        category: "lens",
        brand: "Rokinon",
        model: "35mm T1.5",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/c/i/cine-ds-35mm_2.png",
      },
      {
        name: "Rokinon 50mm",
        category: "lens",
        brand: "Rokinon",
        model: "50mm T1.5",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/c/i/cine-ds-50mm_2.png",
      },
      {
        name: "Canon 50mm",
        category: "lens",
        brand: "Canon",
        model: "EF 50mm f/1.4",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/2/5/2515a003-4.jpg",
      },
      {
        name: "Super Macro 20mm",
        category: "lens",
        brand: "Generic",
        model: "Super Macro 20mm",
        status: "available",
        quantity: 1,
      },
      {
        name: "Irix 150mm Macro",
        category: "lens",
        brand: "Irix",
        model: "150mm f/2.8 Macro",
        status: "available",
        quantity: 1,
        photo: "https://irixlens.com/new/wp-content/uploads/2022/11/150mm-foto-z-dekielkiem.png",
      },
    ],
  });

  // ── Lenses — Sony E Mount ──────────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "Xeen 14mm (E)",
        category: "lens",
        brand: "Xeen",
        model: "14mm T3.1 E-Mount",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1648820226_1224490.jpg",
      },
      {
        name: "Xeen 24mm (E)",
        category: "lens",
        brand: "Xeen",
        model: "24mm T1.5 E-Mount",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/r/o/rokinon-xeen-24mm-t26-15.jpg",
      },
      {
        name: "Xeen 35mm (E)",
        category: "lens",
        brand: "Xeen",
        model: "35mm T1.5 E-Mount",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/r/o/rokinon-xeen-35mm-canon.png",
      },
      {
        name: "Xeen 85mm (E)",
        category: "lens",
        brand: "Xeen",
        model: "85mm T1.5 E-Mount",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/r/o/rokinon-xeen-85mm-t15.jpg",
      },
      {
        name: "Xeen 135mm (E)",
        category: "lens",
        brand: "Xeen",
        model: "135mm T2.2 E-Mount",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1649245606_1268782.jpg",
      },
      {
        name: "Sigma 24-70mm",
        category: "lens",
        brand: "Sigma",
        model: "24-70mm f/2.8 DG DN Art",
        status: "available",
        quantity: 3,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/1/7/1715845519_1827260_1_1.jpg",
      },
      {
        name: "Sony FE 35mm f/1.8",
        category: "lens",
        brand: "Sony",
        model: "SEL35F18F",
        status: "available",
        quantity: 13,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/s/e/sel35f18f-1.jpg",
      },
      {
        name: "Sony FE 24mm f/1.4 GM",
        category: "lens",
        brand: "Sony",
        model: "SEL24F14GM",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://cdn.etoren.com/upload/images/0.05079900_1672222085_sony-fe-24mm-f-1.4-gm-lens-sel24f14gm.jpg",
      },
      {
        name: "Tamron 20mm",
        category: "lens",
        brand: "Tamron",
        model: "20mm f/2.8 Di III OSD",
        status: "available",
        quantity: 3,
        notes: "Sony E Mount.",
        photo: "https://tamron-americas.com/wp-content/uploads/2026/04/f050-1200-x-1200-wht-1024x1024.webp",
      },
      {
        name: "Fujinon 50-135mm",
        category: "lens",
        brand: "Fujinon",
        model: "MK50-135mm T2.9",
        status: "available",
        quantity: 1,
        notes: "Sony E Mount.",
        photo: "https://www.filmtools.com/media/catalog/product/f/u/fujifilm_mkx50-135mm_t2.9_lens_-_fuji_x-mount_16580155_1.png",
      },
    ],
  });

  // ── Lenses — Micro Four Thirds ─────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "Sirui Anamorphic 24mm",
        category: "lens",
        brand: "Sirui",
        model: "24mm f/2.8 1.33x Anamorphic",
        status: "available",
        quantity: 1,
        notes: "MFT Mount.",
        photo: "https://store.sirui.com/cdn/shop/files/9_aa922450-6b89-4ba9-a0d0-36c05020594c.jpg?v=1762401511&width=1500",
      },
      {
        name: "Sirui Anamorphic 35mm",
        category: "lens",
        brand: "Sirui",
        model: "35mm f/1.8 1.33x Anamorphic",
        status: "available",
        quantity: 1,
        notes: "MFT Mount.",
        photo: "https://store.sirui.com/cdn/shop/files/5_00c60742-44c7-4fe2-8460-d927dffe7583.jpg?v=1762401624&width=1500",
      },
      {
        name: "Sirui Anamorphic 50mm",
        category: "lens",
        brand: "Sirui",
        model: "50mm f/1.8 1.33x Anamorphic",
        status: "available",
        quantity: 1,
        notes: "MFT Mount.",
        photo: "https://store.sirui.com/cdn/shop/files/1_67f29c6d-481c-4dfe-ae8f-5824d3a2d982.jpg?v=1762401741&width=1500",
      },
      {
        name: "Sirui Anamorphic 85mm",
        category: "lens",
        brand: "Sirui",
        model: "85mm f/1.8 1.33x Anamorphic",
        status: "available",
        quantity: 1,
        notes: "MFT Mount.",
        photo: "https://store.sirui.com/cdn/shop/files/1_b9605e50-8d84-4f99-bc4e-593220ba2dba.jpg?v=1762401387&width=1500",
      },
    ],
  });

  // ── Monitors ───────────────────────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "Feelworld 4K Ultra-Bright Monitor",
        category: "accessory",
        brand: "Feelworld",
        model: "LUT7S",
        status: "available",
        quantity: 2,
        photo: "https://feelworld.ltd/cdn/shop/products/feelworld-lut7s-camera-monitor.jpg?v=1586761264",
      },
      {
        name: `Atomos Shogun Inferno 7"`,
        category: "accessory",
        brand: "Atomos",
        model: `Shogun Inferno 7"`,
        status: "damaged",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/a/t/atomos-shogun-inferno-atomshgin2.png",
      },
      {
        name: `Atomos Ninja V 5"`,
        category: "accessory",
        brand: "Atomos",
        model: `Ninja V 5"`,
        status: "available",
        quantity: 3,
        photo: "https://www.filmtools.com/media/catalog/product/a/t/atomos_ninja_v_five_inch_4k_monitor_4.jpg",
      },
      {
        name: `Lilliput 7" Monitor`,
        category: "accessory",
        brand: "Lilliput",
        model: `7" Monitor`,
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1666957533_1731536.jpg",
      },
      {
        name: `SmallHD 5" Monitor`,
        category: "accessory",
        brand: "SmallHD",
        model: `5" Monitor`,
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/s/m/smallhd-focus-6.png",
      },
      {
        name: "Hollyland Pyro 7",
        category: "accessory",
        brand: "Hollyland",
        model: "Pyro 7",
        status: "available",
        quantity: 4,
        photo: "https://www.filmtools.com/media/catalog/product/1/7/1721897155_1838298.jpg",
      },
      {
        name: `Hollyland Mars M1 Enhanced 5"`,
        category: "accessory",
        brand: "Hollyland",
        model: `Mars M1 Enhanced 5"`,
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1698828318_1792914.jpg",
      },
    ],
  });

  // ── Wireless Video ─────────────────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "Teradek Bolt Kit",
        category: "accessory",
        brand: "Teradek",
        model: "Bolt Receiver + Transmitter",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1662681512_1723703.jpg",
      },
      {
        name: "Hollyland Cosmo C1 Transmitter",
        category: "accessory",
        brand: "Hollyland",
        model: "Cosmo C1 TX",
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/h/o/hohlcosmoc1-1.jpg",
      },
      {
        name: "Hollyland Cosmo C1 Receiver",
        category: "accessory",
        brand: "Hollyland",
        model: "Cosmo C1 RX",
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/h/o/hohlcosmoc1-1.jpg",
      },
      {
        name: "Hollyland Mars 300 Transmitter",
        category: "accessory",
        brand: "Hollyland",
        model: "Mars 300 TX",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/h/o/hollyland_mars_300_dual_hdmi_wireless_video_system_1.png",
      },
      {
        name: "Hollyland Mars 300 Receiver",
        category: "accessory",
        brand: "Hollyland",
        model: "Mars 300 RX",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/h/o/hollyland_mars_300_dual_hdmi_wireless_video_system_1.png",
      },
    ],
  });

  // ── Lighting ───────────────────────────────────────────
  await prisma.equipment.createMany({
    data: [
      {
        name: "Aputure 600x",
        category: "lighting",
        brand: "Aputure",
        model: "LS 600x",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/a/p/aputure_ls600x_pro_vmount_1.jpg",
      },
      {
        name: "Aputure 120d",
        category: "lighting",
        brand: "Aputure",
        model: "LS 120d",
        status: "available",
        quantity: 1,
        photo: "https://www.filmtools.com/media/catalog/product/l/s/lsc120diivkit-8.jpg",
      },
      {
        name: "Aputure InfiniBars",
        category: "lighting",
        brand: "Aputure",
        model: "InfiniBars",
        status: "available",
        quantity: 8,
        notes: "8 empty slots in case.",
        photo: "https://www.filmtools.com/media/catalog/product/a/p/aputure_infinibar_pb6_clean_0000_x1000_2.jpg",
      },
      {
        name: "Aputure MC",
        category: "lighting",
        brand: "Aputure",
        model: "MC RGBWW",
        status: "available",
        quantity: 13,
        notes: "8 additional lights without cases.",
        photo: "https://www.filmtools.com/media/catalog/product/m/c/mc.jpg",
      },
      {
        name: "Aputure Bulb Kit",
        category: "lighting",
        brand: "Aputure",
        model: "Accent B7c Bulb Kit",
        status: "available",
        quantity: 1,
        notes: "4/8 bulbs in case.",
        photo: "https://www.filmtools.com/media/catalog/product/2/1/213.1_transparent_1x1.jpg",
      },
      {
        name: "Amaran 100x S",
        category: "lighting",
        brand: "Amaran",
        model: "100x S",
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/1/6/1677669321_1753603.jpg",
      },
      {
        name: "Nanlite PavoTube",
        category: "lighting",
        brand: "Nanlite",
        model: "PavoTube II",
        status: "available",
        quantity: 4,
        photo: "https://www.filmtools.com/media/catalog/product/n/a/nanlite_pavotube2_30x_4ft_led_pixel_tube_light_kit_1.jpg",
      },
      {
        name: "ARRI SkyPanel S30",
        category: "lighting",
        brand: "ARRI",
        model: "SkyPanel S30-C",
        status: "available",
        quantity: 2,
        photo: "https://www.filmtools.com/media/catalog/product/a/r/arri-skypanel-s30-c-manual.jpg",
      },
    ],
  });

  // ── Sample booking ─────────────────────────────────────
  const [arri] = await prisma.equipment.findMany({ where: { name: "ARRI Alexa MINI Kit" }, take: 1 });
  const [fs7]  = await prisma.equipment.findMany({ where: { name: "Sony FS7" }, take: 1 });

  await prisma.booking.create({
    data: {
      userId: leticia.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      projectName: "Think Big Offsite — B-roll",
      projectType: "documentary",
      notes: "Product UI walkthroughs and talking-head interviews.",
      status: "active",
      items: { create: [{ equipmentId: arri.id }, { equipmentId: fs7.id }] },
    },
  });

  const total = await prisma.equipment.count();
  console.log("✓ Seed complete");
  console.log(`  Equipment: ${total} items`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
