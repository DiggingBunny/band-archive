import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">🎸 밴드 아카이브</Link>
      <div className="nav-links">
        <Link to="/" className={isActive('/')}>홈</Link>
        <Link to="/songs" className={isActive('/songs')}>곡별</Link>
        <Link to="/dates" className={isActive('/dates')}>일자별</Link>
        <Link to="/upload" className={isActive('/upload')}>업로드</Link>
      </div>
    </nav>
  );
}
