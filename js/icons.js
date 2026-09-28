/* Category → tint colour + inline icon.
   Used in place of photography so the prototype has no
   external image dependency. Swap card-thumb markup for an
   <img> once real listing photos come from the backend. */

const CATEGORY_STYLE = {
  "Tools & Equipment":    { tint: "#FBE8C4", stroke: "#9A6410" },
  "Cameras & Electronics":{ tint: "#D3EADF", stroke: "#17603F" },
  "Party & Events":       { tint: "#FADCD3", stroke: "#B4432A" },
  "Sports & Outdoors":    { tint: "#DCEBD3", stroke: "#3B6B2A" },
  "Vehicles":             { tint: "#E5DFF6", stroke: "#54429B" },
  "Home & Garden":        { tint: "#D2E7EE", stroke: "#1E6478" },
  "Furniture":            { tint: "#F4E1CC", stroke: "#8A5220" }
};

const CATEGORY_ICON_PATH = {
  "Tools & Equipment": `<path d="M14.7 6.3a3 3 0 0 1-3.9 3.9L5 16v3h3l5.8-5.8a3 3 0 0 1 3.9-3.9l2.6-2.6-1.4-1.4-2.6 2.6-1.6-1.6 2.6-2.6-1.4-1.4-2.6 2.6z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  "Cameras & Electronics": `<rect x="3.5" y="7" width="17" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 7l1.4-2.2h5.2L16 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  "Party & Events": `<path d="M4 20l3.2-9.6a5 5 0 0 1 9.5 0L20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="6" r="1.6" fill="currentColor"/><path d="M8 20h8" stroke="currentColor" stroke-width="1.4"/>`,
  "Sports & Outdoors": `<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="1"/>`,
  "Vehicles": `<path d="M4 16V11l2-4h12l2 4v5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="7.5" cy="16.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="16.5" cy="16.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.4"/>`,
  "Home & Garden": `<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  "Furniture": `<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="4" y="11" width="16" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 16v3M19 16v3" stroke="currentColor" stroke-width="1.4"/>`
};

function categoryThumbHTML(category, extraStyle) {
  const s = CATEGORY_STYLE[category] || { tint: "#E3E9E4", stroke: "#52635A" };
  const path = CATEGORY_ICON_PATH[category] || CATEGORY_ICON_PATH["Tools & Equipment"];
  return `<div class="card-thumb" style="background:${s.tint}; color:${s.stroke}; ${extraStyle || ""}">
    <svg viewBox="0 0 24 24">${path}</svg>
  </div>`;
}

function categoryRowThumbHTML(category) {
  const s = CATEGORY_STYLE[category] || { tint: "#E3E9E4", stroke: "#52635A" };
  const path = CATEGORY_ICON_PATH[category] || CATEGORY_ICON_PATH["Tools & Equipment"];
  return `<span class="row-thumb" style="background:${s.tint}; color:${s.stroke}">
    <svg viewBox="0 0 24 24">${path}</svg>
  </span>`;
}
