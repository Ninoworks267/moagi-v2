import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { CATEGORIES, CategoryMark } from "../lib/categories";
import { Avatar } from "./Avatar";
import { fullName } from "../lib/format";

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-cream shadow-sm transition group-hover:rounded-2xl">
        <Home size={18} strokeWidth={2.2} />
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
        MOAGI<span className="text-clay">.</span>
      </span>
    </Link>
  );
}

const navLinks = [
  { to: "/houses", label: "Homes" },
  { to: "/stays", label: "Stays" },
  { to: "/#how-it-works", label: "How it works" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useQuery({
    queryKey: ["unread"],
    queryFn: () => api<{ unread: number }>("/messages/unread"),
    enabled: Boolean(user),
    refetchInterval: 45_000,
  });

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handle(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const unreadCount = unread?.unread ?? 0;

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-cream/85 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.to.includes("#") ? (
              <a
                key={link.to}
                href={link.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-forest/5 hover:text-forest"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-forest/8 text-forest" : "text-ink/70 hover:bg-forest/5 hover:text-forest"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/messages"
                className="relative grid h-10 w-10 place-items-center rounded-full text-ink/70 transition hover:bg-forest/5 hover:text-forest"
                aria-label="Messages"
              >
                <MessageSquare size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-cream">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/favorites"
                className="grid h-10 w-10 place-items-center rounded-full text-ink/70 transition hover:bg-forest/5 hover:text-forest"
                aria-label="Saved homes"
              >
                <Heart size={19} />
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1 pl-1 pr-3 transition hover:border-forest/30"
                >
                  <Avatar
                    avatarUrl={user.avatar_url}
                    first={user.first_name}
                    last={user.surname}
                    size="sm"
                  />
                  <span className="max-w-[110px] truncate text-sm font-medium">{user.first_name}</span>
                  <ChevronDown size={14} className={`text-ink/40 transition ${menuOpen ? "rotate-180" : ""}`} />
                </button>
                {menuOpen && (
                  <div className="animate-scale-in absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-xl">
                    <div className="border-b border-ink/8 px-3 py-2">
                      <p className="truncate text-sm font-semibold">{fullName(user)}</p>
                      <p className="truncate text-xs text-ink/45">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="menu-item">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/favorites" className="menu-item">
                      <Heart size={16} /> Saved homes
                    </Link>
                    <Link to="/messages" className="menu-item">
                      <MessageSquare size={16} /> Messages
                      {unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-clay/10 px-2 py-0.5 text-[10px] font-bold text-clay">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/profile" className="menu-item">
                      <UserRound size={16} /> My profile
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="menu-item">
                        <Shield size={16} /> Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="menu-item w-full text-left text-clay hover:bg-clay/5">
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join MOAGI
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full text-ink md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="border-t border-ink/8 bg-cream/60">
        <div className="no-scrollbar container-page flex items-center gap-0.5 overflow-x-auto py-1.5 sm:gap-1.5 sm:py-2">
          <span className="mr-1 hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/35 sm:block">
            Browse
          </span>
          <Link
            to="/houses"
            className={`shrink-0 rounded-full px-2 py-1.5 text-[11px] font-semibold transition sm:px-3.5 sm:py-2 sm:text-xs ${
              location.pathname === "/houses" && !new URLSearchParams(location.search).get("category")
                ? "bg-forest text-cream"
                : "text-ink/60 hover:bg-forest/8 hover:text-forest"
            }`}
          >
            <span className="sm:hidden">All</span>
            <span className="hidden sm:inline">All homes</span>
          </Link>
          {CATEGORIES.map((category) => {
            const active =
              location.pathname === "/houses" &&
              new URLSearchParams(location.search).get("category") === category.value;
            return (
              <Link
                key={category.value}
                to={`/houses?category=${category.value}`}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs ${
                  active ? "bg-forest text-cream" : "text-ink/60 hover:bg-forest/8 hover:text-forest"
                }`}
              >
                <CategoryMark category={category} size={13} />
                {category.label}
              </Link>
            );
          })}
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-ink/8 bg-cream px-5 pb-6 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) =>
              link.to.includes("#") ? (
                <a key={link.to} href={link.to} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-forest/5">
                  {link.label}
                </a>
              ) : (
                <Link key={link.to} to={link.to} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-forest/5">
                  {link.label}
                </Link>
              ),
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink/8 pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar avatarUrl={user.avatar_url} first={user.first_name} last={user.surname} size="md" />
                  <div>
                    <p className="text-sm font-semibold">{fullName(user)}</p>
                    <p className="text-xs text-ink/45">{user.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" className="btn btn-ghost w-full">Dashboard</Link>
                <Link to="/favorites" className="btn btn-ghost w-full">Saved homes</Link>
                <Link to="/messages" className="btn btn-ghost w-full">
                  Messages {unreadCount > 0 ? `(${unreadCount})` : ""}
                </Link>
                {user.role === "admin" && <Link to="/admin" className="btn btn-ghost w-full">Admin</Link>}
                <button onClick={handleLogout} className="btn btn-primary w-full">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost w-full">Log in</Link>
                <Link to="/register" className="btn btn-primary w-full">Join MOAGI</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-forest text-cream">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight">
            MOAGI<span className="text-gold">.</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
            Botswana's home-finding space. Real homes, real people, and a better way to settle in.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-cream/40">Gaborone · Francistown · Maun · Kasane · Molepolole</p>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/45">Explore</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            <li><Link to="/houses" className="hover:text-gold">Rental homes</Link></li>
            <li><Link to="/stays" className="hover:text-gold">Short stays</Link></li>
            <li><Link to="/register" className="hover:text-gold">Create an account</Link></li>
            <li><Link to="/login" className="hover:text-gold">Log in</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/45">Landlords</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            <li><Link to="/dashboard" className="hover:text-gold">Landlord dashboard</Link></li>
            <li><Link to="/properties/new" className="hover:text-gold">List a home</Link></li>
            <li><Link to="/reports" className="hover:text-gold">Report a concern</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/45">Support</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            <li><a href="/#how-it-works" className="hover:text-gold">How MOAGI works</a></li>
            <li><Link to="/reports" className="hover:text-gold">Safety & reporting</Link></li>
            <li><a href="mailto:hello@moagi.co.bw" className="hover:text-gold">hello@moagi.co.bw</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/45 sm:flex-row">
          <p>© {new Date().getFullYear()} MOAGI. Built in Botswana.</p>
          <p>Pula. People. Places.</p>
        </div>
      </div>
    </footer>
  );
}
