import { Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { ComparisonPage } from './pages/ComparisonPage';
import { LandingPage } from './pages/LandingPage';
import { MasterDetailPage } from './pages/MasterDetailPage';
import { ProfileFormPage } from './pages/ProfileFormPage';
import { ResultsPage } from './pages/ResultsPage';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/perfil" element={<ProfileFormPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
          <Route path="/masters/:id" element={<MasterDetailPage />} />
          <Route path="/comparar" element={<ComparisonPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
