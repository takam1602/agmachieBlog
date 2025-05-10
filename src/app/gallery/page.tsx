import Image from 'next/image'
import { supabase } from '@/utils/supabaseClient'

export const revalidate = 60 // ISR

export default async function Gallery() {
  const { data } = await supabase.storage.from('ag-photos').list('photos')

  const photos = data?.map(
    (photo) =>
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/agmachinephotos/photos/${photo.name}`
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos?.map((url) => (
        <div key={url} className="relative w-full h-60">
          <Image src={url} alt="photo" fill className="object-cover rounded" />
        </div>
      ))}
    </div>
  )
}
