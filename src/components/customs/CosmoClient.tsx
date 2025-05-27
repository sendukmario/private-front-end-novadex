/* eslint-disable react/no-unescaped-entities */
"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useCallback, useEffect } from "react";
import cookies from "js-cookie";
// ######## Components 🧩 ########
import Preloader from "@/components/customs/Preloader";
import NewFeatureModal from "./modals/NewFeaturesModal";
import NoScrollLayout from "../layouts/NoScrollLayout";
import PageHeading from "./headings/PageHeading";
import BlacklistedModal from "./modals/BlacklistedModal";
import CustomCardView from "./CustomCardView";
import CosmoBuySettings from "./CosmoBuySettings";
import Separator from "./Separator";
import CosmoListTabSection from "./sections/CosmoListTabSection";
import { cn } from "@/libraries/utils";
import { usePopupStore } from "@/stores/use-popup-state";

interface CosmoClientProps {
  initialIsNewUser: boolean;
}

const CosmoClient = ({ initialIsNewUser }: CosmoClientProps) => {
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isInitialFetchFinished] = useState<boolean>(true);
  const [isNewFeatureModalOpen, setIsNewFeatureModalOpen] =
    useState<boolean>(false);

  // Check localStorage to see if we should show the new features modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldShowModal =
        localStorage.getItem("show_new_features_modal") === "true";
      if (shouldShowModal) {
        setIsNewFeatureModalOpen(true);
        // Clear the flag so it only shows once after login
        localStorage.removeItem("show_new_features_modal");
      }
    }
  }, []);

  const handleCloseNewFeatureModal = useCallback(() => {
    setIsNewFeatureModalOpen(false);
    // You can set a cookie here to remember that the user has seen the modal
    cookies.set("_has_seen_new_feature_modal", "true", { expires: 30 });
  }, []);

  useEffect(() => {
    setIsPageLoading(false);
  }, [isInitialFetchFinished]);

  const remainingScreenWidth = usePopupStore(
    (state) => state.remainingScreenWidth,
  );

  return (
    <>
      <NoScrollLayout>
        <div
          className={cn(
            "flex w-full flex-col justify-between gap-y-2 px-4 pb-4 pt-4 lg:px-0 xl:flex-row xl:gap-y-4",
            remainingScreenWidth >= 1314.9 || isPageLoading
              ? "xl:flex-row"
              : "xl:flex-col",
          )}
        >
          <div className="flex items-center gap-x-2">
            <PageHeading
              title="The Cosmo"
              description="Real-time feed of tokens throughout their lifespan."
              line={1}
            />
            <BlacklistedModal />
          </div>

          <div className="flex items-center gap-x-2">
            <CustomCardView />
            <CosmoBuySettings />
          </div>
        </div>

        <Separator color="#242436" className="hidden xl:block" />

        <CosmoListTabSection />
      </NoScrollLayout>
      {initialIsNewUser && (
        <Preloader vanillaCSSAnimation vanillaLoadingState={isPageLoading} />
      )}

      <NewFeatureModal
        isOpen={isNewFeatureModalOpen}
        onClose={handleCloseNewFeatureModal}
      />
    </>
  );
};

export default React.memo(CosmoClient);
