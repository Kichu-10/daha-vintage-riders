import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Trash2, Pin, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — DAHA Vintage MC" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUserEmail(data.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-stencil tracking-widest">LOADING…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-4">ACCESS PENDING</div>
          <h1 className="font-display text-4xl mb-4">No admin role yet</h1>
          <p className="font-body text-muted-foreground mb-6">
            You're signed in as <span className="text-foreground">{userEmail}</span>, but you don't have admin
            privileges. Ask the Chief to grant you the <code className="text-accent">admin</code> role.
          </p>
          <details className="text-left bg-card border border-border p-4 text-sm font-mono mb-6">
            <summary className="cursor-pointer text-accent">Bootstrap first admin (run once)</summary>
            <p className="mt-2 text-muted-foreground">
              In Lovable Cloud → SQL, run:
            </p>
            <pre className="mt-2 whitespace-pre-wrap text-xs">{`insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users
where email = '${userEmail}';`}</pre>
          </details>
          <Button onClick={signOut} variant="outline">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-stencil text-[10px] tracking-[0.4em] text-accent">DAHA · VINTAGE · MC</div>
            <h1 className="font-display text-2xl">CHIEF'S CONSOLE</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-muted-foreground hidden md:inline">{userEmail}</span>
            <a href="/" className="font-stencil text-xs tracking-[0.3em] text-muted-foreground hover:text-accent">VIEW SITE</a>
            <Button onClick={signOut} variant="outline" size="sm"><LogOut className="w-4 h-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="events">
          <TabsList className="mb-6">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          </TabsList>
          <TabsContent value="events"><EventsAdmin /></TabsContent>
          <TabsContent value="registrations"><RegistrationsAdmin /></TabsContent>
          <TabsContent value="members"><MembersAdmin /></TabsContent>
          <TabsContent value="notices"><NoticesAdmin /></TabsContent>
          <TabsContent value="sponsors"><SponsorsAdmin /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function EventsAdmin() {
  const qc = useQueryClient();
  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    title: "", event_type: "ride", venue: "", description: "",
    starts_at: "", is_paid: false, price: 0, capacity: 0, poster_url: "", organizer: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        title: form.title,
        slug: slugify(form.title) + "-" + Date.now().toString(36),
        event_type: form.event_type as "ride",
        starts_at: new Date(form.starts_at).toISOString(),
        venue: form.venue, description: form.description,
        is_paid: form.is_paid, price: form.price, capacity: form.capacity || null,
        poster_url: form.poster_url || null, organizer: form.organizer || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event created");
      setForm({ title: "", event_type: "ride", venue: "", description: "", starts_at: "", is_paid: false, price: 0, capacity: 0, poster_url: "", organizer: "" });
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-events"] }); qc.invalidateQueries({ queryKey: ["events"] }); },
  });

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-card border border-border p-6">
        <h2 className="font-display text-2xl mb-4">+ NEW EVENT</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
          className="space-y-3"
        >
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <select className="w-full h-9 px-3 bg-background border border-input rounded-md" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                {["ride","meeting","tour","workshop","social","race","other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><Label>Starts at</Label><Input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
          </div>
          <div><Label>Venue</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
          <div><Label>Organizer</Label><Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Poster image URL (optional)</Label><Input value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="paid" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} />
            <Label htmlFor="paid">Paid event</Label>
          </div>
          {form.is_paid && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (NPR)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
            </div>
          )}
          <Button type="submit" disabled={create.isPending} className="w-full"><Plus className="w-4 h-4" />{create.isPending ? "Saving…" : "Create event"}</Button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-2xl mb-4">ALL EVENTS</h2>
        {events?.map((e) => (
          <div key={e.id} className="bg-card border border-border p-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="uppercase text-[10px]">{e.event_type}</Badge>
                <Badge className="uppercase text-[10px]">{e.status}</Badge>
                {e.is_paid && <Badge variant="secondary">NPR {e.price}</Badge>}
              </div>
              <div className="font-display text-lg">{e.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(e.starts_at).toLocaleString()} · {e.venue}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this event?")) del.mutate(e.id); }}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        {events?.length === 0 && <p className="text-muted-foreground text-sm">No events yet. Create one →</p>}
      </div>
    </div>
  );
}

function RegistrationsAdmin() {
  const qc = useQueryClient();
  const { data: regs } = useQuery({
    queryKey: ["admin-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(title, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "verified" | "rejected" | "pending" }) => {
      const { error } = await supabase.from("registrations").update({ payment_status: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-registrations"] }); },
  });

  function exportCsv() {
    if (!regs) return;
    const rows = [
      ["Event", "Name", "Phone", "Email", "School/College", "Team", "Participants", "Payment", "Ticket", "Created"],
      ...regs.map((r: any) => [r.events?.title ?? "", r.name, r.phone, r.email, r.school_college ?? "", r.team_name ?? "", r.participants, r.payment_status, r.ticket_code, r.created_at]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `daha-registrations-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-2xl">REGISTRATIONS</h2>
        <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="space-y-2">
        {regs?.map((r: any) => (
          <div key={r.id} className="bg-card border border-border p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <div className="font-display text-lg">{r.name} <span className="text-xs text-muted-foreground">· {r.events?.title}</span></div>
                <div className="text-xs text-muted-foreground">{r.phone} · {r.email} · ticket {r.ticket_code}</div>
              </div>
              <Badge variant={r.payment_status === "verified" ? "default" : r.payment_status === "rejected" ? "destructive" : "secondary"}>
                {r.payment_status}
              </Badge>
            </div>
            {(r.school_college || r.team_name) && (
              <div className="text-xs text-muted-foreground">{r.school_college} {r.team_name && `· ${r.team_name}`} · {r.participants} pax</div>
            )}
            {r.payment_proof_url && (
              <a href={r.payment_proof_url} target="_blank" rel="noopener" className="text-xs text-accent underline">View payment proof</a>
            )}
            {r.payment_status === "pending" && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => updateStatus.mutate({ id: r.id, status: "verified" })}><CheckCircle className="w-3 h-3" /> Verify</Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}><XCircle className="w-3 h-3" /> Reject</Button>
              </div>
            )}
          </div>
        ))}
        {regs?.length === 0 && <p className="text-muted-foreground text-sm">No registrations yet.</p>}
      </div>
    </div>
  );
}

function NoticesAdmin() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  const { data: notices } = useQuery({
    queryKey: ["admin-notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("published_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notices").insert({ title, body, is_pinned: pinned });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Posted"); setTitle(""); setBody(""); setPinned(false); qc.invalidateQueries({ queryKey: ["admin-notices"] }); qc.invalidateQueries({ queryKey: ["notices"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("notices").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-notices"] }); qc.invalidateQueries({ queryKey: ["notices"] }); },
  });

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="bg-card border border-border p-6 space-y-3">
        <h2 className="font-display text-2xl mb-2">+ NEW NOTICE</h2>
        <div><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Body</Label><Textarea required rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <div className="flex items-center gap-2"><input type="checkbox" id="pin" checked={pinned} onChange={(e) => setPinned(e.target.checked)} /><Label htmlFor="pin">Pin to top</Label></div>
        <Button type="submit" disabled={create.isPending}><Plus className="w-4 h-4" />Post notice</Button>
      </form>
      <div className="space-y-3">
        <h2 className="font-display text-2xl mb-2">POSTED</h2>
        {notices?.map((n) => (
          <div key={n.id} className="bg-card border border-border p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2"><h3 className="font-display text-lg">{n.title}</h3>{n.is_pinned && <Pin className="w-3 h-3 text-accent" />}</div>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                <div className="text-xs text-muted-foreground mt-2">{new Date(n.published_at).toLocaleString()}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del.mutate(n.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorsAdmin() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [tier, setTier] = useState("standard");

  const { data: sponsors } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async () => { const { data, error } = await supabase.from("sponsors").select("*").order("sort_order"); if (error) throw error; return data; },
  });

  const create = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("sponsors").insert({ name, website_url: website, logo_url: logoUrl, tier }); if (error) throw error; },
    onSuccess: () => { toast.success("Sponsor added"); setName(""); setWebsite(""); setLogoUrl(""); qc.invalidateQueries({ queryKey: ["admin-sponsors"] }); qc.invalidateQueries({ queryKey: ["sponsors"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("sponsors").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-sponsors"] }); qc.invalidateQueries({ queryKey: ["sponsors"] }); },
  });

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="bg-card border border-border p-6 space-y-3">
        <h2 className="font-display text-2xl mb-2">+ NEW SPONSOR</h2>
        <div><Label>Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Website</Label><Input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
        <div><Label>Logo image URL</Label><Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} /></div>
        <div>
          <Label>Tier</Label>
          <select className="w-full h-9 px-3 bg-background border border-input rounded-md" value={tier} onChange={(e) => setTier(e.target.value)}>
            {["platinum","gold","silver","standard"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Button type="submit"><Plus className="w-4 h-4" />Add sponsor</Button>
      </form>
      <div className="space-y-2">
        <h2 className="font-display text-2xl mb-2">SPONSORS</h2>
        {sponsors?.map((s) => (
          <div key={s.id} className="bg-card border border-border p-4 flex justify-between items-center">
            <div>
              <div className="font-display text-lg">{s.name} <Badge variant="outline" className="ml-2 text-[10px] uppercase">{s.tier}</Badge></div>
              <div className="text-xs text-muted-foreground">{s.website_url}</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => del.mutate(s.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
function MembersAdmin() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const { data: members } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("memberships").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: "approved" | "rejected" | "pending"; admin_notes?: string }) => {
      const { error } = await supabase
        .from("memberships")
        .update({ status, admin_notes: admin_notes ?? null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-members"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function waLink(phone: string, msg: string) {
    const digits = phone.replace(/\D/g, "");
    const intl = digits.startsWith("977") ? digits : `977${digits.replace(/^0+/, "")}`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
  }

  function notify(m: any, status: "approved" | "rejected", note?: string) {
    const base = status === "approved"
      ? `Namaste ${m.full_name}, your DAHA Vintage MC Chitwan membership has been APPROVED ✅. Welcome to the brotherhood!`
      : `Namaste ${m.full_name}, unfortunately your DAHA Vintage MC membership application has been declined.`;
    const full = note ? `${base}\n\nNote from the Chief: ${note}` : base;
    window.open(waLink(m.phone, full), "_blank");
  }

  function exportCsv(filterStatus: "approved" | "pending") {
    const rows = (members ?? []).filter((m) => m.status === filterStatus);
    if (rows.length === 0) { toast.error(`No ${filterStatus} members`); return; }
    const header = ["Name", "Phone", "Email", "Address", "Bike", "Amount", "Payment Method", "Status", "Admin Notes", "Applied"];
    const csv = [header, ...rows.map((m) => [m.full_name, m.phone, m.email ?? "", m.address ?? "", m.bike_model ?? "", m.amount ?? 0, m.payment_method ?? "", m.status, m.admin_notes ?? "", m.created_at])]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `daha-members-${filterStatus}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = (members ?? []).filter((m) => filter === "all" || m.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-2xl">MEMBERSHIP APPLICATIONS</h2>
        <div className="flex gap-2 items-center">
          <select className="h-9 px-3 bg-background border border-input rounded-md text-sm" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => exportCsv("approved")}>Export approved CSV</Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv("pending")}>Export pending CSV</Button>
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-card border border-border p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <div className="font-display text-lg">{m.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.phone}{m.email ? ` · ${m.email}` : ""}{m.bike_model ? ` · ${m.bike_model}` : ""}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Paid NPR {m.amount ?? 0} via {m.payment_method ?? "—"} · {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <Badge variant={m.status === "approved" ? "default" : m.status === "rejected" ? "destructive" : "secondary"}>
                {m.status}
              </Badge>
            </div>
            {m.message && <p className="text-sm text-foreground/80 mb-2">"{m.message}"</p>}
            {m.admin_notes && (
              <div className="text-xs bg-background border border-border p-2 mb-2">
                <span className="text-accent font-stencil tracking-widest text-[10px]">CHIEF'S NOTE:</span> {m.admin_notes}
              </div>
            )}
            {m.payment_proof_url && (
              <button
                type="button"
                className="text-xs text-accent underline"
                onClick={async () => {
                  try {
                    if (!m.payment_proof_url) return;
                    const url = new URL(m.payment_proof_url);
                    const marker = "/payment-proofs/";
                    const idx = url.pathname.indexOf(marker);
                    const path = idx >= 0 ? url.pathname.slice(idx + marker.length) : m.payment_proof_url;
                    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 300);
                    if (error) throw error;
                    window.open(data.signedUrl, "_blank");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Could not open proof");
                  }
                }}
              >
                View payment proof
              </button>
            )}
            {m.status === "pending" && (
              <div className="mt-3 space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Optional note to applicant (sent via WhatsApp)"
                  value={notes[m.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [m.id]: e.target.value })}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={async () => { await updateStatus.mutateAsync({ id: m.id, status: "approved", admin_notes: notes[m.id] }); notify(m, "approved", notes[m.id]); }}>
                    <CheckCircle className="w-3 h-3" /> Approve + WhatsApp
                  </Button>
                  <Button size="sm" variant="destructive" onClick={async () => { await updateStatus.mutateAsync({ id: m.id, status: "rejected", admin_notes: notes[m.id] }); notify(m, "rejected", notes[m.id]); }}>
                    <XCircle className="w-3 h-3" /> Reject + WhatsApp
                  </Button>
                </div>
              </div>
            )}
            {m.status !== "pending" && (
              <div className="mt-2">
                <a href={waLink(m.phone, `Hello ${m.full_name}, from DAHA Vintage MC Chitwan.`)} target="_blank" rel="noopener" className="text-xs text-accent underline">Message on WhatsApp</a>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm">No applications match.</p>}
      </div>
    </div>
  );
}
