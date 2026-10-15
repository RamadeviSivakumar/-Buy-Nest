export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#fffdf9]">
      <div className="h-8 bg-[#25382b]" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <div className="h-8 w-40 rounded-lg bg-[#e6ddd2]" />
        <div className="h-8 w-24 rounded-lg bg-[#e6ddd2]" />
      </div>
      <div className="bg-[#f7efe5] px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
          <div className="space-y-6 py-8">
            <div className="h-5 w-40 rounded-full bg-[#e6d8c9]" />
            <div className="h-20 w-full rounded-2xl bg-[#e6d8c9]" />
            <div className="h-16 w-4/5 rounded-2xl bg-[#e6d8c9]" />
            <div className="h-12 w-40 rounded-full bg-[#e6d8c9]" />
          </div>
          <div className="h-96 rounded-[32px] bg-[#e6d8c9]" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-16 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-56 rounded-3xl bg-[#eee9e2]" />
        ))}
      </div>
    </div>
  );
}
