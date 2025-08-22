"use client"
import { useEffect } from "react";

import LandingPage from "../landing-page"

export default function Page() {
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);
  return <LandingPage />
}