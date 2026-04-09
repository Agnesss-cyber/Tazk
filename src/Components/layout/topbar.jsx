import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Tooltip, Box, Menu, MenuItem, Divider, Badge,
  InputBase, Button, alpha
} from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

export default function Topbar({ pageTitle = '' }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [anchorEl, setAnchorEl] = useState(null)

  function handleLogout() {
    logout()
    navigate('/')
  }

  function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <AppBar position="static" elevation={0} sx={{
      bgcolor: '#111827',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      height: 64,
      justifyContent: 'center',
    }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: 3 }}>

        {/* Left Side: Page title */}
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', minWidth: '150px' }}>
          {pageTitle}
        </Typography>

        {/* Center/Right Side: Search, Create, and Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          
          {/* Dummy Search Bar */}
          <Box sx={{
            position: 'relative',
            borderRadius: '8px',
            bgcolor: alpha('#f1f5f9', 0.05),
            '&:hover': { bgcolor: alpha('#f1f5f9', 0.1) },
            width: { xs: '150px', md: '300px' },
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            height: '36px'
          }}>
            <SearchIcon sx={{ fontSize: '1.1rem', color: '#64748b', mr: 1 }} />
            <InputBase
              placeholder="Search..."
              sx={{
                color: '#f1f5f9',
                fontSize: '0.88rem',
                width: '100%',
                '& .MuiInputBase-input': { p: 0 }
              }}
            />
          </Box>

          {/* Create Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            sx={{
              bgcolor: '#2563eb',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 2,
              height: '36px',
              '&:hover': { bgcolor: '#1d4ed8' },
              display: { xs: 'none', sm: 'flex' } // Hide text on very small screens
            }}
          >
            Create
          </Button>

          {/* Divider line between tools and user */}
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1.5, mx: 0.5 }} />

          {/* Icons & Avatar Group */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
                <Badge badgeContent={0} color="error">
                  <NotificationsNoneOutlinedIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={user?.fullName || 'Account'}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                <Avatar sx={{
                  width: 32, height: 32,
                  bgcolor: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {getInitials(user?.fullName)}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Dropdown menu (Unchanged) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              bgcolor: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f1f5f9',
              mt: 1,
              minWidth: 200,
              borderRadius: '12px',
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
            <PersonOutlineOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
            Profile
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <MenuItem onClick={handleLogout} sx={{ fontSize: '0.88rem', gap: 1.5, py: 1.2, color: '#ef4444' }}>
            <LogoutOutlinedIcon fontSize="small" />
            Log out
          </MenuItem>
        </Menu>

      </Toolbar>
    </AppBar>
  )
}