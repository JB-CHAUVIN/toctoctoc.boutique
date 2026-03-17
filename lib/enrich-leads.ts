import { prisma } from "@/lib/prisma";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

/**
 * Enrichit les leads qui ont un osmId `g:{place_id}` mais pas de website ni phone.
 * Appelle Google Place Details pour chaque lead (en parallèle par batch de 5).
 * Met à jour directement en base.
 */
export async function enrichLeadsWithDetails(streetId: string): Promise<number> {
  const leads = await prisma.prospectLead.findMany({
    where: {
      streetId,
      osmId: { startsWith: "g:" },
      website: null,
      phone: null,
    },
    select: { id: true, osmId: true },
  });

  if (leads.length === 0) return 0;

  let enriched = 0;
  const BATCH_SIZE = 5;

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (lead) => {
        const placeId = lead.osmId!.replace("g:", "");
        try {
          const url = `https://maps.googleapis.com/maps/api/place/details/json?${new URLSearchParams({
            place_id: placeId,
            fields: "website,formatted_phone_number",
            key: GOOGLE_API_KEY,
            language: "fr",
          })}`;

          const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (!res.ok) return;

          const data = await res.json();
          if (data.status !== "OK") return;

          const website = data.result?.website || null;
          const phone = data.result?.formatted_phone_number || null;

          if (website || phone) {
            await prisma.prospectLead.update({
              where: { id: lead.id },
              data: {
                ...(website ? { website } : {}),
                ...(phone ? { phone } : {}),
              },
            });
            enriched++;
          }
        } catch {
          // Timeout ou erreur réseau — on skip ce lead
        }
      }),
    );
  }

  return enriched;
}
