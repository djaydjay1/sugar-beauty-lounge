import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// Public booking endpoint — used by the booking page client-side
// (also works as a server-side fallback)
export async function POST(req: NextRequest) {
  const { client, appointment } = await req.json();

  if (!client?.name || !client?.phone || !appointment?.service_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Upsert client
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .upsert({ name: client.name, phone: client.phone, email: client.email || null }, { onConflict: "phone" })
    .select()
    .single();

  if (clientError || !clientData) {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }

  // Get service duration
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", appointment.service_id)
    .single();

  const duration = service?.duration_minutes || 60;
  const [h, m] = appointment.start_time.split(":").map(Number);
  const endMinutes = h * 60 + m + duration;
  const end_time = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  // Insert appointment
  const { data: appt, error: apptError } = await supabase
    .from("appointments")
    .insert({
      client_id: clientData.id,
      staff_id: appointment.staff_id,
      service_id: appointment.service_id,
      location_id: appointment.location_id,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time,
      status: "pending",
      source: "website",
      notes: appointment.notes || null,
    })
    .select()
    .single();

  if (apptError) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }

  return NextResponse.json({ appointment: appt, client: clientData });
}
