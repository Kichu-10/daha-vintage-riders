import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/events/$slug")({
  head: () => ({ meta: [{ title: "Event — DAHA Vintage MC" }] }),
  component: EventPage,
});

function EventPage() {
  const { slug } = Route.useParams();
  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    name: "", phone: "", email: "", school_college: "", team_name: "",
    participants: 1, payment_proof_url: "", payment_method: "", notes: "",
  });
  const [ticket, setTicket] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [memberStatus, setMemberStatus] = useState<"unknown" | "checking" | "approved" | "not_member">("unknown");

  async function verifyMember() {
    if (!form.phone.trim()) { toast.error("Enter your phone first"); return; }
    setMemberStatus("checking");
    const { data } = await supabase
      .from("memberships")
      .select("status, full_name")
      .eq("phone", form.phone.trim())
      .eq("status", "approved")
      .maybeSingle();
    if (data) {
      setMemberStatus("approved");
      setForm((f) => ({ ...f, name: f.name || data.full_name }));
      toast.success(`Welcome, ${data.full_name}`);
    } else {
      setMemberStatus("not_member");
      toast.error("Phone not found among approved members. Apply for membership first.");
    }
  }

  const register = useMutation({
    mutationFn: async () => {
      if (!event) throw new Error("Event not loaded");
      if (memberStatus !== "approved") throw new Error("Please verify membership before registering");
      let proofUrl = form.payment_proof_url || null;
      if (proofFile) {
        const path = `event-${event.id}-${Date.now()}-${proofFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
        if (upErr) throw upErr;
        proofUrl = supabase.storage.from("payment-proofs").getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await supabase.from("registrations").insert({
        event_id: event.id,
        name: form.name, phone: form.phone, email: form.email,
        school_college: form.school_college || null,
        team_name: form.team_name || null,
        participants: form.participants,
        payment_status: event.is_paid ? "pending" : "not_required",
        payment_proof_url: proofUrl,
        payment_method: form.payment_method || null,
        notes: form.notes || null,
      }).select("ticket_code").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setTicket(data.ticket_code);
      toast.success("Registration submitted!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-stencil tracking-widest">LOADING…</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="font-display text-4xl mb-4">Event not found</h1><Link to="/" className="text-accent">← Back home</Link></div></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/" className="font-stencil text-xs tracking-[0.4em] text-muted-foreground hover:text-accent">← BACK</Link>

        <div className="grid md:grid-cols-2 gap-10 mt-8">
          <div>
            {event.poster_url ? (
              <img src={event.poster_url} alt={event.title} className="w-full aspect-square object-cover border border-border" />
            ) : (
              <div className="w-full aspect-square bg-card border border-border flex items-center justify-center">
                <span className="font-display text-7xl text-accent/40">DAHA</span>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <div className="font-stencil text-[10px] tracking-[0.4em] text-accent">{event.event_type.toUpperCase()}</div>
              <h1 className="font-display text-5xl">{event.title}</h1>
              <div className="font-body text-muted-foreground">📅 {new Date(event.starts_at).toLocaleString()}</div>
              {event.venue && <div className="font-body text-muted-foreground">📍 {event.venue}</div>}
              {event.organizer && <div className="font-body text-sm text-muted-foreground">Organized by {event.organizer}</div>}
              {event.description && <p className="font-body text-foreground/80 mt-4">{event.description}</p>}
              {event.is_paid && (
                <div className="bg-card border border-accent/40 p-4 mt-4">
                  <div className="font-stencil text-[10px] tracking-[0.4em] text-accent">FEE</div>
                  <div className="font-display text-3xl">NPR {event.price}</div>
                  {event.capacity && <div className="text-xs text-muted-foreground">Limited to {event.capacity} riders</div>}
                </div>
              )}
            </div>
          </div>

          <div>
            {ticket ? (
              <div className="bg-card border-2 border-accent p-8 text-center">
                <div className="font-stencil text-xs tracking-[0.4em] text-accent mb-3">REGISTRATION CONFIRMED</div>
                <h2 className="font-display text-3xl mb-4">YOUR TICKET</h2>
                <div className="font-mono text-4xl tracking-widest bg-background py-6 mb-4">{ticket}</div>
                <p className="font-body text-sm text-muted-foreground">
                  {event.is_paid
                    ? "Your payment is pending verification. We'll confirm via WhatsApp/email within 24 hours."
                    : "See you at the start point. Ride safe."}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-3">Screenshot this ticket code.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); register.mutate(); }}
                className="bg-card border border-border p-6 space-y-3"
              >
                <h2 className="font-display text-2xl mb-2">REGISTER</h2>
                <div className="bg-background border border-accent/40 p-3 space-y-2">
                  <Label>Member phone *</Label>
                  <div className="flex gap-2">
                    <Input required placeholder="Your approved membership phone" value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setMemberStatus("unknown"); }} />
                    <Button type="button" variant="outline" onClick={verifyMember}>{memberStatus === "checking" ? "…" : "Verify"}</Button>
                  </div>
                  {memberStatus === "approved" && <p className="text-xs text-accent">✓ Verified member</p>}
                  {memberStatus === "not_member" && <p className="text-xs text-destructive">Not an approved member. <Link to="/" className="underline">Apply here</Link></p>}
                </div>
                <div><Label>Full name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email *</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>School / College</Label><Input value={form.school_college} onChange={(e) => setForm({ ...form, school_college: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Team name</Label><Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} /></div>
                  <div><Label>Participants</Label><Input type="number" min={1} value={form.participants} onChange={(e) => setForm({ ...form, participants: Number(e.target.value) })} /></div>
                </div>

                {event.is_paid && (
                  <div className="border border-accent/40 bg-background p-4 space-y-3 mt-2">
                    <div className="font-stencil text-[10px] tracking-[0.4em] text-accent">PAYMENT — NPR {event.price}</div>
                    <p className="text-xs text-muted-foreground">
                      Pay via eSewa / Khalti / bank transfer to <b>9811807747</b>, then upload your payment screenshot below.
                      Admin will verify within 24 hours.
                    </p>
                    <div>
                      <Label>Payment method</Label>
                      <select className="w-full h-9 px-3 bg-background border border-input rounded-md" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                        <option value="">Select…</option>
                        <option>eSewa</option><option>Khalti</option><option>Bank transfer</option><option>QR / Cash</option>
                      </select>
                    </div>
                    <div>
                      <Label>Payment screenshot</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                    </div>
                  </div>
                )}

                <div><Label>Notes (optional)</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" disabled={register.isPending || memberStatus !== "approved"} className="w-full">
                  {register.isPending ? "Submitting…" : event.is_paid ? "Submit registration" : "Confirm spot"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}