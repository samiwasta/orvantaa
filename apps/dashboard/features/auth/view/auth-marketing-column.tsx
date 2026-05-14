import Image from "next/image"

type AuthMarketingColumnProps = {
  imageAlt?: string
}

export function AuthMarketingColumn({
  imageAlt = "Girl with laptop",
}: AuthMarketingColumnProps) {
  return (
    <section className="relative flex min-h-0 w-full flex-col justify-between gap-4 bg-[#6366f1] p-6 text-white md:min-h-[560px] md:w-1/2 lg:min-h-[600px] lg:p-10">
      <div className="flex items-center justify-center">
        <Image
          src="/orvantaa-logo.png"
          alt="Orvantaa"
          width={180}
          height={48}
          className="h-8 w-auto object-contain sm:h-9"
          priority
        />
      </div>

      <div className="relative mx-auto hidden min-h-[260px] w-full max-w-lg flex-1 flex-col items-center justify-center py-4 md:flex md:min-h-[280px] md:py-4 lg:min-h-[320px] lg:py-6">
        <div className="relative z-0 flex w-full justify-center px-3">
          <Image
            src="/girl-with-laptop.svg"
            alt={imageAlt}
            width={400}
            height={400}
            className="h-auto max-h-[min(52vh,400px)] w-full max-w-[400px] object-contain object-bottom"
            priority
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 text-center">
        <h2 className="font-heading text-xl leading-snug font-bold lg:text-2xl">
          Learn smarter, not harder
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-white/90">
          Practice concepts, track your progress, and improve with AI-powered
          learning.
        </p>
      </div>
    </section>
  )
}
