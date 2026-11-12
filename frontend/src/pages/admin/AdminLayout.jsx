import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <main className="contenedor">
      <h1>⚒️ La Forja del Maestro Herrero</h1>

      <nav className="pestanas">
        <NavLink to="/admin/productos">Productos</NavLink>
        <NavLink to="/admin/ordenes">Órdenes</NavLink>
      </nav>

      {/* Aquí se dibuja la sección activa */}
      <Outlet />
    </main>
  );
}