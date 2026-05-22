"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2, X } from "lucide-react";

type Props = {
  name: string;
  brand: string;
  model: string;
  category: string;
};

type VideoResult = {
  videoId: string;
  title: string;
  channelTitle: string;
};

export function VideoWalkthrough({ name, brand, model, category }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [video, setVideo] = useState<VideoResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function findVideo() {
    setState("loading");
    try {
      const res = await fetch("/api/gear/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brand, model, category }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Could not find a video.");
        setState("error");
      } else {
        setVideo(data);
        setState("found");
      }
    } catch {
      setErrorMsg("Network error.");
      setState("error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A]">
          <PlayCircle size={11} />
          Walkthrough Video
        </h2>
        {state === "found" && (
          <button
            onClick={() => setState("idle")}
            className="text-[#8A8A8A] hover:text-[#141414] transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {state === "idle" && (
        <Button variant="secondary" size="sm" onClick={findVideo}>
          <PlayCircle size={13} />
          Find walkthrough on YouTube
        </Button>
      )}

      {state === "loading" && (
        <div className="flex items-center gap-2 text-[#8A8A8A] text-[13px]">
          <Loader2 size={14} className="animate-spin" />
          <span>Claude is searching YouTube…</span>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <p className="text-[12px] text-[#8A8A8A]">{errorMsg}</p>
          <Button variant="secondary" size="sm" onClick={findVideo}>
            Try again
          </Button>
        </div>
      )}

      {state === "found" && video && (
        <div className="space-y-2">
          <div className="aspect-video w-full rounded-sm overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <p className="font-mono text-[10px] text-[#8A8A8A] tracking-wide truncate">
            {video.title} · {video.channelTitle}
          </p>
        </div>
      )}
    </div>
  );
}
