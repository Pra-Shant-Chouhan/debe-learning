"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg font-sans text-xs rounded-xl p-4",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-orange-600 group-[.toast]:text-white font-medium",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
          success:
            "group-[.toast]:border-emerald-200 group-[.toast]:bg-emerald-50/90 group-[.toast]:text-emerald-950",
          error:
            "group-[.toast]:border-rose-200 group-[.toast]:bg-rose-50/90 group-[.toast]:text-rose-950",
        },
      }}
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
};

export { Toaster };
