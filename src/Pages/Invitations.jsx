import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getPendingInvitations, respondToInvitation } from '../api/auth'
import {
  Box, Typography, CircularProgress, Button, Chip, Divider
} from '@mui/material'
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function Invitations() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(null) // id of invitation being responded to

  useEffect(() => { fetchInvitations() }, [])

  async function fetchInvitations() {
    try {
      setLoading(true)
      const data = await getPendingInvitations(user.email)
      setInvitations(data)
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRespond(id, status) {
    try {
      setResponding(id)
      await respondToInvitation({ id, status })
      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== id))
      // If accepted, go to dashboard to see the new workspace
      if (status === 'ACCEPTED') navigate('/dashboard')
    } catch (err) {
      console.error(err.message)
    } finally {
      setResponding(null)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f1e' }}>

      {/* Navbar */}
      <Box sx={{
        height: 64, display: 'flex', alignItems: 'center',
        px: 3, borderBottom: '1px solid rgba(255,255,255,0.06)',
        bgcolor: '#111827',
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' }, textTransform: 'none' }}
        >
          Back
        </Button>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, py: 6 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', mb: 1, letterSpacing: '-0.5px' }}>
          Workspace Invitations
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: '#64748b', mb: 4 }}>
          Accept or decline invitations to join a workspace
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#64748b' }}>
            <CircularProgress size={18} sx={{ color: '#3b82f6' }} />
            <Typography variant="body2">Loading invitations...</Typography>
          </Box>
        )}

        {!loading && invitations.length === 0 && (
          <Box sx={{
            textAlign: 'center', py: 8,
            bgcolor: '#111827', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
          }}>
            <WorkspacesOutlinedIcon sx={{ fontSize: 40, color: '#334155', mb: 2 }} />
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              No pending invitations
            </Typography>
          </Box>
        )}

        {!loading && invitations.map((inv, index) => (
          <Box key={inv.id}>
            <Box sx={{
              bgcolor: '#111827',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              p: 3,
              mb: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px',
                      bgcolor: 'rgba(59,130,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#3b82f6', fontWeight: 800, fontSize: '0.9rem',
                    }}>
                      {inv.workspace.name.charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
                        {inv.workspace.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Invited by {inv.workspace.owner.fullName}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Chip
                  label="Pending"
                  size="small"
                  sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 600, fontSize: '0.72rem' }}
                />
              </Box>

              <Typography sx={{ fontSize: '0.78rem', color: '#475569', mb: 2.5 }}>
                Expires {new Date(inv.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircleOutlineIcon />}
                  disabled={responding === inv.id}
                  onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                  sx={{
                    bgcolor: '#3b82f6', fontSize: '0.82rem', textTransform: 'none',
                    '&:hover': { bgcolor: '#2563eb' },
                  }}
                >
                  {responding === inv.id ? 'Accepting...' : 'Accept'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CancelOutlinedIcon />}
                  disabled={responding === inv.id}
                  onClick={() => handleRespond(inv.id, 'DECLINED')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.1)', color: '#64748b',
                    fontSize: '0.82rem', textTransform: 'none',
                    '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.05)' },
                  }}
                >
                  Decline
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}