import { useState } from 'react'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({ children, workspaceName = 'Workspace', pageTitle = '', boards = [], onRenameBoard, onBoardCreated }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0f1e' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        workspaceName={workspaceName}
        boards={boards}
        onRenameBoard={onRenameBoard}
        onBoardCreated={onBoardCreated}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar pageTitle={pageTitle || workspaceName} />
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#0a0f1e', p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}