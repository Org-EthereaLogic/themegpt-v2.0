import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-8xl font-bold text-brown-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-brown-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-brown-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-teal-500 px-8 py-3 font-semibold text-white hover:bg-teal-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
