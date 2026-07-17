import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#f5e9d7]">Painel de Administração</h2>
        <nav className="flex gap-3">
          <Link href="/admin/personagens" className="rounded-md bg-white/[0.03] px-3 py-2 text-sm text-[#a98b68] hover:bg-white/[0.06]">
            Personagens
          </Link>
        </nav>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">{children}</div>
    </div>
  );
}
