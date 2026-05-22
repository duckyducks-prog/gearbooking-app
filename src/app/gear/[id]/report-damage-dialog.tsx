"use client";
import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Upload } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  equipmentId: number;
  equipmentName: string;
};

const SEVERITIES = [
  { value: "minor",    label: "Minor",    desc: "Cosmetic damage, fully functional" },
  { value: "major",    label: "Major",    desc: "Affects operation but still usable" },
  { value: "unusable", label: "Unusable", desc: "Cannot be used until repaired" },
];

export function ReportDamageDialog({ equipmentId, equipmentName }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!description.trim()) { setError("Description is required."); return; }
    setSubmitting(true);
    setError("");

    const fd = new FormData();
    fd.append("equipmentId", String(equipmentId));
    fd.append("reportedById", String(user.id));
    fd.append("description", description);
    fd.append("severity", severity);
    if (photo) fd.append("photo", photo);

    const res = await fetch("/api/damage", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    setOpen(false);
    setDescription("");
    setSeverity("minor");
    setPhoto(null);
    setPhotoPreview(null);
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="danger" size="sm">
          <AlertTriangle size={13} />
          Report damage
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#F8F5EE] border border-[#141414]/10 rounded-sm shadow-xl p-6 focus:outline-none">
          <div className="flex items-start justify-between mb-5">
            <div>
              <Dialog.Title className="text-[18px] font-light text-[#141414] tracking-tight">
                Report Damage
              </Dialog.Title>
              <p className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] mt-0.5">
                {equipmentName}
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="text-[#8A8A8A] hover:text-[#141414] transition-colors mt-0.5">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Severity */}
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-2">
                Severity
              </label>
              <div className="flex gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value)}
                    className={cn(
                      "flex-1 px-2 py-2 rounded-sm border text-left transition-all",
                      severity === s.value
                        ? "border-[#141414] bg-white"
                        : "border-[#141414]/10 bg-white/40 hover:border-[#141414]/25"
                    )}
                  >
                    <p className={cn(
                      "text-[11px] font-medium",
                      s.value === "unusable" ? "text-[#46062B]" : s.value === "major" ? "text-[#FF4800]" : "text-[#141414]"
                    )}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-[#8A8A8A] leading-tight mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-2">
                Description <span className="text-[#FF4800]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the damage clearly — what happened, what's affected, when you noticed it…"
                rows={3}
                className="w-full px-3 py-2 border border-[#141414]/10 rounded-sm bg-white/60 text-[13px] text-[#141414] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF4800]/40 resize-none transition-colors"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-2">
                Photo <span className="text-[#8A8A8A] normal-case font-sans tracking-normal text-[10px]">(optional)</span>
              </label>
              {photoPreview ? (
                <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-[#141414]/5 border border-[#141414]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-6 border border-dashed border-[#141414]/20 rounded-sm flex flex-col items-center gap-1.5 text-[#8A8A8A] hover:border-[#141414]/40 hover:text-[#141414] transition-colors"
                >
                  <Upload size={16} />
                  <span className="text-[11px]">Click to upload a photo</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </div>

            {error && (
              <p className="text-[12px] text-[#46062B]">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="submit" variant="danger" size="sm" disabled={submitting} className="flex-1">
                {submitting ? "Submitting…" : "Submit report"}
              </Button>
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" size="sm">Cancel</Button>
              </Dialog.Close>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
