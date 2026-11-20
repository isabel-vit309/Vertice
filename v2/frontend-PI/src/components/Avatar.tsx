import { useEffect, useState } from "react";
import { api, onPhotoChange } from "../services/api";

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/**
 * Foto de perfil do usuário (carregada com o token) com as iniciais como reserva.
 * `className` define tamanho, forma e cor de fundo da reserva.
 */
export default function Avatar({
  userId,
  hasPhoto,
  name,
  className = "h-12 w-12 rounded-full bg-[#7250f4] text-base",
  previewUrl,
}: {
  userId?: number | null;
  hasPhoto?: boolean;
  name: string;
  className?: string;
  /** Mostra esta imagem em vez da foto salva (prévia antes de enviar). */
  previewUrl?: string | null;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (userId == null) return;
    return onPhotoChange((changed) => changed === userId && setVersion((v) => v + 1));
  }, [userId]);

  useEffect(() => {
    let active = true;
    setUrl(null);
    if (userId != null && hasPhoto) {
      api.foto(userId).then((found) => active && setUrl(found));
    }
    return () => {
      active = false;
    };
  }, [userId, hasPhoto, version]);

  const src = previewUrl ?? url;
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden font-semibold text-white ${className}`}
    >
      {src ? (
        <img src={src} alt={`Foto de ${name}`} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
