"use client";

import GetToKnowUs from "@/ui/components/aboutus/GetToKnowUs";
import OurServices from "@/ui/components/aboutus/OurServices";
import WhyChooseUs from "@/ui/components/aboutus/WhyChooseUs";
import ServiceCost from "@/ui/components/aboutus/ServiceCost";
import CourtLocation from "@/ui/components/aboutus/CourtLocation";


export default function PlayerAboutUsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <GetToKnowUs />

      <div className="mt-10 md:mt-14">
        <OurServices />
      </div>

      <div className="mt-10 md:mt-14">
        <WhyChooseUs />
      </div>

      <div className="mt-10 md:mt-14">
        <ServiceCost />
      </div>

      <div className="mt-10 md:mt-14">
        <CourtLocation />
      </div>
    </main>
  );
}
