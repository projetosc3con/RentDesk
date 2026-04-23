import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Maintenance from './pages/Maintenance';
import Rentals from './pages/Rentals';
import Users from './pages/Users';
import UserForm from './pages/UserForm';

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-white p-12 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <span className="material-symbols-outlined text-slate-400 text-3xl">construction</span>
    </div>
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <p className="text-slate-500 mt-2">Este módulo está em desenvolvimento.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/locacoes" element={<Rentals />} />
          <Route path="/equipamentos" element={<Inventory />} />
          <Route path="/clientes" element={<Placeholder title="Base de Clientes" />} />
          <Route path="/pecas" element={<Placeholder title="Estoque de Peças" />} />
          <Route path="/manutencoes" element={<Maintenance />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/usuarios/novo" element={<UserForm />} />
          <Route path="/configuracoes" element={<Placeholder title="Configurações" />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
