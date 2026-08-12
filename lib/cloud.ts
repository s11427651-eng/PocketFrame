import { getClient } from "./supabase";

export type CloudSession = { email: string; name: string } | null;

export const cloud = {
  async login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const client = getClient();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch {
      return { ok: false, error: "Cloud sign-in failed. Check your connection." };
    }
  },

  async register(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const client = getClient();
      const { error } = await client.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch {
      return { ok: false, error: "Cloud sign-up failed. Check your connection." };
    }
  },

  async signOut() {
    try {
      const client = getClient();
      await client.auth.signOut();
    } catch {
      /* ignore */
    }
  },

  async ensureWorkspace(name: string): Promise<{ workspace_id: string; invite_code: string }> {
    const client = getClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not signed in");

    // find existing membership
    const { data: mine } = await client
      .from("workspace_members")
      .select("workspace_id, workspaces(invite_code)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mine?.workspace_id) {
      const w = mine.workspaces as unknown as { invite_code: string };
      return { workspace_id: mine.workspace_id as string, invite_code: w?.invite_code || "" };
    }

    // create workspace
    const code = makeCode();
    const { data: ws, error } = await client
      .from("workspaces")
      .insert({ name, invite_code: code, created_by: user.id })
      .select("id")
      .single();
    if (error || !ws) throw new Error(error?.message || "Could not create workspace");

    await client.from("workspace_members").insert({ workspace_id: ws.id, user_id: user.id, role: "owner" });
    return { workspace_id: ws.id as string, invite_code: code };
  },

  async joinWorkspace(code: string): Promise<{ ok: boolean; error?: string; workspace_id?: string }> {
    try {
      const client = getClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user) return { ok: false, error: "Not signed in." };

      const { data: ws } = await client
        .from("workspaces")
        .select("id")
        .eq("invite_code", code.trim().toUpperCase())
        .maybeSingle();
      if (!ws) return { ok: false, error: "Invite code not found." };

      const { error } = await client
        .from("workspace_members")
        .insert({ workspace_id: ws.id, user_id: user.id, role: "member" });
      if (error) return { ok: false, error: "Could not join workspace." };

      return { ok: true, workspace_id: ws.id as string };
    } catch {
      return { ok: false, error: "Could not join workspace." };
    }
  },

  async currentWorkspace(): Promise<{ workspace_id: string; invite_code: string; workspaceName?: string } | null> {
    try {
      const client = getClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user) return null;
      const { data: mine } = await client
        .from("workspace_members")
        .select("workspace_id, workspaces(invite_code), workspaces(name)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mine) return null;
      const w = mine.workspaces as unknown as { invite_code: string; name: string };
      return {
        workspace_id: mine.workspace_id as string,
        invite_code: w?.invite_code || "",
        workspaceName: w?.name,
      };
    } catch {
      return null;
    }
  },
};

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}