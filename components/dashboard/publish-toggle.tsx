"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface PublishToggleProps {
  businessId: string;
  isPublished: boolean;
}

export function PublishToggle({ businessId, isPublished }: PublishToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/business/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !published }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Erreur");
    } else {
      setPublished(!published);
      toast.success(!published ? "Commerce mis en ligne !" : "Commerce repassé en brouillon");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition disabled:opacity-50 ${
        published
          ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          : "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      {published ? (
        <>
          <EyeOff className="h-3.5 w-3.5" />
          Passer en brouillon
        </>
      ) : (
        <>
          <Globe className="h-3.5 w-3.5" />
          Mettre en ligne
        </>
      )}
    </button>
  );
}
