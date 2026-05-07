import Image from "next/image";

export default function LandingLogo() {
  return (
    <div
      className="absolute bottom-4 md:bottom-8 translate-y-1/2 right-5 md:right-12 right-5 w-35 h-35 md:w-70 md:h-70  flex items-center justify-center overflow-hidden"
    >
      <Image
        src="/images/landing/landing-kis-logo.png"
        alt="kis-points-avatar"
        width={200}
        height={200}
        className="w-full h-full object-cover drop-shadow-lg"
      />
    </div>
  );
}
