import Image from "next/image";

/**
 * The painted meadow behind the hero. Sized by its own aspect ratio and anchored
 * to the bottom, so wide screens never crop the painting.
 */
export function HeroMeadow() {
  return (
    <div
      aria-hidden="true"
      className="mask-[linear-gradient(transparent_0%,rgba(0,0,0,0.6)_14%,black_26%)] pointer-events-none absolute bottom-0 left-1/2 aspect-[1672/941] w-[max(1956px,100%)] -translate-x-1/2"
    >
      <Image
        alt=""
        className="object-cover"
        fill
        priority
        sizes="(max-width: 1956px) 1956px, 100vw"
        src="/images/art/meadow.jpg"
      />
    </div>
  );
}
