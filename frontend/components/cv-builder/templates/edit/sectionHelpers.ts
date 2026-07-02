import type { CVSection } from "@/types";

type FieldChange = (section: CVSection, newData: Record<string, any>) => void;

/** Patches a top-level key on section.data (e.g. summary, text, signature). */
export function makeFieldSetter(section: CVSection, onFieldChange: FieldChange) {
  return (key: string, value: any) => {
    onFieldChange(section, { ...section.data, [key]: value });
  };
}

/** Patches a key on one item of section.data.entries by array index. */
export function makeEntrySetter(section: CVSection, onFieldChange: FieldChange) {
  const entries = section.data?.entries ?? [];
  return (index: number, key: string, value: any) => {
    const next = entries.map((e: any, i: number) => (i === index ? { ...e, [key]: value } : e));
    onFieldChange(section, { ...section.data, entries: next });
  };
}

/** Patches a bullet's text within one entry's bullets array. */
export function makeBulletSetter(section: CVSection, onFieldChange: FieldChange) {
  const entries = section.data?.entries ?? [];
  return (entryIndex: number, bulletIndex: number, value: string) => {
    const next = entries.map((e: any, i: number) => {
      if (i !== entryIndex) return e;
      const bullets = (e.bullets ?? []).map((b: any, j: number) =>
        j === bulletIndex ? { ...b, text: value } : b
      );
      return { ...e, bullets };
    });
    onFieldChange(section, { ...section.data, entries: next });
  };
}
