import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import Carrito from './pages/Carrito';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductos from './pages/admin/AdminProductos';
import FormularioProducto from './pages/admin/FormularioProducto';
import AdminOrdenes from './pages/admin/AdminOrdenes';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          }
        />

        {/* Panel del Maestro Herrero: rutas anidadas */}
        <Route
          path="/admin"
          element={
            <RutaProtegida soloAdmin>
              <AdminLayout />
            </RutaProtegida>
          }
        >
          <Route index element={<Navigate to="productos" replace />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<FormularioProducto />} />
          <Route path="productos/:id/editar" element={<FormularioProducto />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
        </Route>

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