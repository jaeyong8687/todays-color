import type { ColorRecord, Profile } from '../types';

let _accountId = 'local'; // default for unauthenticated
const MAX_RECENT_TAGS = 12;

export function setAccountId(id: string) {
  _accountId = id;
}

function profilesKey() {
  return `todays-color-${_accountId}-profiles`;
}

function activeProfileKey() {
  return `todays-color-${_accountId}-active-profile`;
}

function recordsKey(profileId: string) {
  return `todays-color-${_accountId}-${profileId}-records`;
}

function recentTagsKey(profileId: string) {
  return `todays-color-${_accountId}-${profileId}-recent-tags`;
}

function normalizeTags(tags?: string[]): string[] | undefined {
  if (!Array.isArray(tags)) return undefined;

  const normalized = tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index)
    .slice(0, 3);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeRecord(record: ColorRecord): ColorRecord {
  return {
    ...record,
    memo: record.memo ?? '',
    tags: normalizeTags(record.tags),
  };
}

function mergeRecentTags(existing: string[], incoming?: string[]): string[] {
  if (!incoming || incoming.length === 0) return existing;

  const next = [...existing];
  for (const tag of incoming) {
    const normalized = tag.trim();
    if (!normalized) continue;
    const existingIndex = next.findIndex((item) => item.toLowerCase() === normalized.toLowerCase());
    if (existingIndex >= 0) next.splice(existingIndex, 1);
    next.unshift(normalized);
  }

  return next.slice(0, MAX_RECENT_TAGS);
}

// --- Profile management ---

const DEFAULT_PROFILES: Profile[] = [
  { id: 'default', name: '나', emoji: '🙂' },
];

export function getProfiles(): Profile[] {
  const data = localStorage.getItem(profilesKey());
  if (!data) {
    localStorage.setItem(profilesKey(), JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  }
  return JSON.parse(data);
}

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(profilesKey(), JSON.stringify(profiles));
}

export function addProfile(name: string, emoji: string): Profile {
  const profiles = getProfiles();
  const profile: Profile = { id: `profile-${Date.now()}`, name, emoji };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(id: string): void {
  const profiles = getProfiles().filter((p) => p.id !== id);
  saveProfiles(profiles);
  localStorage.removeItem(recordsKey(id));
  localStorage.removeItem(recentTagsKey(id));
}

export function getActiveProfileId(): string {
  return localStorage.getItem(activeProfileKey()) || 'default';
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(activeProfileKey(), id);
}

// --- Records (profile-scoped) ---

export function getRecords(profileId: string): ColorRecord[] {
  const data = localStorage.getItem(recordsKey(profileId));
  if (!data) return [];

  try {
    const parsed = JSON.parse(data) as ColorRecord[];
    return parsed.map(normalizeRecord);
  } catch {
    return [];
  }
}

export function saveRecord(profileId: string, record: ColorRecord): void {
  const records = getRecords(profileId);
  const normalizedRecord = normalizeRecord(record);
  const existingIndex = records.findIndex((r) => r.date === normalizedRecord.date);
  if (existingIndex >= 0) {
    records[existingIndex] = normalizedRecord;
  } else {
    records.push(normalizedRecord);
  }
  records.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(recordsKey(profileId), JSON.stringify(records));
  saveRecentTags(profileId, mergeRecentTags(getRecentTags(profileId), normalizedRecord.tags));
}

export function getRecordByDate(profileId: string, date: string): ColorRecord | undefined {
  return getRecords(profileId).find((r) => r.date === date);
}

export function getRecordsByMonth(profileId: string, year: number, month: number): ColorRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getRecords(profileId).filter((r) => r.date.startsWith(prefix));
}

export function getRecentTags(profileId: string): string[] {
  const data = localStorage.getItem(recentTagsKey(profileId));
  if (!data) return [];

  try {
    const parsed = JSON.parse(data) as string[];
    return parsed.map((tag) => tag.trim()).filter(Boolean).slice(0, MAX_RECENT_TAGS);
  } catch {
    return [];
  }
}

export function saveRecentTags(profileId: string, tags: string[]): void {
  const normalized = mergeRecentTags([], tags);
  localStorage.setItem(recentTagsKey(profileId), JSON.stringify(normalized));
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function isFutureDate(dateStr: string): boolean {
  return dateStr > getTodayString();
}

export function deleteRecord(profileId: string, date: string): void {
  const records = getRecords(profileId).filter((r) => r.date !== date);
  localStorage.setItem(recordsKey(profileId), JSON.stringify(records));
}
