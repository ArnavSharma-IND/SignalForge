// shadcn/ui-style primitives (same cn() + variant pattern); swap for `npx shadcn add` components anytime.
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...a: any[]) => twMerge(clsx(a));
export const Card = ({ className, ...p }: any) => <div className={cn("rounded-lg border border-white/10 bg-white/[0.03] p-5", className)} {...p} />;
const tones: any = {
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", red: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30", slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30", purple: "bg-violet-500/15 text-violet-300 border-violet-500/30" };
export const Badge = ({ tone = "slate", className, ...p }: any) => <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium", tones[tone], className)} {...p} />;
export const Btn = ({ variant = "primary", className, ...p }: any) => (
  <button className={cn("inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-300",
    variant === "primary" ? "bg-indigo-500 text-white hover:bg-indigo-400" : "border border-white/20 text-slate-200 hover:bg-white/10", className)} {...p} />);
