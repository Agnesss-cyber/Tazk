import { Routes, Route, Navigate } from 'react-router-dom'

import PublicRoute from '../Components/PublicRoute'
import ProtectedRoute from '../Components/ProtectedRoute'

import Landing from '../Pages/landing'
import Login from '../Pages/login'
import Register from '../Pages/register'
import WorkspaceList from '../Pages/WorkspaceList'
import Board from '../Pages/board'
import Invitations from '../Pages/Invitations'
// import Performance from '../Pages/Performance'
// import Workload from '../Pages/Workload'

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/"         element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      { /*Protected routes — commented out until pages are built */ }
      <Route path="/dashboard"
        element={<ProtectedRoute><WorkspaceList /></ProtectedRoute>}
      /> 
       <Route path="/Invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />

       <Route path="/workspace/:workspaceId/board/:boardId"
        element={<ProtectedRoute><Board /></ProtectedRoute>}
      />

      {/* <Route path="/workspace/:workspaceId/performance"
        element={<ProtectedRoute managerOnly><Performance /></ProtectedRoute>}
      /> */}

      {/* <Route path="/workspace/:workspaceId/workload"
        element={<ProtectedRoute managerOnly><Workload /></ProtectedRoute>}
      /> */}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}