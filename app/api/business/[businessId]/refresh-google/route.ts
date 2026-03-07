import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extractSearchQuery,
  fetchViaPlacesAPI,
  cleanAddress,
} from "@/lib/google-places";

export async function POST(
  req: Request,
  { params }: { params: { businessId: string } },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Admin only
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès réservé aux admins" }, { status: 403 });
  }

  const business = await prisma.business.findUnique({
    where: { id: params.businessId },
    select: {
      id: true,
      name: true,
      googleMapsUrl: true,
      reviewConfig: { select: { id: true, googleUrl: true } },
    },
  });

  if (!business) {
    return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });
  }

  // On a besoin d'une URL Google Maps pour rafraîchir
  const googleUrl = business.googleMapsUrl;
  if (!googleUrl) {
    return NextResponse.json(
      { error: "Aucune URL Google Maps configurée pour ce commerce. Ajoutez-en une dans les paramètres." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY non configurée" },
      { status: 500 },
    );
  }

  try {
    const { query, lat, lng, placeId } = extractSearchQuery(googleUrl);
    const coords = lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
    const searchQuery = query || business.name;

    console.log(`[RefreshGoogle] Business "${business.name}" — URL: ${googleUrl}`);

    let data = await fetchViaPlacesAPI(searchQuery, googleUrl, coords, placeId);

    if (!data) {
      return NextResponse.json(
        { error: "Impossible de récupérer les données depuis Google" },
        { status: 422 },
      );
    }

    data = cleanAddress(data);

    // Build update object — only update non-null fields
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.zipCode) updateData.zipCode = data.zipCode;
    if (data.phone) updateData.phone = data.phone;
    if (data.website) updateData.website = data.website;
    if (data.googleMapsUrl) updateData.googleMapsUrl = data.googleMapsUrl;
    if (data.googleRating !== null) updateData.googleRating = data.googleRating;
    if (data.googleReviewCount !== null) updateData.googleReviewCount = data.googleReviewCount;
    if (data.businessType) updateData.businessType = data.businessType;

    const updated = await prisma.business.update({
      where: { id: params.businessId },
      data: updateData,
    });

    // Update reviewConfig.googleUrl if we got a reviewUrl
    if (data.reviewUrl && business.reviewConfig) {
      await prisma.reviewConfig.update({
        where: { id: business.reviewConfig.id },
        data: { googleUrl: data.reviewUrl },
      });
    }

    console.log(`[RefreshGoogle] Business "${updated.name}" mis à jour`);

    return NextResponse.json({
      success: true,
      data: {
        name: updated.name,
        googleRating: updated.googleRating,
        googleReviewCount: updated.googleReviewCount,
        address: updated.address,
        city: updated.city,
        zipCode: updated.zipCode,
        phone: updated.phone,
        website: updated.website,
        businessType: updated.businessType,
      },
    });
  } catch (error) {
    console.error(`[RefreshGoogle] Erreur :`, error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
