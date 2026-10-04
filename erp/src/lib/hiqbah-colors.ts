// Hiqbah colours for code that cannot read CSS custom properties — Recharts
// series, SVG attributes, QR codes, canvas exports. These mirror the --hiqbah-*
// tokens in src/app/globals.css one for one; change both together. Screens that
// can use a class (bg-hq-primary, text-hq-muted …) should use the class instead.

export const HQ = {
  bg: "#F7F8F6",
  surface: "#FFFFFF",
  ink: "#25312B",
  muted: "#68756D",
  line: "#E1E6E0",
  neutral: "#F1F3EF",
  control: "#7E8B82",
  primary: "#405F4D",
  primaryStrong: "#33503F",
  primarySoft: "#EBF1EA",
  warning: "#95651E",
  warningSoft: "#FBF3E5",
  danger: "#A34435",
  dangerSoft: "#F9EEEB",
  info: "#4F6F86",
  chart1: "#405F4D",
  chart2: "#8A673A",
  chart3: "#4F6F86",
  chart4: "#755A83",
  chart5: "#6C7141",
} as const;
