import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getWorkspaces, createWorkspace, createBoard, getPendingInvitations } from '../api/auth'

// --- Extracted Material UI Imports ---
import { IconButton, Badge, Tooltip } from '@mui/material'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'

export default function WorkspaceList() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Public' })
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  // --- Extracted Notification State ---
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch workspaces
  useEffect(() => { 
    fetchWorkspaces() 
  }, [])

  // --- Extracted Notification Fetching Logic ---
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

  async function fetchWorkspaces() {
    try {
      setLoading(true)
      const data = await getWorkspaces(user.id)
      setWorkspaces(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    try {
      setCreating(true)

      // 1. Create the workspace
      const workspace = await createWorkspace({
        name: form.name,
        type: form.type === 'Public' ? 'PUBLIC' : 'PRIVATE',
        ownerId: user.id,
      })

      // 2. Create 2 default boards — backend auto-creates 3 columns for each
      const [board1] = await Promise.all([
        createBoard({ name: 'Board 1', workspaceId: workspace.id, isDefault: true }),
        createBoard({ name: 'Board 2', workspaceId: workspace.id, isDefault: true }),
      ])

      setShowModal(false)
      setForm({ name: '', type: 'Public' })

      // 3. Navigate straight to the first board
      navigate(`/workspace/${workspace.id}/board/${board1.id}`)

    } catch (err) {
      setFormError(err.message)
    } finally {
      setCreating(false)
    }
  }

  function getUserRole(workspace) {
    const member = workspace.members?.find(m => m.userId === user.id)
    return member?.role || 'member'
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-page">
      <nav className="landing-nav">
        <div className="logo">Tazk<span>.</span></div>
        
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
          
          {/* --- Extracted Notification Bell --- */}
          <Tooltip title="Invitations">
            <IconButton
              size="small"
              onClick={() => navigate('/invitations')}
              sx={{ color: '#64748b', '&:hover': { color: '#f1f5f9' }, mr: 2 }}
            >
              <Badge badgeContent={pendingCount || null} color="error">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          {/* ----------------------------------- */}

          <span className="nav-username">👋 {user?.fullName}</span>
          <button className="btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Your Workspaces</h1>
            <p className="dashboard-sub">Select a workspace to open its board</p>
          </div>
          <button className="btn-primary-lg" onClick={() => setShowModal(true)}>
            + New Workspace
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading && (
          <div className="dashboard-empty"><p>Loading workspaces...</p></div>
        )}

        {!loading && workspaces.length === 0 && (
          <div className="dashboard-empty">
            <div className="empty-icon">📋</div>
            <h3>No workspaces yet</h3>
            <p>Create your first workspace to get started</p>
            <button className="btn-primary-lg" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>
              Create Workspace
            </button>
          </div>
        )}

        {!loading && workspaces.length > 0 && (
          <div className="workspace-grid">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="workspace-card"
                onClick={() => navigate(`/workspace/${ws.id}/board/default`)}
              >
                <div className="workspace-card-icon">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div className="workspace-card-info">
                  <h3>{ws.name}</h3>
                  <p>{ws.owner?.fullName}</p>
                </div>
                <div className="workspace-card-footer">
                  <span className={`ws-badge ${ws.type === 'Private' ? 'ws-badge-private' : 'ws-badge-public'}`}>
                    {ws.type}
                  </span>
                  <span className={`ws-badge ${getUserRole(ws) === 'Manager' ? 'ws-badge-manager' : 'ws-badge-member'}`}>
                    {getUserRole(ws)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">New Workspace</h2>
            <p className="modal-sub">Set up a space for your team</p>

            {formError && <div className="auth-error">{formError}</div>}

            <form className="auth-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Workspace name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Product Team"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-input form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline-lg" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-lg" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}