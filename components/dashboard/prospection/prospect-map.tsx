"use client";

export interface ProspectLead {
  id: string;
  streetId: string;
  name: string;
  address: string | null;
  osmId: string | null;
  lat: number | null;
  lng: number | null;
  googleMapsUrl: string | null;
  phone: string | null;
  website: string | null;
  businessType: string | null;
  status: "DISCOVERED" | "CONTACTED" | "CONVERTED" | "DECLINED";
  businessId: string | null;
  notes: string | null;
  contactedAt: string | null;
  createdAt: string;
}

export interface ProspectStreet {
  id: string;
  name: string;
  city: string;
  geometry: unknown;
  leads: ProspectLead[];
  searchedAt: string;
  updatedAt: string;
}

export function ProspectMap({ initialStreets }: { initialStreets: ProspectStreet[] }) {
  return (
    <div className="flex h-full items-center justify-center p-8 text-slate-400">
      <p>Carte de prospection — en cours de développement ({initialStreets.length} rues chargées)</p>
    </div>
  );
}
