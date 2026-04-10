import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getPendingInvitations, sendInvitation } from '../../api/auth'
import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Tooltip, Box, Menu, MenuItem, Divider, Badge,
  InputBase, Button, alpha, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

export default function Topbar({ pageTitle = '' }) {
  const navigate = useNavigate()
  const { workspaceId } = useParams()
  const { user, logout } = useAuthStore()

  const [anchorEl, setAnchorEl] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    if (user?.email) fetchPendingCount()
  }, [user])

  async function fetchPendingCount() {
    try {
      const invitations = await getPendingInvitations(user.email)
      setPendingCount(invitations.length)
    } catch {
      // silently fail
    }
  }

  async function handleSendInvite(e) {
    e.preventDefault()
    if (!inviteEmail.trim() || !workspaceId) return
    setInviteError('')
    setInviteSuccess(false)
    try {
      setInviting(true)
      await sendInvitation({ workspaceId, email: inviteEmail.trim() })
      setInviteSuccess(true)
      setInviteEmail('')
    } catch (err) {
      setInviteError(err.message)
    } finally {
      setInviting(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <AppBar position="static" elevation={0} sx={{
        bgcolor: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 64,
        justifyContent: 'center',
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: 3 }}>

          {/* Left: Page title */}
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', minWidth: '150px' }}>
            {pageTitle}
          </Typography>

          {/* Right: Search, Create, Icons, Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

            {/* Search bar */}
            <Box sx={{
              position: 'relative', borderRadius: '8px',
              bgcolor: alpha('#f1f5f9', 0.05),
              '&:hover': { bgcolor: alpha('#f1f5f9', 0.1) },
              width: { xs: '150px', md: '300px' },
              display: 'flex', alignItems: 'center',
              px: 1.5, height: '36px'
            }}>
              <SearchIcon sx={{ fontSize: '1.1rem', color: '#64748b', mr: 1 }} />
              <InputBase
                placeholder="Search..."
                sx={{ color: '#f1f5f9', fontSize: '0.88rem', width: '100%', '& .MuiInputBase-input': { p: 0 } }}
              />
            </Box>

            {/* Create button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              sx={{
                bgcolor: '#2563eb', textTransform: 'none', fontWeight: 600,
                borderRadius: '8px', px: 2, height: '36px',
                '&:hover': { bgcolor: '#1d4ed8' },
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Create
            </Button>

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1.5, mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

              {/* Invite member — only inside a workspace */}
              {workspaceId && (
                <Tooltip title="Invite member">
                  <IconButton
                    size="small"
                    onClick={() => { setInviteOpen(true); setInviteSuccess(false); setInviteError('') }}
                    sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}
                  >
                    <PersonAddOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Notifications bell — links to invitations page */}
              <Tooltip title="Invitations">
                <IconButton
                  size="small"
                  onClick={() => navigate('/invitations')}
                  sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}
                >
                  <Badge badgeContent={pendingCount || null} color="error">
                    <NotificationsNoneOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Avatar */}
              <Tooltip title={user?.fullName || 'Account'}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: '0.75rem', fontWeight: 700 }}>
                    {getInitials(user?.fullName)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Dropdown menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f1f5f9', mt: 1, minWidth: 200, borderRadius: '12px',
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{user?.fullName}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{user?.email}</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <MenuItem onClick={() => setAnchorEl(null)} sx={{ fontSize: '0.88rem', gap: 1.5, py: 1.2 }}>
              <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} /> Profile
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <MenuItem onClick={handleLogout} sx={{ fontSize: '0.88rem', gap: 1.5, py: 1.2, color: '#ef4444' }}>
              <LogoutOutlinedIcon fontSize="small" /> Log out
            </MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>

      {/* Invite Member Dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        PaperProps={{
          sx: { bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', minWidth: 400 }
        }}
      >
        <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 700, pb: 1 }}>
          Invite to Workspace
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 2.5 }}>
            Enter the email of the person you'd like to invite. They'll see it when they log in.
          </Typography>

          {inviteError && (
            <Box sx={{ bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', p: 1.5, mb: 2 }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#f87171' }}>{inviteError}</Typography>
            </Box>
          )}

          {inviteSuccess && (
            <Box sx={{ bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', p: 1.5, mb: 2 }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#10b981' }}>Invitation sent!</Typography>
            </Box>
          )}

          <TextField
            fullWidth size="small" placeholder="colleague@company.com" type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendInvite(e) }}
            sx={{
              '& .MuiInputBase-input': { fontSize: '0.88rem', color: '#f1f5f9' },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: '#64748b', textTransform: 'none' }}>
            Close
          </Button>
          <Button
            variant="contained" onClick={handleSendInvite}
            disabled={inviting || !inviteEmail.trim()}
            sx={{ bgcolor: '#3b82f6', textTransform: 'none', '&:hover': { bgcolor: '#2563eb' } }}
          >
            {inviting ? <CircularProgress size={16} color="inherit" /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}