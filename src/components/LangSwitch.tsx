import { useI18n } from '../i18n';

export default function LangSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <button
      className="lang-switch"
      onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      aria-label="Switch language"
    >
      {lang === 'ko' ? '🇰🇷' : '🇺🇸'}
    </button>
  );
}
