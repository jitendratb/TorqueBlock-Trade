// Dedicated simple layout for product pages (/tyres/<tyre> and /tyres/<tyre>/<size>).
export default function TyreLayout({ children }) {
  return (
    <main className="min-h-[calc(100dvh-120px)] bg-[#0B0F19] pt-[86px] min-[400px]:pt-[90px] sm:pt-[94px] lg:pt-[98px] pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
