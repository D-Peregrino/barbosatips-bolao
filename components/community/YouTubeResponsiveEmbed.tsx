type Props = {
  videoId: string;
  title: string;
  /** Shorts em formato vertical. */
  variant?: "video" | "short";
  className?: string;
};

/**
 * iframe responsivo (16:9 ou 9:16 para shorts).
 */
export function YouTubeResponsiveEmbed({
  videoId,
  title,
  variant = "video",
  className = "",
}: Props) {
  const src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;
  const aspect =
    variant === "short"
      ? "aspect-[9/16] max-h-[min(72vh,520px)] w-full max-w-[280px] mx-auto"
      : "aspect-video w-full";

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_60px_-28px_rgba(0,0,0,.75)] ${aspect} ${className}`}>
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}
