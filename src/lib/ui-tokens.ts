// Centralized Tailwind class constants for shared component patterns.
// Import with: import { UI } from "@/lib/ui-tokens"
// Use with: className={cn(UI.card, "additional-classes")}
//
// These replace the scattered ad-hoc class strings in VASForm, JobCardForm,
// AdminDashboard cards, etc. Update here to propagate everywhere.

export const UI = {
  // ── Cards ──────────────────────────────────────────────────────────────
  card: "bg-card border border-border rounded-xl shadow-[var(--shadow-sm)]",
  cardHover:
    "bg-card border border-border rounded-xl shadow-[var(--shadow-sm)] ui-lift cursor-pointer",
  cardSection:
    "bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]",

  // ── Card sub-sections ──────────────────────────────────────────────────
  cardHeader:
    "px-6 py-5 border-b border-border bg-gradient-to-r from-muted/50 to-card",
  cardBody: "p-6",

  // ── Inputs ─────────────────────────────────────────────────────────────
  // Use .ui-input CSS class in plain HTML inputs.
  // For React controlled inputs:
  input:
    "w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-[border-color,box-shadow] duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  textarea:
    "w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-[border-color,box-shadow] duration-200 resize-none disabled:opacity-50",

  // ── Labels ─────────────────────────────────────────────────────────────
  label: "block text-sm font-medium text-foreground mb-1.5",
  labelMuted:
    "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5",

  // ── Buttons — use shadcn <Button> variants for primary actions.
  // These are for custom buttons outside shadcn (e.g., icon actions, inline row actions).
  btnGhost:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted ui-smooth-fast",
  btnDestructiveGhost:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 ui-smooth-fast",
  btnIconSm:
    "inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted ui-smooth-fast",

  // ── Badges / Status ────────────────────────────────────────────────────
  badgeBase:
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
  badgeGreen: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  badgeRed: "bg-red-500/10 text-red-700 border border-red-500/20",
  badgeYellow: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  badgeGray: "bg-muted text-muted-foreground border border-border",
  badgeBlue: "bg-blue-500/10 text-blue-700 border border-blue-500/20",

  // ── Tables ─────────────────────────────────────────────────────────────
  tableHeader:
    "text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 border-b border-border bg-muted/30",
  tableCell: "px-4 py-3 text-sm text-foreground",
  tableRow: "border-b border-border table-row-hover last:border-0",

  // ── Stat cards ─────────────────────────────────────────────────────────
  statCard:
    "bg-card border border-border rounded-xl p-5 shadow-[var(--shadow-sm)]",
  statValue: "text-2xl font-bold text-foreground tracking-tight",
  statLabel:
    "text-xs font-medium text-muted-foreground uppercase tracking-wide mt-0.5",

  // ── Page layout ────────────────────────────────────────────────────────
  pageTitle: "text-2xl md:text-3xl font-bold text-foreground tracking-tight",
  pageSubtitle: "text-sm text-muted-foreground mt-1",

  // ── Dividers ───────────────────────────────────────────────────────────
  divider: "border-t border-border",
  dividerMuted: "border-t border-border/50",

  // ── Icon containers ────────────────────────────────────────────────────
  iconBox:
    "flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-xs)]",
  iconBoxMuted:
    "flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-muted-foreground",
  iconBoxRed:
    "flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-[var(--shadow-xs)]",
} as const;

// ── Type helper ──────────────────────────────────────────────────────────────
export type UIToken = keyof typeof UI;

// ── Usage example ────────────────────────────────────────────────────────────
// import { UI } from "@/lib/ui-tokens";
// import { cn } from "@/lib/utils";
//
// <div className={cn(UI.cardSection)}>
//   <div className={cn(UI.cardHeader)}>
//     <div className={cn(UI.iconBoxRed)}><Icon /></div>
//     <h2 className={cn(UI.pageTitle)}>Title</h2>
//   </div>
//   <div className={cn(UI.cardBody)}>
//     <input className={cn(UI.input)} />
//   </div>
// </div>
