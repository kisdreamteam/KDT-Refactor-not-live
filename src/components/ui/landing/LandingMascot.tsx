import Image from 'next/image'

export default function LandingMascot() {
  return (
    <div className="flex items-center justify-center md:justify-end">
      <div className="bg-brand-cream h-60 md:h-150 w-60 md:w-150 rounded-2xl drop-shadow-lg">
        <Image
          src="/images/landing/landing-mascot.png"
          alt="Friendly character with yellow crown and cheerful pose"
          width={600}
          height={600}
          priority
          className="absolute -top-8 left-5 h-auto w-60 md:w-full object-cover drop-shadow-lg"
        />
      </div>
    </div>
  )
}
