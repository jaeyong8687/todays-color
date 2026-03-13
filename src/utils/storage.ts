import type { ColorRecord, Profile } from '../types';

let _accountId = 'local'; // default for unauthenticated

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
  return data ? JSON.parse(data) : [];
}

export function saveRecord(profileId: string, record: ColorRecord): void {
  const records = getRecords(profileId);
  const existingIndex = records.findIndex((r) => r.date === record.date);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  records.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(recordsKey(profileId), JSON.stringify(records));
}

export function getRecordByDate(profileId: string, date: string): ColorRecord | undefined {
  return getRecords(profileId).find((r) => r.date === date);
}

export function getRecordsByMonth(profileId: string, year: number, month: number): ColorRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getRecords(profileId).filter((r) => r.date.startsWith(prefix));
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
