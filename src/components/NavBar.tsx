import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NavBar() {
  const { t } = useI18n();

  return (
    <nav className="nav">
      <NavLink
        to="/calendar"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-label">{t.navAnalysis}</span>
      </NavLink>
    </nav>
  );
}
