import Image from "next/image";

export default function LandingMascot() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-brand-cream rounded-2xl p-8 w-150 h-150 relative drop-shadow-lg">
        <Image
          src="/images/landing/landing-mascot.png"
          alt="Friendly character with yellow crown and cheerful pose"
          width={600}
          height={600}
          priority
          className="absolute w-full h-auto object-cover -top-8 left-5 drop-shadow-lg"
        />
      </div>
    </div>
  );
}
