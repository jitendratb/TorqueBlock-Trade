// Dedicated simple layout for product pages (/tyres/<tyre> and /tyres/<tyre>/<size>).
export default function TyreLayout({ children }) {
  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#0B0F19] pt-20 sm:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
