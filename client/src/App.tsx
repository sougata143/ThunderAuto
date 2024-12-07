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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
