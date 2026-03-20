import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NavBar() {
  const { t } = useI18n();
  const items = [
    { to: '/', label: t.navRecord },
    { to: '/calendar', label: t.navCalendar },
    { to: '/analysis', label: t.navAnalysis },
  ];

  return (
    <nav className="nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
