import Image from 'next/image';
import { avatarColorFor } from '@/lib/community';

/** Avatar redondo: la foto de perfil si existe y, si no, la inicial del
 * usuario sobre un color que siempre es el mismo para esa persona. */
export function Avatar({
  handle,
  imageUrl,
  size = 36,
  className = '',
}: {
  handle: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative shrink-0 rounded-full overflow-hidden inline-flex items-center justify-center font-bold text-white ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.33), background: imageUrl ? undefined : avatarColorFor(handle) }}
      aria-hidden="true"
    >
      {handle.replace('@', '').charAt(0).toUpperCase()}
      {imageUrl && <Image src={imageUrl} alt="" fill sizes={`${size}px`} className="object-cover" />}
    </span>
  );
}
