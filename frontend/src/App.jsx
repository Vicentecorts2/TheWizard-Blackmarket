import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
        />
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
