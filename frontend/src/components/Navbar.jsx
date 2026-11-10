import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">🧙 TheWizard Blackmarket</Link>
      <nav>
        <Link to="/">Catálogo</Link>
      </nav>
    </header>
  );
}