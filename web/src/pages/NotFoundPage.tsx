import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="eyebrow">404</span>
      <div className="mt-4 grid h-16 w-16 place-items-center rounded-2xl bg-mist text-forest">
        <Compass size={30} />
      </div>
      <h1 className="mt-6 text-balance text-4xl font-semibold sm:text-5xl">This door doesn't open.</h1>
      <p className="mt-3 max-w-md text-sm text-ink/55">
        The page you're looking for may have moved, or the link might be wrong. Let's get you back to
        somewhere familiar.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary"><ArrowLeft size={16} /> Back home</Link>
        <Link to="/houses" className="btn btn-ghost">Browse homes</Link>
        <Link to="/stays" className="btn btn-ghost">Browse stays</Link>
      </div>
    </div>
  );
}
