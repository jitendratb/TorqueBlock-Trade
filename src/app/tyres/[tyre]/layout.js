// Dedicated simple layout for product pages (/tyres/<tyre> and /tyres/<tyre>/<size>).
export default function TyreLayout({ children }) {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#0B0F19] pt-[100px] min-[400px]:pt-[104px] sm:pt-[110px] lg:pt-[116px] pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
