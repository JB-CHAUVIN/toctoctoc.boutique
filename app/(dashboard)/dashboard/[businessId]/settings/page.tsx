import { redirect } from "next/navigation";

export default function BusinessSettingsPage({ params }: { params: { businessId: string } }) {
  redirect(`/dashboard/${params.businessId}/info`);
}
