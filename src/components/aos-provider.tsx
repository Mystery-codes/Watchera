"use client";

import { useEffect } from "react";
import AOS from "aos";

export function AOSProvider() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });
  }, []);

  return null;
}
