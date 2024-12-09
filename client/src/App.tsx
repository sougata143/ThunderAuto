import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import CarList from './pages/CarList'
import CarDetails from './pages/CarDetails'
import Compare from './pages/Compare'
import NotFound from './pages/NotFound'
import { Auth } from './pages/Auth'
import AdminCarManagement from './pages/AdminCarManagement'
import AdminCarForm from './pages/AdminCarForm'
import './styles/automotive.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Auth Route */}
        <Route
          path="/auth"
          element={
            <ProtectedRoute requireAuth={false}>
              <Auth />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="cars" element={<CarList />} />
          <Route path="cars/:id" element={<CarDetails />} />
          <Route path="compare" element={<Compare />} />
          
          {/* Admin Routes */}
          <Route path="admin">
            <Route path="cars" element={<AdminCarManagement />} />
            <Route path="cars/new" element={<AdminCarForm />} />
            <Route path="cars/:id/edit" element={<AdminCarForm />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
