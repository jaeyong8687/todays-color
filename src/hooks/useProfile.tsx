import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Profile } from '../types';
import {
  getProfiles,
  addProfile as addProfileStorage,
  deleteProfile as deleteProfileStorage,
  getActiveProfileId,
  setActiveProfileId,
} from '../utils/storage';

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile;
  switchProfile: (id: string) => void;
  addProfile: (name: string, emoji: string) => void;
  removeProfile: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextType>(null!);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(getProfiles);
  const [activeId, setActiveId] = useState<string>(getActiveProfileId);

  const activeProfile = profiles.find((p) => p.id === activeId) || profiles[0];

  const switchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    setActiveId(id);
  }, []);

  const addProfile = useCallback((name: string, emoji: string) => {
    const p = addProfileStorage(name, emoji);
    setProfiles(getProfiles());
    switchProfile(p.id);
  }, [switchProfile]);

  const removeProfile = useCallback((id: string) => {
    if (profiles.length <= 1) return;
    deleteProfileStorage(id);
    const updated = getProfiles();
    setProfiles(updated);
    if (activeId === id) {
      switchProfile(updated[0].id);
    }
  }, [profiles, activeId, switchProfile]);

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, switchProfile, addProfile, removeProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
