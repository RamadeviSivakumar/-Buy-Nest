export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">
        You are offline!
      </h1>
      <p>Please check your internet connection.</p>
      <a href="/" className="mt-4 text-blue-600 underline">
        Try Again
      </a>
    </main>
  );
}