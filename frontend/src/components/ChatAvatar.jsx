import { mediaUrl } from "../utils/mediaUrl.js";

function initials(name) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * @param {{ name: string; imageUrl?: string; size?: number; className?: string }} props
 */
export default function ChatAvatar({ name, imageUrl, size = 48, className = "" }) {
  const px = `${size}px`;
  const textSize =
    size >= 120 ? "text-5xl" : size >= 52 ? "text-xl" : size >= 40 ? "text-lg" : "text-sm";
  const src = imageUrl ? mediaUrl(imageUrl) : "";
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dfe5e7] font-bold text-[#54656f] ${textSize} ${className}`}
      style={{ width: px, height: px }}
    >
      {src ? (
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src={src} />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
