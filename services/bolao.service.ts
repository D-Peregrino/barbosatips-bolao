import { createClient } from "@/lib/supabase/server";
import { isSupabaseMock } from "@/lib/supabase/is-mock";
import {
  mockBolaoCreate,
  mockBolaoGetById,
  mockBolaoGetByInviteCode,
  mockBolaoGetPublic,
  mockBolaoGetUserBoloes,
  mockBolaoSubmitPalpite,
} from "@/lib/mock-data";
import type { BolaoCompleto, BolaoWithOwner, Palpite } from "@/types/database.types";
import { generateInviteCode } from "@/lib/utils";

export const bolaoService = {

  async getPublic(limit = 20): Promise<BolaoWithOwner[]> {
    if (isSupabaseMock()) return mockBolaoGetPublic(limit);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("boloes")
      .select(`
        *,
        owner:users!owner_id (
          id, username, display_name, avatar_url
        ),
        member_count:palpites(count)
      `)
      .eq("is_public", true)
      .in("status", ["open", "closed"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data as BolaoWithOwner[];
  },

  async getById(id: string): Promise<BolaoCompleto | null> {
    if (isSupabaseMock()) return mockBolaoGetById(id);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("boloes")
      .select(`
        *,
        owner:users!owner_id (
          id, username, display_name, avatar_url
        ),
        palpites:palpites (
          *,
          user:users!user_id (
            id, username, display_name, avatar_url
          )
        ),
        tips_detalhes:tips (
          *,
          tipster:users!tipster_id (
            id, username, display_name, avatar_url, is_verified
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) return null;
    return data as BolaoCompleto;
  },

  async getByInviteCode(code: string): Promise<BolaoWithOwner | null> {
    if (isSupabaseMock()) return mockBolaoGetByInviteCode(code);

    const supabase = createClient();

    const { data } = await supabase
      .from("boloes")
      .select(`
        *,
        owner:users!owner_id (
          id, username, display_name, avatar_url
        ),
        member_count:palpites(count)
      `)
      .eq("invite_code", code.toUpperCase())
      .single();

    return data as BolaoWithOwner | null;
  },

  async create(payload: {
    name:        string;
    description?: string;
    owner_id:    string;
    deadline:    string;
    tips:        string[];
    is_public:   boolean;
    max_members?: number;
    prize_desc?:  string;
  }): Promise<{ id: string } | null> {
    if (isSupabaseMock()) return mockBolaoCreate(payload);

    const supabase = createClient();

    const invite_code = generateInviteCode(6);

    const { data, error } = await supabase
      .from("boloes")
      .insert({ ...payload, invite_code, status: "open" })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async submitPalpite(payload: {
    bolao_id:  string;
    user_id:   string;
    palpites:  Record<string, string>;
  }): Promise<Palpite | null> {
    if (isSupabaseMock()) return mockBolaoSubmitPalpite(payload);

    const supabase = createClient();

    // Verifica se já tem palpite
    const { data: existing } = await supabase
      .from("palpites")
      .select("id")
      .eq("bolao_id", payload.bolao_id)
      .eq("user_id", payload.user_id)
      .single();

    if (existing) {
      // Atualiza
      const { data } = await supabase
        .from("palpites")
        .update({ palpites: payload.palpites })
        .eq("id", existing.id)
        .select()
        .single();
      return data as Palpite;
    }

    // Cria novo
    const { data, error } = await supabase
      .from("palpites")
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Palpite;
  },

  async getUserBoloes(userId: string): Promise<BolaoWithOwner[]> {
    if (isSupabaseMock()) return mockBolaoGetUserBoloes(userId);

    const supabase = createClient();

    const { data } = await supabase
      .from("boloes")
      .select(`
        *,
        owner:users!owner_id (
          id, username, display_name, avatar_url
        ),
        member_count:palpites(count)
      `)
      .or(`owner_id.eq.${userId},palpites.user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    return (data ?? []) as BolaoWithOwner[];
  },
};
