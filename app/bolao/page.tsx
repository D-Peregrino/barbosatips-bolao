import { AdSlot } from "@/components/ads/AdSlot";
import { CommercialPageShell } from "@/components/layout/CommercialPageShell";
import BolaoInscricaoClient from "@/app/bolao/BolaoInscricaoClient";

export default function BolaoPage() {
  return (
    <div className="commercial-page-bg pb-20">
      <CommercialPageShell mainClassName="pb-6">
        <div className="space-y-6 lg:space-y-0">
          <div className="lg:hidden">
            <AdSlot variant="banner-horizontal" intent="ads" />
          </div>
          <BolaoInscricaoClient />
          <div className="lg:hidden">
            <AdSlot variant="mobile-inline" intent="sponsor" />
          </div>
        </div>
      </CommercialPageShell>
    </div>
  );
}
