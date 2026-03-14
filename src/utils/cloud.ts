import { createClient } from '@supabase/supabase-js';
import type { ColorRecord, Profile } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export function isCloudEnabled(): boolean {
  return !!supabase;
}

// --- Color Records ---

export async function cloudGetRecords(kakaoUserId: string, profileId: string): Promise<ColorRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('color_records')
    .select('*')
    .eq('kakao_user_id', kakaoUserId)
    .eq('profile_id', profileId)
    .order('date', { ascending: true });

  if (error) { console.error('[Supabase] getRecords:', error); return []; }
  return (data || []).map(rowToRecord);
}

export async function cloudSaveRecord(kakaoUserId: string, profileId: string, record: ColorRecord): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('color_records')
    .upsert({
      kakao_user_id: kakaoUserId,
      profile_id: profileId,
      date: record.date,
      color: record.color,
      memo: record.memo,
      emotion: record.emotion,
    }, { onConflict: 'kakao_user_id,profile_id,date' });

  if (error) console.error('[Supabase] saveRecord:', error);
}

export async function cloudDeleteRecord(kakaoUserId: string, profileId: string, date: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('color_records')
    .delete()
    .eq('kakao_user_id', kakaoUserId)
    .eq('profile_id', profileId)
    .eq('date', date);

  if (error) console.error('[Supabase] deleteRecord:', error);
}

// --- Profiles ---

export async function cloudGetProfiles(kakaoUserId: string): Promise<Profile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('kakao_user_id', kakaoUserId)
    .order('created_at', { ascending: true });

  if (error) { console.error('[Supabase] getProfiles:', error); return []; }
  return (data || []).map((r) => ({ id: r.profile_id, name: r.name, emoji: r.emoji }));
}

export async function cloudSaveProfile(kakaoUserId: string, profile: Profile): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({
      kakao_user_id: kakaoUserId,
      profile_id: profile.id,
      name: profile.name,
      emoji: profile.emoji,
    }, { onConflict: 'kakao_user_id,profile_id' });

  if (error) console.error('[Supabase] saveProfile:', error);
}

export async function cloudDeleteProfile(kakaoUserId: string, profileId: string): Promise<void> {
  if (!supabase) return;
  const { error: recErr } = await supabase
    .from('color_records')
    .delete()
    .eq('kakao_user_id', kakaoUserId)
    .eq('profile_id', profileId);
  if (recErr) console.error('[Supabase] deleteProfile records:', recErr);

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('kakao_user_id', kakaoUserId)
    .eq('profile_id', profileId);
  if (error) console.error('[Supabase] deleteProfile:', error);
}

// --- Helpers ---

function rowToRecord(row: Record<string, unknown>): ColorRecord {
  return {
    date: row.date as string,
    color: row.color as ColorRecord['color'],
    memo: row.memo as string,
    emotion: row.emotion as ColorRecord['emotion'],
  };
}

// --- Migration: push localStorage to cloud ---

export async function migrateLocalToCloud(kakaoUserId: string, profileId: string, records: ColorRecord[]): Promise<void> {
  if (!supabase || records.length === 0) return;

  const rows = records.map((r) => ({
    kakao_user_id: kakaoUserId,
    profile_id: profileId,
    date: r.date,
    color: r.color,
    memo: r.memo,
    emotion: r.emotion,
  }));

  const { error } = await supabase
    .from('color_records')
    .upsert(rows, { onConflict: 'kakao_user_id,profile_id,date' });

  if (error) console.error('[Supabase] migration:', error);
}
