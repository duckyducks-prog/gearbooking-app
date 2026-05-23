"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2, RotateCcw } from "lucide-react";

type Props = {
  equipmentId: number;
  name: string;
  brand: string;
  model: string;
  category: string;
  cachedVideoId:  string | null;
  cachedTitle:    string | null;
  cachedChannel:  string | null;
};

export function VideoWalkthrough({
  equipmentId, name, brand, model, category,
  cachedVideoId, cachedTitle, cachedChannel,
}: Props) {
  const [videoId,  setVideoId]  = useState<string | null>(cachedVideoId);
  const [title,    setTitle]    = useState<string | null>(cachedTitle);
  const [channel,  setChannel]  = useState<string | null>(cachedChannel);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/gear/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brand, model, category }),
      });
      const data = await res.json();
      if (!res.ok || !data.videoId) {
        setError(data.error ?? "Could not find a video.");
        return;
      }
      // Save to DB so next page load is instant
      await fetch(`/api/gear/${equipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeVideoId: data.videoId,
          youtubeTitle:   data.title       ?? null,
          youtubeChannel: data.channelTitle ?? null,
        }),
      });
      setVideoId(data.videoId);
      setTitle(data.title       ?? null);
      setChannel(data.channelTitle ?? null);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setVideoId(null);
    setTitle(null);
    setChannel(null);
    await search();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#8A8A8A]">
          <PlayCircle size={11} />
          Walkthrough Video
        </h2>
        {videoId && (
          <button
            onClick={refresh}
            disabled={loading}
            className="text-[#8A8A8A] hover:text-[#141414] transition-colors disabled:opacity-40"
            title="Search for a different video"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {videoId ? (
        <div className="space-y-2">
          <div className="aspect-video w-full rounded-sm overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
              title={title ?? "Equipment walkthrough"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          {(title || channel) && (
            <p className="font-mono text-[10px] text-[#8A8A8A] tracking-wide truncate">
              {[title, channel].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-[#8A8A8A] text-[13px]">
          <Loader2 size={14} className="animate-spin" />
          <span>Claude is searching YouTube…</span>
        </div>
      ) : (
        <div className="space-y-2">
          {error && <p className="text-[12px] text-[#8A8A8A]">{error}</p>}
          <Button variant="secondary" size="sm" onClick={search}>
            <PlayCircle size={13} />
            {error ? "Try again" : "Find walkthrough on YouTube"}
          </Button>
        </div>
      )}
    </div>
  );
}
