import { useState, useCallback, useEffect } from 'react';
import type { ColorRecord } from '../types';
import { getRecords, saveRecord, getRecordByDate, deleteRecord } from '../utils/storage';
import { useProfile } from './useProfile';
import { useAuth } from './useKakaoAuth';
import {
  isCloudEnabled,
  cloudGetRecords,
  cloudSaveRecord,
  cloudDeleteRecord,
  migrateLocalToCloud,
} from '../utils/cloud';

export function useColorHistory() {
  const { activeProfile } = useProfile();
  const { user } = useAuth();
  const pid = activeProfile.id;
  const uid = user?.id || 'local';
  const [records, setRecords] = useState<ColorRecord[]>(() => getRecords(pid));

  // Load from cloud on mount / profile change
  useEffect(() => {
    const localRecords = getRecords(pid);
    setRecords(localRecords);

    if (isCloudEnabled() && uid !== 'local') {
      // Migrate local data to cloud (idempotent upsert)
      if (localRecords.length > 0) {
        migrateLocalToCloud(uid, pid, localRecords);
      }
      // Then load from cloud (source of truth)
      cloudGetRecords(uid, pid).then((cloudRecords) => {
        if (cloudRecords.length > 0) {
          setRecords(cloudRecords);
        }
      });
    }
  }, [pid, uid]);

  const refresh = useCallback(() => {
    setRecords(getRecords(pid));
    if (isCloudEnabled() && uid !== 'local') {
      cloudGetRecords(uid, pid).then((cloudRecords) => {
        if (cloudRecords.length > 0) setRecords(cloudRecords);
      });
    }
  }, [pid, uid]);

  const save = useCallback((record: ColorRecord) => {
    saveRecord(pid, record);
    setRecords(getRecords(pid));
    if (isCloudEnabled() && uid !== 'local') {
      cloudSaveRecord(uid, pid, record);
    }
  }, [pid, uid]);

  const getByDate = useCallback((date: string) => {
    return getRecordByDate(pid, date);
  }, [pid]);

  const remove = useCallback((date: string) => {
    deleteRecord(pid, date);
    setRecords(getRecords(pid));
    if (isCloudEnabled() && uid !== 'local') {
      cloudDeleteRecord(uid, pid, date);
    }
  }, [pid, uid]);

  return { records, save, getByDate, remove, refresh };
}
