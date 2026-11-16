/* The Techverse MY star portal lockup. The original file has cream lettering for dark
   backgrounds; the light copy has the lettering recoloured to the page ink. CSS shows one. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo__img logo__img--light" src="/brand/techverse-lockup-light.webp" alt="" width={1276} height={192} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo__img logo__img--dark" src="/brand/techverse-lockup-dark.webp" alt="" width={1276} height={192} />
    </span>
  );
}
