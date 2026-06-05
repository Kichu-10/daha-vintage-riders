import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import logoAsset from "@/assets/daha-logo.asset.json";
import rideAsset from "@/assets/ride.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DAHA Vintage MC — Chitwan" },
      { name: "description", content: "DAHA Vintage Motorcycle Club, Chitwan. A brotherhood of vintage riders carving the roads of Nepal." },
      { property: "og:title", content: "DAHA Vintage MC — Chitwan" },
      { property: "og:description", content: "A brotherhood of vintage riders carving the roads of Nepal." },
      { property: "og:image", content: logoAsset.url },
    ],
  }),
  component: Index,
});

function Index() {
  const founders = [
    { name: "Pradip Gurung", role: "Founder / Advisor" },
    { name: "Sarin Gurung", role: "Founder / Advisor" },
    { name: "Karan Gurung", role: "Founder / Chief" },
  ];
  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, slug, event_type, starts_at, venue, description, is_paid, price")
        .in("status", ["upcoming", "ongoing"])
        .order("starts_at", { ascending: true })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });
  const { data: notices } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, body, is_pinned, published_at")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });
  const { data: sponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsors").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const whatsappNumber = "9779811807747";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hey Chief, I want to ride with DAHA Vintage MC.")}`;

  // calendar: highlight dates that have events
  const eventDates = useMemo(
    () => (events ?? []).map((e) => new Date(e.starts_at)),
    [events],
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const eventsOnSelectedDate = (events ?? []).filter((e) => {
    if (!selectedDate) return false;
    const d = new Date(e.starts_at);
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="DAHA Vintage MC" className="h-10 w-10 rounded-full" />
            <div className="leading-tight">
              <div className="font-display text-lg">DAHA VINTAGE</div>
              <div className="font-stencil text-[10px] text-muted-foreground tracking-[0.3em]">MC · CHITWAN</div>
            </div>
          </div>
          <div className="hidden md:flex gap-8 font-body uppercase text-sm tracking-widest">
            <a href="#story" className="hover:text-accent transition">Story</a>
            <a href="#founders" className="hover:text-accent transition">Founders</a>
            <a href="#events" className="hover:text-accent transition">Events</a>
            <a href="#ride" className="hover:text-accent transition">The Ride</a>
            <a href="#join" className="hover:text-accent transition">Join</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center grain">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${rideAsset.url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />

        <div className="relative z-10 text-center px-6 pt-24">
          <div className="font-stencil text-xs md:text-sm tracking-[0.5em] text-accent mb-8">
            EST · CHITWAN · NEPAL
          </div>

          <div className="relative mx-auto w-[280px] h-[280px] md:w-[420px] md:h-[420px] mb-10">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl" />
            <img
              src={logoAsset.url}
              alt="DAHA Vintage MC Chitwan logo"
              className="logo-3d relative w-full h-full rounded-full"
            />
          </div>

          <h1 className="font-display text-5xl md:text-8xl lg:text-9xl leading-none">
            DAHA <span className="text-accent">VINTAGE</span>
          </h1>
          <div className="font-stencil text-sm md:text-base tracking-[0.6em] mt-4 text-muted-foreground">
            MOTORCYCLE CLUB · CHITWAN
          </div>

          <p className="max-w-xl mx-auto mt-8 font-body text-base md:text-lg text-muted-foreground">
            Two wheels. One brotherhood. Carving the highways of Nepal on classic iron since day one.
          </p>

          <div className="mt-10 flex gap-4 justify-center font-body uppercase tracking-widest text-sm">
            <a href="#join" className="px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition">
              Ride With Us
            </a>
            <a href="#story" className="px-8 py-3 border border-foreground/30 hover:border-accent hover:text-accent transition">
              Our Story
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-stencil text-xs tracking-[0.4em] text-muted-foreground animate-pulse">
          ↓ SCROLL
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-6">CHAPTER 01</div>
          <h2 className="font-display text-5xl md:text-7xl mb-10">BUILT ON CHROME & DUST</h2>
          <div className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed space-y-6">
            <p>
              Established in 2023 in Chitwan, Nepal, DAHA Vintage Motorcycle Club Chitwan was founded by a close-knit family of brothers. What began with blood brothers and cousins has grown into a larger brotherhood united by a shared passion for vintage motorcycles, adventure, and service to society. Today, our club proudly includes blood brothers, cousins, and brothers from different families who share the same values of loyalty, respect, and unity.
            </p>
            <p>
              We ride not only for the thrill of the journey but also to create a positive impact in our society. Every mile we travel brings hope, support, and opportunities to those in need.
            </p>
            <p>
              Our mission is to promote tourism, strengthen brotherhood among riders, and actively engage in social work that benefits society. Through our rides and community initiatives, we proudly showcase the beauty, culture, and spirit of Chitwan to the world.
            </p>
            <p>
              We are committed to preserving the heritage of unity, service, and responsible tourism.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section id="founders" className="py-32 px-6 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-6">THE COUNCIL</div>
            <h2 className="font-display text-5xl md:text-7xl">FOUNDERS</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((f, i) => (
              <div key={f.name} className="group relative p-10 bg-background border border-border hover:border-accent transition-all duration-500 hover:-translate-y-2">
                <div className="font-stencil text-6xl text-accent/30 mb-4">0{i + 1}</div>
                <div className="font-stencil text-xs tracking-[0.4em] text-muted-foreground mb-3">{f.role.toUpperCase()}</div>
                <h3 className="font-display text-3xl md:text-4xl mb-6">{f.name}</h3>
                <div className="h-px bg-border group-hover:bg-accent transition-colors" />
                <div className="mt-6 font-body text-sm text-muted-foreground italic">
                  "Ride hard. Ride together. Ride forever."
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RIDE GALLERY */}
      <section id="events" className="py-32 px-6 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-6">THE SCHEDULE</div>
            <h2 className="font-display text-5xl md:text-7xl">UPCOMING RIDES & MEETS</h2>
            <p className="font-body text-muted-foreground mt-6 max-w-2xl mx-auto">
              Mark your calendar. Fuel up. Show up. Every ride leaves on time — vintage time.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {(events ?? []).map((e) => {
              const d = new Date(e.starts_at);
              const day = d.toLocaleDateString("en-US", { day: "2-digit" });
              const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
              const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              return (
              <article
                key={e.title}
                className="group relative bg-background border border-border hover:border-accent transition-all duration-500 p-8 flex gap-6"
              >
                <div className="flex flex-col items-center justify-center min-w-[110px] border-r border-border pr-6 group-hover:border-accent transition-colors">
                  <div className="font-stencil text-[10px] tracking-[0.3em] text-accent">{e.event_type}</div>
                  <div className="font-display text-3xl mt-3 leading-none text-center">
                    {day}
                  </div>
                  <div className="font-stencil text-[10px] tracking-[0.3em] text-muted-foreground mt-1">
                    {month}
                  </div>
                  <div className="h-px w-8 bg-border my-3 group-hover:bg-accent transition-colors" />
                  <div className="font-stencil text-[10px] tracking-[0.3em] text-muted-foreground">
                    {weekday}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl md:text-3xl mb-2">{e.title}</h3>
                  <div className="font-stencil text-[11px] tracking-[0.3em] text-accent mb-1">
                    {time}
                  </div>
                  <div className="font-body text-sm text-muted-foreground mb-4">
                    📍 {e.venue}
                  </div>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">{e.description}</p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-5 font-stencil text-xs tracking-[0.3em] text-accent hover:underline"
                  >
                    RSVP ON WHATSAPP →
                  </a>
                </div>
              </article>
              );
            })}
            {(events ?? []).length === 0 && (
              <div className="md:col-span-2 text-center py-16 border border-dashed border-border font-stencil text-xs tracking-[0.4em] text-muted-foreground">
                NO UPCOMING RIDES POSTED. CHECK BACK SOON.
              </div>
            )}
          </div>

          {/* CALENDAR */}
          <div className="mt-16 grid md:grid-cols-[auto_1fr] gap-10 items-start">
            <div className="bg-background border border-border p-4 mx-auto">
              <div className="font-stencil text-[10px] tracking-[0.4em] text-accent mb-3 text-center">RIDE CALENDAR</div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ hasEvent: eventDates }}
                modifiersClassNames={{ hasEvent: "bg-accent/30 text-accent font-bold rounded-full" }}
              />
            </div>
            <div>
              <div className="font-stencil text-[10px] tracking-[0.4em] text-accent mb-3">
                {selectedDate ? selectedDate.toDateString().toUpperCase() : "SELECT A DATE"}
              </div>
              {selectedDate && eventsOnSelectedDate.length === 0 && (
                <p className="font-body text-muted-foreground text-sm">No rides scheduled on this date.</p>
              )}
              <div className="space-y-3">
                {eventsOnSelectedDate.map((e) => (
                  <div key={e.id} className="bg-background border border-border p-4">
                    <div className="font-display text-xl">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.starts_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {e.venue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIDE GALLERY */}
      <section id="ride" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-6">ON THE ROAD</div>
            <h2 className="font-display text-5xl md:text-7xl">THE PACK RIDES</h2>
          </div>
          <div className="relative group overflow-hidden border border-border">
            <img
              src={rideAsset.url}
              alt="DAHA Vintage MC riders on Chitwan roads"
              className="w-full h-[60vh] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 font-stencil text-xs tracking-[0.4em] text-foreground">
              CHITWAN · NEPAL · 2025
            </div>
          </div>
        </div>
      </section>

      {/* JOIN */}
      <JoinSection whatsappLink={whatsappLink} />

      {/* FOOTER */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-8 w-8 rounded-full" />
            <span className="font-stencil text-xs tracking-[0.3em] text-muted-foreground">
              DAHA VINTAGE MC · CHITWAN
            </span>
          </div>
          <div className="font-stencil text-xs tracking-[0.3em] text-muted-foreground">
            © {new Date().getFullYear()} · RIDE OR DIE
          </div>
        </div>
      </footer>
    </div>
  );
}

function JoinSection({ whatsappLink }: { whatsappLink: string }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    bike_model: "",
    message: "",
    payment_method: "eSewa",
    amount: 1000,
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  async function checkStatus() {
    if (!lookupPhone.trim()) { toast.error("Enter your phone number"); return; }
    setLookupLoading(true);
    const { data, error } = await supabase
      .from("memberships")
      .select("id, full_name, phone, bike_model, status, admin_notes, created_at, reviewed_at")
      .eq("phone", lookupPhone.trim())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setLookupLoading(false);
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("No application found for that phone"); setLookupResult(null); return; }
    setLookupResult(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }
    setSubmitting(true);
    try {
      let proofUrl: string | null = null;
      if (file) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        proofUrl = data.publicUrl;
      }
      const { error } = await supabase.from("memberships").insert({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
        bike_model: form.bike_model || null,
        message: form.message || null,
        payment_method: form.payment_method,
        amount: form.amount,
        payment_proof_url: proofUrl,
      });
      if (error) throw error;
      toast.success("Application submitted! The Chief will review it shortly.");
      setForm({ full_name: "", phone: "", email: "", address: "", bike_model: "", message: "", payment_method: "eSewa", amount: 1000 });
      setFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="join" className="py-32 px-6 relative grain">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-6">PROSPECTS WELCOME</div>
          <h2 className="font-display text-5xl md:text-7xl mb-6">JOIN THE BROTHERHOOD</h2>
          <p className="font-body text-muted-foreground">
            Fill the form, pay the membership fee, and upload your payment proof. The Chief will verify and confirm your membership.
          </p>
        </div>

        {/* STATUS LOOKUP */}
        <div className="bg-card border border-border p-6 mb-8">
          <div className="font-stencil text-[10px] tracking-[0.4em] text-accent mb-3">CHECK APPLICATION STATUS</div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Enter the phone you applied with" value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} />
            <Button type="button" variant="outline" onClick={checkStatus} disabled={lookupLoading}>{lookupLoading ? "Checking…" : "Check status"}</Button>
          </div>
          {lookupResult && (
            <div className="mt-5 border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="font-display text-xl">{lookupResult.full_name}</div>
                  <div className="text-xs text-muted-foreground">{lookupResult.bike_model || "—"}</div>
                </div>
                <span className={`font-stencil text-[10px] tracking-[0.3em] px-3 py-1 border ${lookupResult.status === "approved" ? "border-accent text-accent" : lookupResult.status === "rejected" ? "border-destructive text-destructive" : "border-muted-foreground text-muted-foreground"}`}>
                  {lookupResult.status?.toUpperCase()}
                </span>
              </div>
              {lookupResult.admin_notes && (
                <p className="text-sm text-foreground/80 italic mb-3">"{lookupResult.admin_notes}"</p>
              )}
              {lookupResult.status === "approved" && (
                <div className="mt-4 border border-accent/40 bg-gradient-to-br from-background to-card p-6 text-center">
                  <div className="font-stencil text-[10px] tracking-[0.5em] text-accent mb-2">OFFICIAL MEMBERSHIP CARD</div>
                  <div className="font-display text-2xl mb-1">DAHA VINTAGE MC</div>
                  <div className="font-stencil text-[10px] tracking-[0.4em] text-muted-foreground mb-4">CHITWAN · NEPAL</div>
                  <div className="bg-white p-4 inline-block">
                    <QRCodeSVG
                      value={JSON.stringify({ id: lookupResult.id, name: lookupResult.full_name, phone: lookupResult.phone, club: "DAHA-VMC" })}
                      size={180}
                      level="H"
                    />
                  </div>
                  <div className="font-display text-lg mt-4">{lookupResult.full_name}</div>
                  <div className="text-xs text-muted-foreground">Member ID: {lookupResult.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">Show this QR at events for check-in.</div>
                </div>
              )}
              {lookupResult.status === "pending" && (
                <p className="text-xs text-muted-foreground">Your application is under review. We'll WhatsApp you once the Chief confirms.</p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Full name *</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Phone *</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Bike model</Label><Input placeholder="e.g. Royal Enfield Classic 350" value={form.bike_model} onChange={(e) => setForm({ ...form, bike_model: e.target.value })} /></div>
            <div>
              <Label>Payment method</Label>
              <select className="w-full h-9 px-3 bg-background border border-input rounded-md" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                {["eSewa", "Khalti", "Bank transfer", "Cash"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Amount paid (NPR)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
            <div>
              <Label>Payment proof (screenshot)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <div><Label>Why do you want to join?</Label><Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>

          <div className="bg-background border border-dashed border-border p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Payment instructions:</strong> Send NPR {form.amount} via {form.payment_method} to <span className="text-accent">9811807747</span>, then upload the screenshot above.
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={submitting} className="flex-1 font-body uppercase tracking-widest">
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-6 py-2 bg-[#25D366] text-black font-body uppercase tracking-widest text-sm hover:bg-[#25D366]/90 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.671 5.482l.197.312-1.005 3.669 3.626-.962z"/>
              </svg>
              Chat the Chief
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
