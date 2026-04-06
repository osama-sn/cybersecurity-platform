import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ModeProvider } from './context/ModeContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import SectionsList from './pages/SectionsList';
import SectionPage from './pages/SectionPage';
import TopicPage from './pages/TopicPage';
import Diploma from './pages/Diploma';
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

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "sections", element: <SectionsList /> },
      { path: "sections/:sectionId", element: <SectionPage /> },
      { path: "sections/:sectionId/topics/:topicId", element: <TopicPage /> },
      { path: "diploma", element: <Diploma /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "section/:sectionId", element: <AdminSection /> },
      { path: "modules/:moduleId", element: <AdminModule /> },
      { path: "topics/:topicId", element: <AdminTopicEditor /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  }
], {
  basename: "/cybersecurity-platform"
});

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ModeProvider>
          <RouterProvider router={router} />
        </ModeProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
