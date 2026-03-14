import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NavBar() {
  const { t } = useI18n();

  return (
    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <span className="nav-icon">🎨</span>
        <span>{t.navHome}</span>
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📅</span>
        <span>{t.navCalendar}</span>
      </NavLink>
      <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🧠</span>
        <span>{t.navAnalysis}</span>
      </NavLink>
    </nav>
  );
}
