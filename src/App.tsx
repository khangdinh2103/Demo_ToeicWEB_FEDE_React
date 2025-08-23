import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import PracticePage from './pages/PracticePage'
import AIToolsPage from './pages/AIToolsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PlacementTestPage from './pages/PlacementTestPage'
import DashboardPage from './pages/DashboardPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LearningPathPage from './pages/LearningPathPage'
import AdminPage from './pages/AdminPage'
import TestManagerPage from './pages/TestManagerPage'
import TestEditorPage from './pages/TestEditorPage'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/ai-tools" element={<AIToolsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/placement-test" element={<PlacementTestPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tests" element={<TestManagerPage />} />
          <Route path="/tests/edit/:id" element={<TestEditorPage />} />
          <Route path="/learning-path" element={<LearningPathPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
