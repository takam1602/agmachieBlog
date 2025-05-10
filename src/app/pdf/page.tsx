export default function PDFViewer() {
  const pdfURL =
    'https://<PROJECT-ID>.supabase.co/storage/v1/object/public/agmachinephotos/pdfs/MWF-Brochure.pdf'

  return (
    <div className="p-4">
      <iframe src={pdfURL} className="w-full h-screen" />
    </div>
  )
}
