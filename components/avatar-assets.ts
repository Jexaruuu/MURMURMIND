const ASSET_PREFIX = "asset:";

const AVATAR_CHOICES = [
  { key: `${ASSET_PREFIX}murmurblack`, label: "Bla", src: require("@/assets/images/murmurblack.png") },
  { key: `${ASSET_PREFIX}murmuryellow`, label: "Yel", src: require("@/assets/images/murmuryellow.png") },
  { key: `${ASSET_PREFIX}murmurblue`, label: "Blu", src: require("@/assets/images/murmurblue.png") },
  { key: `${ASSET_PREFIX}murmurorange`, label: "Ora", src: require("@/assets/images/murmurorange.png") },
  { key: `${ASSET_PREFIX}murmurred`, label: "Red", src: require("@/assets/images/murmurred.png") },
  { key: `${ASSET_PREFIX}murmurgreen`, label: "Gre", src: require("@/assets/images/murmurgreen.png") },
];

const AVATAR_ASSETS: Record<string, any> = AVATAR_CHOICES.reduce((acc: any, a) => {
  acc[a.key] = a.src;
  return acc;
}, {});

const fallbackAvatar = require("@/assets/images/murmurblack.png");
const editPlaceholder = require("@/assets/images/murmurblack.png");

const assetFor = (v: string | null | undefined) => {
  if (!v) return null;
  if (typeof v !== "string") return null;
  const k = v.trim();
  if (!k.startsWith(ASSET_PREFIX)) return null;
  return AVATAR_ASSETS[k] || null;
};

export { ASSET_PREFIX, assetFor, AVATAR_ASSETS, AVATAR_CHOICES, editPlaceholder, fallbackAvatar };

