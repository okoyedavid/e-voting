export type StoredImage = {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
};

export type ImageVariant = "cover" | "portrait" | "thumb";

const transformations: Record<ImageVariant, string> = {
  cover: "f_auto,q_auto,c_fill,g_auto,w_1600,h_900",
  portrait: "f_auto,q_auto,c_fill,g_auto,w_800,h_1000",
  thumb: "f_auto,q_auto,c_fill,g_auto,w_240,h_300",
};

export function cloudinaryDeliveryUrl(asset: StoredImage | null | undefined, variant: ImageVariant) {
  if (!asset?.secureUrl) return null;
  return asset.secureUrl.replace("/upload/", `/upload/${transformations[variant]}/`);
}

export function resolveImageUrl(
  asset: StoredImage | null | undefined,
  legacyUrl: string | null | undefined,
  variant: ImageVariant,
  fallback: string,
) {
  return cloudinaryDeliveryUrl(asset, variant) ?? legacyUrl ?? fallback;
}
