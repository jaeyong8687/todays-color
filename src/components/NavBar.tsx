import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NavBar() {
  const { t } = useI18n();

  return (
    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <span className="nav-label">{t.navHome}</span>
        <span className="nav-active-dot" />
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-label">{t.navCalendar}</span>
        <span className="nav-active-dot" />
      </NavLink>
      <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-label">{t.navAnalysis}</span>
        <span className="nav-active-dot" />
      </NavLink>
    </nav>
  );
}
