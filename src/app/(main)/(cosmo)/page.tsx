import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { generateMetadata } from "@/utils/generateMetadata";
import NoScrollLayout from "@/components/layouts/NoScrollLayout";
import PageHeading from "@/components/customs/headings/PageHeading";
import Separator from "@/components/customs/Separator";

// Dynamic imports with loading states
const  CosmoClient = dynamic(() =>
  import("@/components/customs/CosmoClient").then((mod) => mod.default),
);

const OnboardingModal = dynamic(() =>
  import("@/components/customs/modals/OnboardingModal").then(
    (mod) => mod.default,
  ),
);

const BlacklistedModal = dynamic(() =>
  import("@/components/customs/modals/BlacklistedModal").then(
    (mod) => mod.default,
  ),
);

const CustomCardView = dynamic(() =>
  import("@/components/customs/CustomCardView").then((mod) => mod.default),
);

const CosmoBuySettings = dynamic(() =>
  import("@/components/customs/CosmoBuySettings").then((mod) => mod.default),
);

const CosmoListTabSection = dynamic(() =>
  import("@/components/customs/sections/CosmoListTabSection").then(
    (mod) => mod.default,
  ),
);

export const metadata = generateMetadata({
  title: "Cosmo",
});

export default async function Home() {
  const isNew = (await cookies()).get("isNew")?.value === "true";
  if (isNew) {
    redirect("/login");
  }
  const initialIsNewUser =
    (await cookies()).get("_is_new_user")?.value === "true";

  return (
    <>
      <CosmoClient initialIsNewUser={initialIsNewUser} />
      {initialIsNewUser && <OnboardingModal />}
    </>
  );
}
