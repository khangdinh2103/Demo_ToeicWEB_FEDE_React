import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import PracticePage from './pages/PracticePage'
import AIToolsPage from './pages/AIToolsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import PlacementTestPage from './pages/PlacementTestPage'
import PlacementTestResultPage from './pages/PlacementTestResultPage'
import DashboardPage from './pages/DashboardPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LearningPathPage from './pages/LearningPathPage'
import LearningPathDetailPage from './pages/LearningPathDetailPage'
import EnrolledRoadmapDetailPage from './pages/EnrolledRoadmapDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from './pages/admin/AdminPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import TestManagerPage from './pages/admin/TestManagerPage'
import TestEditorPage from './pages/admin/TestEditorPage'
import QuestionBankPage from './pages/admin/QuestionBankPage'
import PracticeManagementPage from './pages/admin/PracticeManagementPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import SettingsPage from './pages/admin/SettingsPage'
import RoadmapManagementPage from './pages/admin/RoadmapManagementPage'
import RoadmapBuilderPage from './pages/admin/RoadmapBuilderPage'
import CourseBuilderPage from './pages/admin/CourseBuilderPage'
import VocabularySetPracticePage from './pages/VocabularySetPracticePage'
import VocabularyExercisePage from './pages/VocabularyExercisePage'
import CreateVocabularySetPage from './pages/CreateVocabularySetPage'
import DictationPlayerPage from './pages/DictationPlayerPage'
import ToeicTestPage from './pages/ToeicTestPage'
import TestByPartPage from './pages/TestByPartPage'
import TestResultPage from './pages/TestResultPage'
import TestReviewPage from './pages/TestReviewPage'
import VocabularySetDetailPage from './pages/admin/VocabularySetDetailPage'
import DictationDetailPage from './pages/admin/DictationDetailPage'
import { Toaster } from './components/ui/toaster'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
          {/* Pages with Navbar */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
          <Route path="/practice" element={<Layout><PracticePage /></Layout>} />
          <Route path="/ai-tools" element={<Layout><AIToolsPage /></Layout>} />
          <Route path="/placement-test" element={<Layout><PlacementTestPage /></Layout>} />
          <Route path="/placement-test/result" element={<PlacementTestResultPage />} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
          <Route path="/learning-path" element={<Layout><LearningPathPage /></Layout>} />
          <Route path="/learning-path/detail/:roadmapId" element={<Layout><LearningPathDetailPage /></Layout>} />
          <Route path="/learning-path/detail" element={<Layout><LearningPathDetailPage /></Layout>} />
          <Route path="/my-roadmaps/:enrollmentId" element={<Layout><EnrolledRoadmapDetailPage /></Layout>} />
          <Route path="/courses/:id" element={<Layout><CourseDetailPage /></Layout>} />
          <Route path="/practice/vocabulary/:setId" element={<Layout><VocabularySetPracticePage /></Layout>} />
          <Route path="/practice/vocabulary/:setId/exercises" element={<Layout><VocabularyExercisePage /></Layout>} />
          <Route path="/practice/my-vocabulary/:setId/exercises" element={<Layout><VocabularyExercisePage /></Layout>} />
          <Route path="/practice/create-vocabulary" element={<Layout><CreateVocabularySetPage /></Layout>} />
          <Route path="/practice/dictation/:dictationId" element={<DictationPlayerPage />} />
          
          {/* Test pages - No Layout (full screen) */}
          <Route path="/practice/test/:testId/full" element={<ToeicTestPage />} />
          <Route path="/practice/test/:testId/by-part" element={<TestByPartPage />} />
          <Route path="/practice/test/:testId/review" element={<TestReviewPage />} />
          <Route path="/practice/test/:testId/result" element={<TestResultPage />} />
          
          {/* Pages without Navbar (Auth pages) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          
          {/* Admin pages - Protected (Admin only) */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/roadmaps" element={<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><RoadmapManagementPage /></ProtectedRoute>} />
          <Route path="/admin/roadmaps/:id" element={<ProtectedRoute requiredRole="admin"><RoadmapBuilderPage /></ProtectedRoute>} />
          <Route path="/admin/courses/:id" element={<ProtectedRoute requiredRole="admin"><CourseBuilderPage /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute requiredRole="admin"><TestManagerPage /></ProtectedRoute>} />
          <Route path="/admin/tests/edit/:id" element={<ProtectedRoute requiredRole="admin"><TestEditorPage /></ProtectedRoute>} />
          <Route path="/admin/question-bank" element={<ProtectedRoute requiredRole="admin"><QuestionBankPage /></ProtectedRoute>} />
          <Route path="/admin/practice" element={<ProtectedRoute requiredRole="admin"><PracticeManagementPage /></ProtectedRoute>} />
          <Route path="/admin/vocabulary/:id" element={<ProtectedRoute requiredRole="admin"><VocabularySetDetailPage /></ProtectedRoute>} />
          <Route path="/admin/dictation/:id" element={<ProtectedRoute requiredRole="admin"><DictationDetailPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><SettingsPage /></ProtectedRoute>} />
        </Routes>
        <Toaster />
      </div>
    </Router>
    </AuthProvider>
  )
}

export default App
