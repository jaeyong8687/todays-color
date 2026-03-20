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
  cloudGetFirstUserId,
} from '../utils/cloud';

function normalizeRecord(record: ColorRecord): ColorRecord {
  const tags = record.tags
    ?.map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index)
    .slice(0, 3);

  return {
    ...record,
    memo: record.memo ?? '',
    tags: tags && tags.length > 0 ? tags : undefined,
  };
}

export function useColorHistory() {
  const { activeProfile } = useProfile();
  const { user } = useAuth();
  const pid = activeProfile.id;
  const isDev = window.location.port === '3100';
  const [resolvedUid, setResolvedUid] = useState<string>(user?.id || 'local');
  const [records, setRecords] = useState<ColorRecord[]>(() => getRecords(pid));

  // In dev mode without auth, resolve the first cloud user
  useEffect(() => {
    if (user?.id) {
      setResolvedUid(user.id);
    } else if (isDev && isCloudEnabled()) {
      cloudGetFirstUserId().then((id) => {
        if (id) setResolvedUid(id);
      });
    }
  }, [user?.id, isDev]);

  const uid = resolvedUid;

  useEffect(() => {
    const localRecords = getRecords(pid);
    setRecords(localRecords);

    if (isCloudEnabled() && uid !== 'local') {
      if (localRecords.length > 0) {
        migrateLocalToCloud(uid, pid, localRecords);
      }
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
    const nextRecord = normalizeRecord(record);
    saveRecord(pid, nextRecord);
    setRecords(getRecords(pid));
    if (isCloudEnabled() && uid !== 'local') {
      cloudSaveRecord(uid, pid, nextRecord);
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
