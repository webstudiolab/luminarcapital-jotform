import Image from 'next/image'

const HeroBanner = ({ src, title }: { src: string; title: string }) => {
  return (
    <Image
      src={src}
      alt={title}
      fill
      priority={true}
      placeholder="empty"
      sizes="(max-width: 600px) 100rem, (max-width: 900) 50vw"
    />
  )
}

export default HeroBanner
