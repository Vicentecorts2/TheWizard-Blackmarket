import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route
          path="*"
          element={
            <main className="contenedor">
              <h1>Te perdiste en la mazmorra</h1>
              <Link to="/" className="volver">← Volver al arsenal</Link>
            </main>
          }
        />
      </Routes>
    </>
  );
}
