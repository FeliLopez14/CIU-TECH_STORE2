import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { FooterNav } from './components/FooterNav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ThemeToggle } from './components/ThemeToggle'
import { useAuth } from './hooks/useAuth'
import { CreatePostPage } from './pages/CreatePostPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { EditPostPage } from './pages/EditPostPage'

function AppLayout() {
  const { currentUser } = useAuth()

  return (
    <div className="app-shell">
      {!currentUser ? (
        <div className="auth-theme-toggle">
          <ThemeToggle />
        </div>
      ) : null}
      <main className="page-frame">
        <Routes>
          <Route path="/" element={<Navigate to={currentUser ? '/feed' : '/login'} replace />} />
          <Route path="/login" element={currentUser ? <Navigate to="/feed" replace /> : <LoginPage />} />
          <Route
            path="/register"
            element={currentUser ? <Navigate to="/feed" replace /> : <RegisterPage />}
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id/edit"
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {currentUser ? <FooterNav /> : null}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
