import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFootballFixtureDetailView } from "@/components/admin/football-api/AdminFootballFixtureDetailView";
import { loadFixtureEditorialDetail } from "@/lib/api-football/load-fixture-detail";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type Props = { params: { fixtureId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.fixtureId;
  return {
    title: `Fixture #${id} · API-Football · Admin · ${siteConfig.shortTitle}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminFootballFixtureDetailPage({ params }: Props) {
  const fixtureId = Number(params.fixtureId);
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    notFound();
  }

  const result = await loadFixtureEditorialDetail(fixtureId);
  if (!result.ok) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <p className="text-sm text-red-300">{result.error}</p>
        <Link
          href="/admin/football-api"
          className="text-sm text-gold-400 hover:text-gold-300"
        >
          Voltar à listagem
        </Link>
      </div>
    );
  }

  return <AdminFootballFixtureDetailView detail={result.detail} />;
}
