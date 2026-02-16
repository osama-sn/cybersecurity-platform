import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ModeProvider } from './context/ModeContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import SectionsList from './pages/SectionsList';
import SectionPage from './pages/SectionPage';
import TopicPage from './pages/TopicPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSection from './pages/admin/AdminSection';
import AdminModule from './pages/admin/AdminModule';
import AdminTopicEditor from './pages/admin/AdminTopicEditor';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './pages/Settings';

const NotFound = () => <div className="text-center mt-20"><h1>404</h1><p>Page not found</p></div>;

function App() {
  return (
    <BrowserRouter basename="/cybersecurity-platform">
      <AuthProvider>
        <DataProvider>
          <ModeProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="sections" element={<SectionsList />} />
                <Route path="sections/:sectionId" element={<SectionPage />} />
                <Route path="topics/:topicId" element={<TopicPage />} />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="section/:sectionId" element={<AdminSection />} />
                <Route path="modules/:moduleId" element={<AdminModule />} />
                <Route path="topics/:topicId" element={<AdminTopicEditor />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ModeProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
