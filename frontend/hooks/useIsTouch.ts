"use client";

import { useEffect, useState } from "react";

/** True on devices whose main pointer is a finger (phones, tablets), so UI text
 *  can say "Tap" instead of "Click". False during SSR and on mouse devices. */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isTouch;
}
