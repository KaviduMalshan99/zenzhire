"use client";

import { createContext, useContext } from "react";
import type { CVSection } from "@/types";

export interface CVEditContextValue {
  editable: boolean;
  onFieldChange: (section: CVSection, newData: Record<string, any>) => void;
  onReorder: (sections: CVSection[]) => void;
  /** Whether THIS render of the section (there may be one per A4 page-card) is the one allowed to register as a drag source/target. */
  isDragTarget: (sectionId: number) => boolean;
}

const noop = () => {};

const CVEditContext = createContext<CVEditContextValue>({
  editable: false,
  onFieldChange: noop,
  onReorder: noop,
  isDragTarget: () => false,
});

export function CVEditProvider({
  value,
  children,
}: {
  value: CVEditContextValue;
  children: React.ReactNode;
}) {
  return <CVEditContext.Provider value={value}>{children}</CVEditContext.Provider>;
}

export function useCVEdit(): CVEditContextValue {
  return useContext(CVEditContext);
}
