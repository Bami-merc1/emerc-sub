// EmercSub Design Tokens
// Reference direction: Steganaliz / PortSwigger — corporate, technical, restrained

export const colors = {
  // Base
  white: "#FFFFFF",
  background: "#FAFAFA",

  // Structure (header, nav, footer)
  charcoal: {
    900: "#0D0D0D",
    800: "#111827",
    700: "#1F2937",
  },

  // Text
  text: {
    primary: "#111827",   // headings
    secondary: "#4B5563", // body
    muted: "#9CA3AF",     // captions, timestamps
  },

  // Borders
  border: {
    DEFAULT: "#E5E7EB",
    strong: "#D1D5DB",
  },

  // Accent — Emerald (primary actions, active states, balances)
  accent: {
    50:  "#ECFDF5",
    100: "#D1FAE5",
    500: "#10B981",
    600: "#059669",  // primary button/action color
    700: "#047857",  // hover state
    900: "#064E3B",
  },

  // Status colors (transaction states)
  status: {
    success: "#059669",  // reuse accent-600
    pending: "#D97706",  // amber
    failed:  "#DC2626",  // red
  },
};

export const fonts = {
  sans: ["Inter", "system-ui", "sans-serif"],
  mono: ["JetBrains Mono", "ui-monospace", "monospace"], // for refs, amounts, technical data
};

export const typography = {
  label: "text-xs font-semibold uppercase tracking-wide text-gray-500", // e.g. "QUICK ACTIONS"
  heading: "text-2xl font-bold text-gray-900",
  body: "text-sm text-gray-600",
};