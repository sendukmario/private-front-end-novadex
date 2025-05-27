// ######## Components 🧩 ########
import ScrollLayout from "@/components/layouts/ScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import ReferralHeader from "@/components/customs/ReferralHeader";
import ReferralTrackerSection from "@/components/customs/sections/ReferralTrackerSection";
import { generateMetadata } from "@/utils/generateMetadata";

export const metadata = generateMetadata({
  title: "Referral",
});

export default function ReferralPage() {
  return (
    <ScrollLayout withPadding={false}>
      <div className="relative z-20 flex w-full items-center justify-between border-t border-[#202037] px-4 py-3 lg:px-8 lg:py-4">
        <PageHeading
          title="Referral Tracker"
          description="Get a bonus as you share to people."
          line={1}
          showDescriptionOnMobile
        />

        <ReferralHeader />
      </div>

      <ReferralTrackerSection />
    </ScrollLayout>
  );
}
