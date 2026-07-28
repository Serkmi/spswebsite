"use client";

import { useEffect, useState } from "react";

/**
 * Light is the default: this is a reading site, and dark grounds cost legibility
 * over long-form prose. Dark is opt-in, and it's where the metallic actually works.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // private mode — the class still applies for this session
    }
  }

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
