import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Github, Bookmark, Clock, LogOut, Settings, User as UserIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthModal from "./auth/AuthModal";
import logo from "@/assets/logo.png";

interface NavbarProps {
  showHomeLinks?: boolean;
}

export default function Navbar({ showHomeLinks = false }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <>
      <nav className="fixed top-0 w-full z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src={logo} alt="GitClarity" className="h-7 w-7" />
            <span className="text-lg font-heading font-bold tracking-tight">GitClarity</span>
          </Link>

          <div className="flex items-center gap-6 text-sm">
            {showHomeLinks && !user && (
              <>
                <a href="#features" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                <a href="#about" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">About</a>
              </>
            )}

            {user ? (
              <>
                <Link to="/saved" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Bookmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved</span>
                </Link>
                <Link to="/recents" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Recents</span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-8 w-8 border border-border">
                      {avatarUrl && <AvatarImage src={avatarUrl} />}
                      <AvatarFallback className="bg-accent text-foreground text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" /> Manage Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => { await signOut(); navigate("/"); }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Login / Sign Up
                </button>
                <a
                  href="https://github.com"
                  target="_blank" rel="noopener noreferrer"
                  className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
