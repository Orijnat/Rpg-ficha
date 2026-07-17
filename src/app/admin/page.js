import Link from "next/link";

export default function AdminIndex() {
  return (
    <div>
      <h3 className="text-lg font-medium text-[#f5e9d7]">Área administrativa</h3>
      <p className="mt-2 text-sm text-[#a98b68]">Gerencie dados dos personagens e modelos do sistema.</p>

      <div className="mt-6 flex gap-3">
        <Link href="/admin/personagens" className="rounded-md bg-[#d69a3d] px-4 py-2 font-medium text-[#17140f]">
          Gerenciar Personagens
        </Link>
      </div>
    </div>
  );
}
