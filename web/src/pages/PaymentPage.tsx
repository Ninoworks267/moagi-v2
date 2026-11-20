import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { money } from "../lib/format";

const METHODS = [
  { name: "MyZaka", note: "Mascom" },
  { name: "Orange Money", note: "Orange" },
  { name: "Smega", note: "Botswana Post" },
];

interface Receipt {
  amount: number;
  method: string;
  phone: string;
  reference: string;
}

function makeReference(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return "MGG-" + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const item = params.get("item") || "MOAGI booking";
  const stayId = params.get("stay");
  const amount = Number(params.get("amount"));
  const checkin = params.get("checkin") || "";
  const checkout = params.get("checkout") || "";
  const guestsParam = params.get("guests");

  const [method, setMethod] = useState(METHODS[0].name);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const validAmount = Number.isFinite(amount) && amount > 0;
  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin).getTime();
    const end = new Date(checkout).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return 0;
    return Math.max(0, Math.round((end - start) / 86_400_000));
  }, [checkin, checkout]);

  const backTo = stayId ? `/stays/${stayId}` : "/stays";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!validAmount) {
      toast.error("There is nothing to pay for this request.");
      return;
    }
    if (phone.trim().length < 6) {
      toast.error("Enter the mobile money number you want to pay from.");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setReceipt({
        amount,
        method,
        phone: phone.trim(),
        reference: makeReference(),
      });
      setProcessing(false);
      toast.success("Demo payment recorded.");
    }, 900);
  }

  if (!validAmount) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<Wallet size={24} />}
          title="No payment due"
          description="This checkout link is missing an amount. Open a stay or a booking to start a payment."
          action={
            <Link to="/stays" className="btn btn-primary">
              Browse stays
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page pb-16">
      <div className="py-5">
        <button
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition hover:text-forest"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-2xl">
        <p className="eyebrow">Secure checkout</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">
          Pay for {item}
        </h1>
        <p className="mt-4 text-ink/55">
          Choose a mobile money method and confirm the number you are paying from.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-forest">
            <ShieldCheck size={19} />
            <p className="font-semibold">Payment summary</p>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-ink/50">Item</span>
              <span className="text-right font-medium">{item}</span>
            </div>
            {checkin && checkout && (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-ink/50">Check-in</span>
                  <span className="font-medium">{checkin}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-ink/50">Check-out</span>
                  <span className="font-medium">{checkout}</span>
                </div>
                {nights > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink/50">Nights</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                )}
              </>
            )}
            {guestsParam && (
              <div className="flex justify-between gap-4">
                <span className="text-ink/50">Guests</span>
                <span className="font-medium">{guestsParam}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-ink/8 pt-3 text-base">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-semibold text-forest">{money(amount)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-xs leading-relaxed text-ink/50">
            <p className="inline-flex items-center gap-1.5">
              <Lock size={13} /> Your number is only used to simulate this payment.
            </p>
            <p>This is a demo checkout. No money will be taken and no live mobile money API is called.</p>
          </div>
        </div>

        <aside>
          {receipt ? (
            <div className="card p-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest/10 text-forest">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold">Payment recorded</h2>
              <p className="mt-2 text-sm text-ink/55">{item}</p>

              <div className="mt-5 space-y-2 rounded-2xl bg-cream p-4 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-ink/50">Amount</span>
                  <span className="font-semibold">{money(receipt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/50">Paid via</span>
                  <span className="font-semibold">{receipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/50">Number</span>
                  <span className="font-semibold">{receipt.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/50">Reference</span>
                  <span className="font-semibold">{receipt.reference}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-ink/45">This is a demo payment. No money was taken.</p>
              <Link to="/dashboard" className="btn btn-primary mt-4 w-full">
                View my bookings
              </Link>
              <button
                onClick={() => setReceipt(null)}
                className="mt-2 text-xs text-ink/45 transition hover:text-forest"
              >
                Make another payment
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="card p-5">
              <p className="label">Mobile money</p>
              <div className="grid grid-cols-3 gap-1.5">
                {METHODS.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    onClick={() => setMethod(option.name)}
                    className={`rounded-xl border px-2 py-2.5 text-center transition ${
                      method === option.name
                        ? "border-forest bg-forest/5"
                        : "border-ink/12 hover:border-forest/40"
                    }`}
                  >
                    <Smartphone size={16} className="mx-auto text-forest" />
                    <span className="mt-1 block text-[10px] font-semibold leading-tight">{option.name}</span>
                    <span className="block text-[9px] text-ink/40">{option.note}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="label">Phone number</p>
                <div className="relative">
                  <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+267 7X XXX XXX"
                    className="input pl-9"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-ink/8 pt-4 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Total due</span>
                  <span className="text-forest">{money(amount)}</span>
                </div>
              </div>

              <button className="btn btn-primary mt-4 w-full" disabled={processing || phone.trim().length < 6}>
                <Wallet size={16} />
                {processing ? "Processing..." : `Pay ${money(amount)}`}
              </button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/40">
                Demo payment. No money will be taken. You will get a reference instantly.
              </p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
