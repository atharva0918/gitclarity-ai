import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, Mail, Calendar, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
}

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/"); return; }
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email, created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) toast.error(error.message);
      else setProfile(data);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  if (!user) return null;
  const initials = (profile?.display_name ?? user.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <h1 className="text-2xl font-heading font-bold mb-8">Manage Account</h1>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border border-border">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="bg-accent text-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-heading font-semibold text-lg">{profile?.display_name ?? "User"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email ?? user.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Display Name</span>
                <span>{profile?.display_name ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Email</span>
                <span>{profile?.email ?? user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground w-32">Account Created</span>
                <span>{profile?.created_at ? format(new Date(profile.created_at), "PPP") : "—"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="h-10 px-4 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors inline-flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
