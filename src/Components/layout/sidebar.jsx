import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Divider, Typography, IconButton, TextField
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import MenuIcon from '@mui/icons-material/Menu'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { createBoardInWorkspace } from '../../api/auth'

const SIDEBAR_WIDTH = 240
const SIDEBAR_COLLAPSED = 68

export default function Sidebar({ collapsed, onToggle, workspaceName = 'Workspace', boards = [], onRenameBoard, onBoardCreated }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaceId, boardId } = useParams()

  const [editingBoardId, setEditingBoardId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [addingBoard, setAddingBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [savingBoard, setSavingBoard] = useState(false)

  const navItems = [
    { label: 'Performance', icon: <BarChartOutlinedIcon fontSize="small" />, path: `/workspace/${workspaceId}/performance` },
    { label: 'Workload', icon: <PeopleOutlinedIcon fontSize="small" />, path: `/workspace/${workspaceId}/workload` },
  ]

  function startRename(board) {
    setEditingBoardId(board.id)
    setEditingName(board.name)
  }

  function cancelRename() {
    setEditingBoardId(null)
    setEditingName('')
  }

  function confirmRename(board) {
    if (editingName.trim() && editingName !== board.name) {
      onRenameBoard(board.id, editingName.trim())
    }
    setEditingBoardId(null)
  }

  async function handleAddBoard() {
    if (!newBoardName.trim() || savingBoard) return
    try {
      setSavingBoard(true)
      const board = await createBoardInWorkspace({
        name: newBoardName.trim(),
        workspaceId,
      })
      onBoardCreated?.(board)
      setNewBoardName('')
      setAddingBoard(false)
      // Navigate to the new board
      navigate(`/workspace/${workspaceId}/board/${board.id}`)
    } catch (err) {
      console.error('Create board failed:', err.message)
    } finally {
      setSavingBoard(false)
    }
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
        flexShrink: 0,
        transition: 'width 0.25s ease',
        '& .MuiDrawer-paper': {
          width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
          transition: 'width 0.25s ease',
          overflowX: 'hidden',
          bgcolor: '#111827',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Logo + collapse */}
      <Box sx={{
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        px: collapsed ? 0 : 2.5,
        borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        {!collapsed && (
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#f1f5f9', letterSpacing: '-0.5px' }}>
            Tazk<span style={{ color: '#3b82f6' }}>.</span>
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small" sx={{ color: '#64748b' }}>
          {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Workspace name */}
      {!collapsed && (
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              bgcolor: 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3b82f6', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
            }}>
              {workspaceName.charAt(0).toUpperCase()}
            </Box>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {workspaceName}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>Workspace</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <List sx={{ px: 1, py: 1.5, flex: 1, overflowY: 'auto' }}>

        {/* Boards header with + button */}
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, mb: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Boards
            </Typography>
            <Tooltip title="Add board">
              <IconButton
                size="small"
                onClick={() => setAddingBoard(true)}
                sx={{ color: '#475569', p: 0.3, '&:hover': { color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.08)' } }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Board list */}
        {boards.map((board) => {
          const active = boardId === String(board.id)
          return (
            <ListItem key={board.id} disablePadding sx={{ mb: 0.5 }}>
              {editingBoardId === board.id && !collapsed ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, width: '100%' }}>
                  <TextField
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename(board)
                      if (e.key === 'Escape') cancelRename()
                    }}
                    autoFocus size="small"
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-input': { fontSize: '0.82rem', color: '#f1f5f9', py: 0.8 },
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& fieldset': { borderColor: '#3b82f6' },
                      }
                    }}
                  />
                  <IconButton size="small" onClick={() => confirmRename(board)} sx={{ color: '#10b981' }}>
                    <CheckIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={cancelRename} sx={{ color: '#64748b' }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ) : (
                <Tooltip title={collapsed ? board.name : ''} placement="right">
                  <ListItemButton
                    onClick={() => navigate(`/workspace/${workspaceId}/board/${board.id}`)}
                    sx={{
                      borderRadius: '10px', minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 1.5 : 2,
                      bgcolor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', '& .rename-btn': { opacity: 1 } },
                      '& .rename-btn': { opacity: 0, transition: 'opacity 0.15s' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, color: active ? '#3b82f6' : '#64748b', justifyContent: 'center' }}>
                      <DashboardOutlinedIcon sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={board.name}
                          primaryTypographyProps={{
                            fontSize: '0.85rem', fontWeight: active ? 600 : 500,
                            color: active ? '#f1f5f9' : '#94a3b8',
                          }}
                        />
                        <IconButton
                          className="rename-btn"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); startRename(board) }}
                          sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              )}
            </ListItem>
          )
        })}

        {/* Inline add board input */}
        {addingBoard && !collapsed && (
          <Box sx={{ px: 1, mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddBoard()
                  if (e.key === 'Escape') { setAddingBoard(false); setNewBoardName('') }
                }}
                autoFocus
                size="small"
                placeholder="Board name"
                disabled={savingBoard}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-input': { fontSize: '0.82rem', color: '#f1f5f9', py: 0.8 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  }
                }}
              />
              <IconButton
                size="small"
                onClick={handleAddBoard}
                disabled={savingBoard || !newBoardName.trim()}
                sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}
              >
                <CheckIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => { setAddingBoard(false); setNewBoardName('') }}
                sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

        {/* Performance & Workload */}
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '10px', minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1.5 : 2,
                    bgcolor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: active ? '#3b82f6' : '#64748b', justifyContent: 'center' }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: active ? 600 : 500, color: active ? '#f1f5f9' : '#94a3b8' }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* All workspaces */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <Tooltip title={collapsed ? 'All Workspaces' : ''} placement="right">
            <ListItemButton
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: '10px', minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: '#64748b', justifyContent: 'center' }}>
                <WorkspacesOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="All Workspaces"
                  primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 500, color: '#94a3b8' }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  )
}