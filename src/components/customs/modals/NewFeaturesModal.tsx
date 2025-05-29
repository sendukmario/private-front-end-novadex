"use client";

import { useState, useEffect, forwardRef, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { IoFlash, IoFlashOutline, IoClose } from "react-icons/io5";
import { newFeatures } from "@/constants/new-features";
import { cn } from "@/libraries/utils";
import { useRouter } from "next/navigation";

interface NewFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewFeaturesViewProps {
  handleClose: () => void;
  handleNext: () => void;
  handleStep: (index: number) => void;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
}

interface NavigationButtonProps {
  label: string;
  isActive?: boolean;
  onTap: () => void;
}

export default function NewFeatureModal({
  isOpen,
  onClose,
}: NewFeatureModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = newFeatures.length;

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  // Navigate to index
  const handleStep = (index: number) => {
    if (currentStep !== index) {
      setCurrentStep(index);
    }
  };

  // Effect to check if modal should be shown
  useEffect(() => {
    if (isOpen) {
      // You can add any initialization logic here
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <NewFeaturesView
          handleClose={onClose}
          handleNext={handleNext}
          handleStep={handleStep}
          onClose={onClose}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      )}
    </AnimatePresence>
  );
}

const NewFeaturesView = ({
  handleClose,
  handleNext,
  handleStep,
  onClose,
  currentStep,
  totalSteps,
}: NewFeaturesViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const currentFeature = newFeatures[currentStep];
  const refs = useRef<HTMLDivElement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const el = refs.current[currentStep];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentStep]);

  useEffect(() => {
    setIsLoading(true);
    
    // Cleanup function when component unmounts or when step changes
    return () => {
      setIsLoading(false);
    };
  }, [currentStep]);

  const handleTryItOut = () => {
    if (isLoading) return;
    
    // Close modal first for better UX
    handleClose();
    
    // Use a small timeout to ensure modal animation completes
    setTimeout(() => {
      router.push(currentFeature.route);
    }, 100);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/[12%] backdrop-blur-[3px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed left-1/2 top-1/2 z-[300] h-auto w-full max-w-[90%] -translate-x-1/2 -translate-y-1/2 md:max-w-[800px] md:p-4"
      >
        <div className="flex h-full w-full flex-col gap-y-7 rounded-[8px] border-2 border-solid border-[#242436] bg-[#080811]">
          {/* Content Container */}
          <div className="relative h-auto w-full overflow-hidden rounded-t-[6px]">
            <button
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white bg-opacity-10 text-center"
              onClick={handleClose}
            >
              <IoClose className="text-center text-lg text-white" />
            </button>

            <div className="flex flex-col divide-gray-700/40 max-sm:divide-y-2 sm:flex-row sm:divide-x-2">
              {/* Navigation Button */}
              <div className="flex w-full flex-col p-5 sm:w-[30%]">
                <h1 className="font-geistSemiBold text-2xl text-white">
                  Try The New Feature
                </h1>

                <div className="mt-5 flex flex-row gap-1 overflow-auto sm:flex-col">
                  {[...Array(totalSteps)].map((_, index) => (
                    <div
                      key={index}
                      ref={(el) => {
                        if (el) refs.current[index] = el;
                      }}
                    >
                      <NavigationButton
                        label={newFeatures[index].title}
                        isActive={currentStep === index}
                        onTap={() => handleStep(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Container */}
              <div className="relative w-full sm:w-[70%]">
                {isLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-800/40"></div>
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                )}
                <Image
                  src={currentFeature.image}
                  alt={currentFeature.title}
                  width={700}
                  height={400}
                  quality={100}
                  className={`h-auto w-full transition-opacity duration-300 ${isLoading ? "opacity-20" : "opacity-100"}`}
                  priority
                  onLoad={() => setIsLoading(false)}
                />

                {/* Text Container */}
                <div className="p-5">
                  {isLoading ? (
                    <>
                      <div className="mx-auto mb-3 h-8 w-1/2 animate-pulse rounded bg-gray-700/40"></div>
                      <div className="mx-auto w-full max-w-[500px] space-y-2">
                        <div className="h-4 animate-pulse rounded bg-gray-700/40"></div>
                        <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-700/40"></div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full max-w-[600px]">
                      <h2 className="mb-3 font-geistSemiBold text-[20px] leading-tight text-fontColorPrimary md:text-lg">
                        {currentFeature.title}
                      </h2>

                      <p className="text-[16px] leading-[20px] text-fontColorSecondary md:text-base">
                        {currentFeature.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bottom-0 right-0 flex justify-end gap-x-2 px-5 pb-4 sm:absolute sm:gap-x-4">
                  <BaseButton
                    onClick={handleTryItOut}
                    variant="gray"
                    className={`h-[40px] w-[50%] text-[16px] transition-all duration-200 sm:h-[48px] sm:w-[100px] sm:text-base ${
                      isLoading
                        ? "opacity-50"
                        : "hover:scale-105 hover:shadow-md active:scale-95"
                    }`}
                    disabled={isLoading}
                  >
                    <span
                      className={`inline-block font-geistSemiBold text-white`}
                    >
                      Try it out
                    </span>
                  </BaseButton>
                  <BaseButton
                    onClick={handleNext}
                    variant="primary"
                    className={`h-[40px] w-[50%] text-[16px] transition-all duration-200 sm:h-[48px] sm:w-[70px] sm:text-base ${
                      isLoading
                        ? "opacity-50"
                        : "hover:scale-105 hover:shadow-md active:scale-95"
                    }`}
                    disabled={isLoading}
                  >
                    <span className="inline-block font-geistSemiBold text-[#080811]">
                      {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                    </span>
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const NavigationButton = forwardRef<HTMLButtonElement, NavigationButtonProps>(
  ({ label, isActive, onTap }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onTap}
        className={cn(
          "flex text-start flex-row items-center rounded-lg bg-opacity-10 hover:bg-[#DF74FF] hover:bg-opacity-10",
          "px-1 py-1 sm:px-2 sm:py-2",
          "w-32 sm:w-full",
          "text-base sm:text-sm",
          "font-geistLight sm:font-geistSemiBold",
          isActive
            ? "bg-[#DF74FF] text-primary"
            : "bg-[#17171F] text-[#9191A4] sm:bg-transparent",
        )}
      >
        <div
          className={cn(
            "h-7 w-1 rounded bg-primary",
            isActive ? "visible" : "invisible",
          )}
        ></div>

        {isActive ? (
          <IoFlash className="mx-2 text-xl text-primary" />
        ) : (
          <IoFlashOutline className="mx-2 text-xl text-[#9191A4]" />
        )}

        {label}
      </button>
    );
  },
);

NavigationButton.displayName = "NavigationButton";
