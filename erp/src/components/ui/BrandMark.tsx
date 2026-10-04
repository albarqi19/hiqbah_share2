// The workspace mark: the uploaded logo when Settings has one, otherwise the
// letter ح on the primary surface. The letter is a placeholder, not the official
// logo file — it stands in until a logo is uploaded.

const SIZES = {
  sm: { box: "w-9 h-9 rounded-md", glyph: "text-xl" },
  md: { box: "w-14 h-14 rounded-lg", glyph: "text-[32px]" },
} as const;

export function BrandMark({ logo, size = "sm" }: { logo: string | null; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className={`${s.box} bg-hq-primary-soft flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {logo ? (
        <img src={logo} alt="" className="w-full h-full object-contain p-1" />
      ) : (
        <span aria-hidden="true" className={`${s.glyph} leading-none font-bold text-hq-primary`}>ح</span>
      )}
    </span>
  );
}
