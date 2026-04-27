import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Rentals from './pages/Rentals';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import EquipmentForm from './pages/EquipmentForm';
import EquipmentEdit from './pages/EquipmentEdit';
import LoginPage from './pages/LoginPage';
import Profile from './pages/Profile';
import SetPassword from './pages/SetPassword';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import RentalForm from './pages/RentalForm';
import RentalEdit from './pages/RentalEdit';
import Parts from './pages/Parts';
import PartForm from './pages/PartForm';
import Maintenance from './pages/Maintenance';
import MaintenanceForm from './pages/MaintenanceForm';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Redireciona para /definir-senha se o usuário ainda não definiu sua senha
const PasswordGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // Se o perfil carregou e password_set é false, redireciona
  if (profile && profile.password_set === false) {
    return <Navigate to="/definir-senha" replace />;
  }

  return <>{children}</>;
};

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/definir-senha" element={<SetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PasswordGuard><AppLayout /></PasswordGuard>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/locacoes" element={<Rentals />} />
              <Route path="/locacoes/novo" element={<RentalForm />} />
              <Route path="/locacoes/editar/:id" element={<RentalEdit />} />
              <Route path="/equipamentos" element={<Inventory />} />
              <Route path="/equipamentos/novo" element={<EquipmentForm />} />
              <Route path="/equipamentos/editar/:id" element={<EquipmentEdit />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/clientes/novo" element={<ClientForm />} />
              <Route path="/clientes/:id" element={<ClientForm />} />
              <Route path="/pecas" element={<Parts />} />
              <Route path="/pecas/novo" element={<PartForm />} />
              <Route path="/manutencoes" element={<Maintenance />} />
              <Route path="/manutencoes/nova" element={<MaintenanceForm />} />
              <Route path="/usuarios" element={<Users />} />
              <Route path="/usuarios/novo" element={<UserForm />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/financeiro" element={<Placeholder title="Financeiro" />} />
              <Route path="/rh" element={<Placeholder title="Recursos Humanos" />} />
              <Route path="/configuracoes" element={<Placeholder title="Configurações" />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
