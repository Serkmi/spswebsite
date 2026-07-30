"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Light is the default: this is a reading site, and dark grounds cost legibility
 * over long-form prose. Dark is opt-in, and it's where the metallic actually works.
 *
 * The source of truth is the `dark` class on <html>, written by `themeScript`
 * before first paint. `useSyncExternalStore` reads it rather than mirroring it
 * into an effect, which is what keeps this off React's cascading-render path.
 * Matches StyleToggle — the two are independent axes but share this shape.
 */

const EVENT = "themechange";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

const isDark = () => document.documentElement.classList.contains("dark");
const serverDefault = () => false; // light

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, serverDefault);

  const toggle = useCallback(() => {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // private mode — the class still applies for this session
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return (
    <button
      onClick={toggle}
      aria-pressed={dark}
      className="lbl cursor-pointer rounded-[2px] border border-rule-strong px-[0.7rem]
                 py-[0.45rem] transition-colors hover:border-link hover:text-link"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

/**
 * Applies the stored theme before first paint so dark-mode users never see a
 * white flash. Must run blocking in <head>.
 */
export const themeScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){
    document.documentElement.classList.add('dark');
  }
}catch(e){}})();
`;
