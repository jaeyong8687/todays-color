import { useState, useCallback, useEffect } from 'react';
import type { ColorRecord } from '../types';
import { getRecords, saveRecord, getRecordByDate, deleteRecord } from '../utils/storage';
import { useProfile } from './useProfile';

export function useColorHistory() {
  const { activeProfile } = useProfile();
  const pid = activeProfile.id;
  const [records, setRecords] = useState<ColorRecord[]>(() => getRecords(pid));

  useEffect(() => {
    setRecords(getRecords(pid));
  }, [pid]);

  const refresh = useCallback(() => {
    setRecords(getRecords(pid));
  }, [pid]);

  const save = useCallback((record: ColorRecord) => {
    saveRecord(pid, record);
    refresh();
  }, [pid, refresh]);

  const getByDate = useCallback((date: string) => {
    return getRecordByDate(pid, date);
  }, [pid]);

  const remove = useCallback((date: string) => {
    deleteRecord(pid, date);
    refresh();
  }, [pid, refresh]);

  return { records, save, getByDate, remove, refresh };
}
