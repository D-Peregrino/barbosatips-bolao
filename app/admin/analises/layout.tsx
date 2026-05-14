/**
 * Layout comum do admin editorial (rotas sob /admin/analises/*).
 * Autenticação por senha desativada temporariamente para desenvolvimento.
 */
export default function AdminAnalisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        role="status"
        className="border-b border-amber-600/50 bg-amber-950/95 px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-amber-100"
      >
        Admin editorial temporariamente sem senha
      </div>
      {children}
    </>
  );
}
