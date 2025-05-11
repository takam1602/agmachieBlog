import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function Card({ href, title, src }:{
  href:string; title:string; src:string
}) {
  return (
    <motion.div
      whileHover={{ y:-4, boxShadow:'0 6px 12px rgba(0,0,0,.25)' }}
      className="rounded-xl bg-neutral-800 overflow-hidden"
    >
      <Link href={href} className="block">
        <div className="aspect-[4/3] relative">
          <Image src={src} alt="" fill className="object-cover"/>
        </div>
        <h3 className="p-4 text-lg font-semibold text-center text-gray-100">
          {title}
        </h3>
      </Link>
    </motion.div>
  )
}
