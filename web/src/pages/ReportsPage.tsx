import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Flag, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusPill } from "../components/UI";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Report } from "../lib/types";

const CATEGORIES = [
  "Misleading listing",
  "Unsafe property",
  "Unfair deposit handling",
  "Harassment or abuse",
  "Fake listing or scam",
  "Other concern",
];

export default function ReportsPage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const propertyId = params.get("property");
  const targetUserId = params.get("user");

  const mine = useQuery({
    queryKey: ["reports", "mine"],
    queryFn: () => api<Report[]>("/reports/mine"),
  });

  const submit = useMutation({
    mutationFn: () =>
      api<Report>("/reports", {
        method: "POST",
        body: {
          category,
          details: details.trim(),
          property_id: propertyId ? Number(propertyId) : null,
          target_user_id: targetUserId ? Number(targetUserId) : null,
        },
      }),
    onSuccess: () => {
      setDetails("");
      setSubmitted(true);
      toast.success("Report submitted. Our team will review it.");
      queryClient.invalidateQueries({ queryKey: ["reports", "mine"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (details.trim().length < 5) {
      toast.error("Please add a few more details.");
      return;
    }
    submit.mutate();
  }

  return (
    <div className="container-page pb-14">
      <PageHeader
        eyebrow="Safety & accountability"
        title="Report a concern"
        subtitle="Something not right? Tell us privately. Reports go to the MOAGI team, not to the other member."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {(propertyId || targetUserId) && (
            <div className="rounded-2xl border border-gold/40 bg-gold/8 px-5 py-3 text-sm text-[#7a5a12]">
              This report is linked to {propertyId ? `listing #${propertyId}` : ""}
              {propertyId && targetUserId ? " and " : ""}
              {targetUserId ? `member #${targetUserId}` : ""}.
            </div>
          )}

          {submitted ? (
            <div className="card flex flex-col items-center p-10 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-forest/10 text-forest">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">Thank you for speaking up.</h2>
              <p className="mt-2 max-w-sm text-sm text-ink/55">
                Our team reviews every report. We may reach out if we need more information.
              </p>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setSubmitted(false)} className="btn btn-ghost">Submit another</button>
                <Link to="/houses" className="btn btn-primary">Browse homes</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-clay/10 text-clay"><Flag size={19} /></span>
                <div>
                  <h2 className="text-lg font-semibold">What happened?</h2>
                  <p className="text-xs text-ink/45">Be specific and factual. Include dates if you can.</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="label" htmlFor="category">Category</label>
                <select id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="label" htmlFor="details">Details</label>
                <textarea
                  id="details"
                  className="input min-h-40"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe what happened, who was involved and any steps you've already taken…"
                  maxLength={2000}
                  required
                />
                <p className="mt-1 text-right text-[11px] text-ink/35">{details.length}/2000</p>
              </div>

              <button className="btn btn-primary mt-2 w-full sm:w-auto" disabled={submit.isPending}>
                {submit.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Submit report
              </button>
            </form>
          )}

          <div>
            <h2 className="text-xl font-semibold">Your reports</h2>
            <div className="mt-4 space-y-3">
              {mine.isLoading && <div className="skeleton h-24 rounded-2xl" />}
              {mine.data?.map((report) => (
                <div key={report.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{report.category}</p>
                    <StatusPill status={report.status} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{report.details}</p>
                  <p className="mt-2 text-[11px] text-ink/35">Submitted {formatDate(report.created_at)}</p>
                </div>
              ))}
              {mine.data && mine.data.length === 0 && !mine.isLoading && (
                <p className="rounded-2xl bg-white p-5 text-sm text-ink/45 ring-1 ring-ink/8">
                  You haven't submitted any reports.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-mist p-5">
            <div className="flex items-center gap-2 text-forest">
              <AlertTriangle size={18} />
              <p className="font-semibold">In an emergency</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink/60">
              If you are in immediate danger, contact the Botswana Police Service on 999 first. MOAGI is
              not an emergency service.
            </p>
          </div>
          <div className="rounded-3xl border border-ink/10 bg-white p-5">
            <p className="text-sm font-semibold">What happens next</p>
            <ol className="mt-3 space-y-3 text-xs text-ink/55">
              <li><b className="text-ink">1.</b> We review the report within 2 working days.</li>
              <li><b className="text-ink">2.</b> We may contact you and the other member for context.</li>
              <li><b className="text-ink">3.</b> Listings or accounts can be paused while we investigate.</li>
              <li><b className="text-ink">4.</b> You'll see the status update in this page.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-ink/10 bg-white p-5">
            <p className="text-sm font-semibold">Before you rent</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink/55">
              <li>Always view the property in person.</li>
              <li>Never pay a deposit before signing a lease.</li>
              <li>Meet at the property, not a remote location.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
