import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <span className="nav-icon">🎨</span>
        <span>오늘의 색</span>
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📅</span>
        <span>캘린더</span>
      </NavLink>
      <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">🧠</span>
        <span>감정 분석</span>
      </NavLink>
    </nav>
  );
}
