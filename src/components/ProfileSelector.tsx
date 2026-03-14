import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useI18n } from '../i18n';

const EMOJI_OPTIONS = ['🙂', '👧', '👦', '👶', '🐱', '🐶', '🌸', '⭐', '🎀', '💜'];

export default function ProfileSelector() {
  const { profiles, activeProfile, switchProfile, addProfile, removeProfile } = useProfile();
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('👧');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addProfile(newName.trim(), newEmoji);
    setNewName('');
    setNewEmoji('👧');
    setShowAdd(false);
  };

  return (
    <div className="profile-bar">
      <div className="profile-chips">
        {profiles.map((p) => (
          <button
            key={p.id}
            className={`profile-chip ${p.id === activeProfile.id ? 'active' : ''}`}
            onClick={() => switchProfile(p.id)}
          >
            <span>{p.emoji}</span>
            <span>{p.name}</span>
          </button>
        ))}
        <button className="profile-chip add" onClick={() => setShowAdd(!showAdd)}>
          {t.addProfile}
        </button>
      </div>

      {showAdd && (
        <div className="profile-add-form">
          <div className="profile-emoji-picker">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                className={`emoji-btn ${newEmoji === e ? 'active' : ''}`}
                onClick={() => setNewEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="profile-add-row">
            <input
              className="profile-name-input"
              placeholder={t.profileNamePlaceholder}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              maxLength={10}
            />
            <button className="btn-small" onClick={handleAdd}>{t.createBtn}</button>
          </div>
          {profiles.length > 1 && (
            <button
              className="btn-text-danger"
              onClick={() => { removeProfile(activeProfile.id); setShowAdd(false); }}
            >
              {t.deleteProfile(activeProfile.name)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
