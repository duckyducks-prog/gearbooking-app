import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const booking = await prisma.booking.findUnique({
    where: { shareToken: token },
    include: {
      user: { select: { name: true } },
      items: {
        include: { equipment: true },
        orderBy: [{ equipment: { category: "asc" } }, { equipment: { name: "asc" } }],
      },
    },
  });

  if (!booking) notFound();

  // Group by category
  const byCategory: Record<string, typeof booking.items> = {};
  for (const item of booking.items) {
    const cat = item.equipment.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .page { max-width: 100% !important; padding: 24px !important; }
        }
      `}</style>

      <div style={{ background: "#F8F5EE", minHeight: "100vh" }}>
        <div className="page" style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF4800", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: "#FF4800" }} />
              Gear List
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: "-0.02em", color: "#141414", margin: "0 0 8px" }}>
              {booking.projectName}
            </h1>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#8A8A8A", letterSpacing: "0.04em" }}>
              {format(new Date(booking.startDate), "MMM d")} → {format(new Date(booking.endDate), "MMM d, yyyy")}
              {" · "}Booked by {booking.user.name}
              {" · "}{booking.items.length} item{booking.items.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Print button */}
          <div className="no-print" style={{ marginBottom: 32 }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: "8px 16px", border: "1px solid rgba(20,20,20,0.15)", borderRadius: 3,
                background: "rgba(255,255,255,0.6)", fontFamily: "monospace", fontSize: 11,
                letterSpacing: "0.10em", textTransform: "uppercase", cursor: "pointer", color: "#3D3D3D",
              }}
            >
              Print / Save as PDF
            </button>
          </div>

          {/* Gear by category */}
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 28 }}>
              <div style={{
                fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "#8A8A8A", marginBottom: 8,
                paddingBottom: 6, borderBottom: "1px solid rgba(20,20,20,0.10)",
              }}>
                {category}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {items.map((item) => {
                  const qty = (item as { quantity?: number }).quantity ?? 1;
                  return (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "baseline", justifyContent: "space-between",
                      padding: "7px 0", borderBottom: "1px solid rgba(20,20,20,0.06)",
                    }}>
                      <div>
                        <span style={{ fontSize: 14, color: "#141414" }}>{item.equipment.name}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#8A8A8A", marginLeft: 8 }}>
                          {item.equipment.brand}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        {qty > 1 && (
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#3D3D3D" }}>×{qty}</span>
                        )}
                        {item.equipment.serialNumber && (
                          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#8A8A8A", letterSpacing: "0.06em" }}>
                            {item.equipment.serialNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 48, paddingTop: 16, borderTop: "1px solid rgba(20,20,20,0.10)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", color: "#8A8A8A" }}>
              Studio Gear · Shared booking list
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
