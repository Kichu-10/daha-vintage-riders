import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
