// Dedicated simple layout for product pages (/tyres/<tyre> and /tyres/<tyre>/<size>).
export default function TyreLayout({ children }) {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#0B0F19] pt-24 min-[400px]:pt-26 sm:pt-28 md:pt-30 lg:pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
