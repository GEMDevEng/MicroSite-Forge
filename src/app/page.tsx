import { Suspense } from 'react'
import HomePageContent from './home-page-client'

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          🚀 MicroSite Forge
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <HomePageContent />
    </Suspense>
  )
}
