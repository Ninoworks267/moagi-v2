import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Flag,
  Loader2,
  MessageSquare,
  Search,
  Shield,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusPill } from "../components/UI";
import { Avatar } from "../components/Avatar";
import { PageLoader } from "../components/Skeletons";
import { api } from "../lib/api";
import { formatDate, money } from "../lib/format";
import type { AdminStats, Report, User } from "../lib/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "reports", label: "Reports" },
  { id: "users", label: "Members" },
] as const;

const STATUSES = ["open", "reviewing", "resolved", "dismissed"];

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [search, setSearch] = useState("");

  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: () => api<AdminStats>("/admin/stats") });
  const reports = useQuery({ queryKey: ["admin", "reports"], queryFn: () => api<Report[]>("/admin/reports") });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => api<User[]>("/admin/users") });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api<Report>(`/admin/reports/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      toast.success("Report updated.");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (stats.isLoading) return <PageLoader />;
  const s = stats.data;
  const filteredUsers = (users.data ?? []).filter((member) => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase();
    return (
      `${member.first_name} ${member.surname}`.toLowerCase().includes(needle) ||
      member.email?.toLowerCase().includes(needle) ||
      member.role.includes(needle)
    );
  });

  return (
    <div className="container-page pb-14">
      <PageHeader
        eyebrow="Admin"
        title="Platform control room"
        subtitle="A live view of MOAGI — members, listings, bookings and safety reports."
        actions={<Link to="/houses" className="btn btn-ghost">View public site</Link>}
      />

      <div className="mb-8 flex gap-1 rounded-full border border-ink/10 bg-white p-1.5 sm:w-fit">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold transition sm:flex-none ${
              tab === item.id ? "bg-forest text-cream" : "text-ink/55 hover:bg-forest/5"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && s && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Members", value: s.users, hint: `${s.landlords} landlords · ${s.tenants} tenants`, icon: <Users size={18} /> },
              { label: "Listings", value: s.properties, hint: `${s.stays} stays`, icon: <Building2 size={18} /> },
              { label: "Bookings", value: s.bookings, hint: "Short-term stays", icon: <CalendarDays size={18} /> },
              { label: "Booking value", value: money(s.booking_value), hint: "Demo payments", icon: <Wallet size={18} /> },
              { label: "Reviews", value: s.reviews, hint: "Tenant feedback", icon: <Star size={18} /> },
              { label: "Open reports", value: s.open_reports, hint: "Needs attention", icon: <Flag size={18} /> },
              { label: "Unread messages", value: s.unread_messages, hint: "Across the platform", icon: <MessageSquare size={18} /> },
              { label: "Health", value: "Live", hint: "All systems normal", icon: <Shield size={18} /> },
            ].map((card) => (
              <div key={card.label} className="card p-5">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{card.label}</p>
                  <span className="text-forest/50">{card.icon}</span>
                </div>
                <p className="mt-3 font-display text-3xl font-semibold text-forest">{card.value}</p>
                <p className="mt-1 text-[11px] text-ink/40">{card.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Latest reports</h2>
                <button onClick={() => setTab("reports")} className="link-underline text-xs">View all</button>
              </div>
              <div className="mt-4 space-y-3">
                {(reports.data ?? []).slice(0, 4).map((report) => (
                  <div key={report.id} className="flex items-start gap-3 rounded-2xl bg-cream/60 p-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-clay/10 text-clay">
                      <Flag size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{report.category}</p>
                        <StatusPill status={report.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-ink/50">{report.details}</p>
                      <p className="mt-1 text-[10px] text-ink/35">
                        {report.reporter.first_name} {report.reporter.surname} · {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {(reports.data ?? []).length === 0 && (
                  <p className="text-sm text-ink/45">No reports. That's a good sign.</p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <div className="mt-4 space-y-2">
                <button onClick={() => setTab("users")} className="flex w-full items-center gap-3 rounded-xl bg-cream/60 px-4 py-3 text-left text-sm font-medium transition hover:bg-forest/5">
                  <Users size={17} className="text-forest" /> Browse members
                </button>
                <button onClick={() => setTab("reports")} className="flex w-full items-center gap-3 rounded-xl bg-cream/60 px-4 py-3 text-left text-sm font-medium transition hover:bg-forest/5">
                  <Flag size={17} className="text-forest" /> Triage reports
                </button>
                <Link to="/properties/new" className="flex w-full items-center gap-3 rounded-xl bg-cream/60 px-4 py-3 text-left text-sm font-medium transition hover:bg-forest/5">
                  <Building2 size={17} className="text-forest" /> Add a demo listing
                </Link>
                <a href="/api/docs" target="_blank" rel="noreferrer" className="flex w-full items-center gap-3 rounded-xl bg-cream/60 px-4 py-3 text-left text-sm font-medium transition hover:bg-forest/5">
                  <BookOpen size={17} className="text-forest" /> API documentation
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "reports" && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 p-5">
            <div>
              <h2 className="text-lg font-semibold">All reports</h2>
              <p className="text-xs text-ink/45">Update status as you investigate.</p>
            </div>
            <span className="chip">{reports.data?.length ?? 0} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-cream/60 text-[11px] uppercase tracking-[0.1em] text-ink/40">
                <tr>
                  <th className="px-5 py-3 font-semibold">Report</th>
                  <th className="px-5 py-3 font-semibold">Reporter</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.data?.map((report) => (
                  <tr key={report.id} className="border-t border-ink/5 align-top">
                    <td className="max-w-md px-5 py-4">
                      <p className="font-semibold">{report.category}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink/50">{report.details}</p>
                      {report.property_id && (
                        <Link to={`/properties/${report.property_id}`} className="mt-1 inline-block text-[11px] font-medium text-forest hover:underline">
                          View listing #{report.property_id}
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/60">
                      {report.reporter.first_name} {report.reporter.surname}
                      {report.target && (
                        <p className="mt-0.5 text-[11px] text-ink/35">
                          against {report.target.first_name} {report.target.surname}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/50">{formatDate(report.created_at)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={report.status}
                        onChange={(e) => updateStatus.mutate({ id: report.id, status: e.target.value })}
                        className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-xs font-medium capitalize outline-none focus:border-forest"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {updateStatus.isPending && <Loader2 size={12} className="mt-1 animate-spin text-ink/30" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reports.data?.length === 0 && <p className="p-8 text-center text-sm text-ink/45">No reports submitted yet.</p>}
        </div>
      )}

      {tab === "users" && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 p-5">
            <div>
              <h2 className="text-lg font-semibold">Members</h2>
              <p className="text-xs text-ink/45">{users.data?.length ?? 0} accounts on MOAGI</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or role…"
                className="input py-2.5 pl-9 text-xs"
              />
            </div>
          </div>
          <div className="divide-y divide-ink/5">
            {users.isLoading && <div className="p-6"><div className="skeleton h-16 rounded-xl" /></div>}
            {filteredUsers.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                <Avatar avatarUrl={member.avatar_url} first={member.first_name} last={member.surname} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{member.first_name} {member.surname}</p>
                  <p className="truncate text-xs text-ink/45">{member.email}</p>
                </div>
                <div className="hidden text-xs text-ink/50 sm:block">{member.location}</div>
                <div className="hidden text-xs text-ink/40 md:block">Joined {formatDate(member.created_at)}</div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  member.role === "admin"
                    ? "bg-clay/10 text-clay"
                    : member.role === "landlord"
                      ? "bg-forest/10 text-forest"
                      : "bg-sand text-ink/60"
                }`}>
                  {member.role}
                </span>
                {member.role === "landlord" && (
                  <Link to={`/landlords/${member.id}`} className="btn btn-ghost btn-sm">Profile</Link>
                )}
              </div>
            ))}
            {filteredUsers.length === 0 && !users.isLoading && (
              <p className="p-8 text-center text-sm text-ink/45">No members match that search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
