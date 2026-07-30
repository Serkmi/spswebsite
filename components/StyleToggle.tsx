"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A style is a token block (see design/). This switches between rev 3
 * (`ledger`, flat grounds) and rev 4 (`lacquer`, raked dark ground with masked
 * flake). Independent of light/dark — never couple the two axes.
 *
 * `ledger` is the default, so a visitor who never touches this sees exactly
 * what the site looked like before rev 4.
 *
 * The source of truth is the `data-style` attribute, written by `styleScript`
 * before first paint. `useSyncExternalStore` reads it rather than mirroring it
 * into an effect, which is what keeps this off React's cascading-render path.
 */

const EVENT = "stylechange";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

const isLacquer = () => document.documentElement.dataset.style === "lacquer";
const serverDefault = () => false; // ledger

export function StyleToggle() {
  const lacquer = useSyncExternalStore(subscribe, isLacquer, serverDefault);

  const toggle = useCallback(() => {
    const next = !isLacquer();
    document.documentElement.dataset.style = next ? "lacquer" : "ledger";
    try {
      localStorage.setItem("style", next ? "lacquer" : "ledger");
    } catch {
      // private mode — the attribute still applies for this session
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return (
    <button
      onClick={toggle}
      aria-pressed={lacquer}
      title="Switch design system version"
      className="lbl cursor-pointer rounded-[2px] border border-rule-strong px-[0.7rem]
                 py-[0.45rem] transition-colors hover:border-link hover:text-link"
    >
      {lacquer ? "Rev 4" : "Rev 3"}
    </button>
  );
}

/**
 * Applies the stored style before first paint, alongside the theme script, so
 * the ground never flashes from flat to raked. Must run blocking in <head>.
 */
export const styleScript = `
(function(){try{
  var s=localStorage.getItem('style');
  document.documentElement.dataset.style=(s==='lacquer')?'lacquer':'ledger';
}catch(e){document.documentElement.dataset.style='ledger';}})();
`;
