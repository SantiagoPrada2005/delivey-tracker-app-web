import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-4">Página no encontrada</h2>
      <p className="text-gray-600 mb-8">La página que buscas no existe.</p>
      <Link 
        href="/" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Volver al inicio
      </Link>
    </div>
  )
}