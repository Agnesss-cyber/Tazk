import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, CircularProgress, IconButton,
  TextField, Tooltip, Select, MenuItem, FormControl, InputLabel,
  Avatar
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import AppShell from '../Components/layout/Appshell'
import { useAuthStore } from '../store/authStore'
import {
  getWorkspaceById, getBoards, getColumns, updateBoard,
  addColumn, addTask, moveTaskAPI, getWorkspaceMembers
} from '../api/auth'

import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COLUMN_COLORS = {
  'To Do': '#64748b',
  'In Progress': '#3b82f6',
  'Done': '#10b981',
}

const SELECT_SX = {
  color: '#f1f5f9',
  fontSize: '0.82rem',
  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
  '.MuiSvgIcon-root': { color: '#64748b' },
}

const MENU_PROPS = {
  PaperProps: {
    sx: {
      bgcolor: '#1e293b',
      border: '1px solid rgba(255,255,255,0.08)',
      '& .MuiMenuItem-root': { fontSize: '0.82rem', color: '#f1f5f9' },
      '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
    }
  }
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─── TaskCard ─────────────────────────────────────────────────

function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  })

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
      sx={{
        bgcolor: '#1e293b', p: 1.5, borderRadius: '10px', mb: 1,
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        cursor: 'grab',
        '&:hover': { borderColor: 'rgba(59,130,246,0.3)' },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Typography sx={{ color: '#f1f5f9', fontSize: '0.82rem', fontWeight: 500, mb: task.description ? 0.5 : 0 }}>
        {task.title}
      </Typography>
      {task.description && (
        <Typography sx={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.5 }}>
          {task.description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        {/* Badges */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {task.effort && (
            <Box sx={{
              fontSize: '0.68rem', fontWeight: 600, px: 1, py: 0.3, borderRadius: '4px',
              bgcolor: task.effort === 'HIGH' ? 'rgba(239,68,68,0.12)' : task.effort === 'MEDIUM' ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)',
              color: task.effort === 'HIGH' ? '#f87171' : task.effort === 'MEDIUM' ? '#fbbf24' : '#94a3b8',
            }}>
              {task.effort.toLowerCase()}
            </Box>
          )}
          {task.urgency && (
            <Box sx={{
              fontSize: '0.68rem', fontWeight: 600, px: 1, py: 0.3, borderRadius: '4px',
              bgcolor: task.urgency === 'HIGH' ? 'rgba(239,68,68,0.12)' : task.urgency === 'MEDIUM' ? 'rgba(59,130,246,0.12)' : 'rgba(100,116,139,0.12)',
              color: task.urgency === 'HIGH' ? '#f87171' : task.urgency === 'MEDIUM' ? '#60a5fa' : '#94a3b8',
            }}>
              {task.urgency.toLowerCase()}
            </Box>
          )}
        </Box>
        {/* Assignee avatar */}
        {task.assignedTo && (
          <Tooltip title={task.assignedTo.fullName}>
            <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#2563eb' }}>
              {getInitials(task.assignedTo.fullName)}
            </Avatar>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

// ─── BoardColumn ──────────────────────────────────────────────

function BoardColumn({ column, onAddTask, members }) {
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', effort: '', urgency: '', assignedToId: '' })
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSaveTask() {
    if (!form.title.trim() || isSaving) return
    setIsSaving(true)
    await onAddTask(column.id, form)
    setForm({ title: '', description: '', effort: '', urgency: '', assignedToId: '' })
    setIsAdding(false)
    setIsSaving(false)
  }

  function handleCancel() {
    setIsAdding(false)
    setForm({ title: '', description: '', effort: '', urgency: '', assignedToId: '' })
  }

  return (
    <Box sx={{
      minWidth: 280, maxWidth: 280,
      bgcolor: '#111827',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLUMN_COLORS[column.name] || '#64748b' }} />
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>{column.name}</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', bgcolor: 'rgba(255,255,255,0.05)', px: 1.2, py: 0.3, borderRadius: '6px' }}>
          {column.tasks?.length || 0}
        </Typography>
      </Box>

      {/* Task list */}
      <Box sx={{ flex: 1, p: 1.5, minHeight: 150, overflowY: 'auto' }}>
        <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
          {column.tasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </Box>

      {/* Add task footer */}
      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {isAdding ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <TextField
              autoFocus fullWidth size="small" placeholder="Task title *"
              value={form.title} onChange={(e) => handleChange('title', e.target.value)}
              disabled={isSaving} onKeyDown={(e) => { if (e.key === 'Escape') handleCancel() }}
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.82rem', color: '#f1f5f9' },
                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused fieldset': { borderColor: '#3b82f6' } },
              }}
            />
            <TextField
              fullWidth size="small" multiline rows={2} placeholder="Description (optional)"
              value={form.description} onChange={(e) => handleChange('description', e.target.value)}
              disabled={isSaving}
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.78rem', color: '#94a3b8' },
                '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused fieldset': { borderColor: '#3b82f6' } },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '0.78rem', color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Effort</InputLabel>
                <Select value={form.effort} label="Effort" onChange={(e) => handleChange('effort', e.target.value)} disabled={isSaving} sx={{ ...SELECT_SX, fontSize: '0.78rem', bgcolor: 'rgba(255,255,255,0.05)' }} MenuProps={MENU_PROPS}>
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: '0.78rem', color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Urgency</InputLabel>
                <Select value={form.urgency} label="Urgency" onChange={(e) => handleChange('urgency', e.target.value)} disabled={isSaving} sx={{ ...SELECT_SX, fontSize: '0.78rem', bgcolor: 'rgba(255,255,255,0.05)' }} MenuProps={MENU_PROPS}>
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Assign to member */}
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.78rem', color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Assign to</InputLabel>
              <Select
                value={form.assignedToId} label="Assign to"
                onChange={(e) => handleChange('assignedToId', e.target.value)}
                disabled={isSaving}
                sx={{ ...SELECT_SX, fontSize: '0.78rem', bgcolor: 'rgba(255,255,255,0.05)' }}
                MenuProps={MENU_PROPS}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {members.map(m => (
                  <MenuItem key={m.userId} value={m.userId}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: '#2563eb' }}>
                        {getInitials(m.user.fullName)}
                      </Avatar>
                      {m.user.fullName}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={handleSaveTask} disabled={isSaving || !form.title.trim()}
                sx={{ bgcolor: '#3b82f6', borderRadius: '8px', color: '#fff', '&:hover': { bgcolor: '#2563eb' }, '&.Mui-disabled': { bgcolor: 'rgba(59,130,246,0.3)', color: 'rgba(255,255,255,0.4)' } }}>
                {isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckIcon sx={{ fontSize: 16 }} />}
              </IconButton>
              <IconButton size="small" onClick={handleCancel} disabled={isSaving}
                sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '8px', color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Typography onClick={() => setIsAdding(true)}
            sx={{ fontSize: '0.82rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.8, '&:hover': { color: '#3b82f6' } }}>
            <AddIcon sx={{ fontSize: 16 }} /> Add task
          </Typography>
        )}
      </Box>
    </Box>
  )
}

// ─── Board (main) ─────────────────────────────────────────────

export default function Board() {
  const { workspaceId, boardId } = useParams()
  const { user } = useAuthStore()

  const [workspace, setWorkspace] = useState(null)
  const [boards, setBoards] = useState([])
  const [columns, setColumns] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [savingColumn, setSavingColumn] = useState(false)

  const [activeTask, setActiveTask] = useState(null)
  // KEY FIX: track the original column id at drag start
  const originalColumnId = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { fetchData() }, [workspaceId, boardId])

  async function fetchData() {
    try {
      setLoading(true)
      const [ws, allBoards, workspaceMembers] = await Promise.all([
        getWorkspaceById(workspaceId),
        getBoards(workspaceId),
        getWorkspaceMembers(workspaceId),
      ])
      setWorkspace(ws)
      setBoards(allBoards)
      setMembers(workspaceMembers)

      const targetBoard = boardId === 'default'
        ? (allBoards.find(b => b.isDefault) || allBoards[0])
        : (allBoards.find(b => String(b.id) === boardId) || allBoards[0])

      if (targetBoard) {
        const cols = await getColumns(targetBoard.id)
        setColumns(cols.map(c => ({ ...c, tasks: c.tasks || [] })))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRenameBoard(id, name) {
    try {
      await updateBoard({ id, name })
      setBoards(boards.map(b => b.id === id ? { ...b, name } : b))
    } catch (err) {
      console.error('Rename failed:', err.message)
    }
  }

  function handleBoardCreated(newBoard) {
    setBoards(prev => [...prev, newBoard])
  }

  async function handleAddColumn() {
    if (!newColumnName.trim()) return
    try {
      setSavingColumn(true)
      const currentBoardId = boardId === 'default'
        ? (boards.find(b => b.isDefault) || boards[0])?.id
        : parseInt(boardId)
      const newCol = await addColumn({ boardId: currentBoardId, name: newColumnName.trim(), position: columns.length + 1 })
      setColumns([...columns, { ...newCol, tasks: [] }])
      setNewColumnName('')
      setAddingColumn(false)
    } catch (err) {
      console.error('Add column failed:', err.message)
    } finally {
      setSavingColumn(false)
    }
  }

  async function handleAddTask(columnId, form) {
    try {
      const task = await addTask({
        workspaceId: parseInt(workspaceId),
        columnId,
        createdById: user.id,
        title: form.title,
        description: form.description || null,
        effort: form.effort || null,
        urgency: form.urgency || null,
        assignedToId: form.assignedToId || null,
      })
      setColumns(prev => prev.map(col =>
        col.id === columnId ? { ...col, tasks: [...(col.tasks || []), task] } : col
      ))
    } catch (err) {
      console.error('Add task failed:', err.message)
    }
  }

  // ─── Drag and Drop ────────────────────────────────────────

  function findColumnByTaskId(taskId) {
    return columns.find(col => col.tasks?.some(t => t.id === taskId))
  }

  const handleDragStart = (event) => {
    const { active } = event
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task)
      // Store the original column BEFORE any moves happen
      const col = findColumnByTaskId(active.id)
      originalColumnId.current = col?.id ?? null
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const isActiveTask = active.data.current?.type === 'Task'
    if (!isActiveTask) return

    const activeCol = findColumnByTaskId(active.id)
    const overCol = over.data.current?.type === 'Task'
      ? findColumnByTaskId(over.id)
      : columns.find(col => col.id === over.id)

    if (!activeCol || !overCol || activeCol.id === overCol.id) return

    // Move task to new column optimistically
    setColumns(prev => {
      const activeItems = [...activeCol.tasks]
      const overItems = [...(overCol.tasks || [])]
      const activeIndex = activeItems.findIndex(t => t.id === active.id)
      const overIndex = over.data.current?.type === 'Task'
        ? overItems.findIndex(t => t.id === over.id)
        : overItems.length

      const [removed] = activeItems.splice(activeIndex, 1)
      overItems.splice(overIndex, 0, removed)

      return prev.map(col => {
        if (col.id === activeCol.id) return { ...col, tasks: activeItems }
        if (col.id === overCol.id) return { ...col, tasks: overItems }
        return col
      })
    })
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    // Find the CURRENT column of the task (after dragOver updates)
    const currentCol = findColumnByTaskId(active.id)
    if (!currentCol) return

    // Reorder within same column
    const activeIndex = currentCol.tasks.findIndex(t => t.id === active.id)
    const overIndex = currentCol.tasks.findIndex(t => t.id === over.id)

    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      setColumns(prev => prev.map(col =>
        col.id === currentCol.id
          ? { ...col, tasks: arrayMove(col.tasks, activeIndex, overIndex) }
          : col
      ))
    }

    // Persist to database if column changed
    const movedToNewColumn = originalColumnId.current !== null && originalColumnId.current !== currentCol.id
    if (movedToNewColumn) {
      try {
        await moveTaskAPI(active.id, currentCol.id)
      } catch (err) {
        console.error('Failed to persist task move:', err.message)
        // Revert on failure
        fetchData()
      }
    }

    originalColumnId.current = null
  }

  if (loading) return (
    <AppShell workspaceName="Loading..." boards={[]}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#64748b' }}>
        <CircularProgress size={18} sx={{ color: '#3b82f6' }} />
        <Typography variant="body2">Loading board...</Typography>
      </Box>
    </AppShell>
  )

  if (error) return (
    <AppShell workspaceName="Error" boards={[]}>
      <Box sx={{ bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 2, p: 2 }}>
        <Typography variant="body2" sx={{ color: '#f87171' }}>{error}</Typography>
      </Box>
    </AppShell>
  )

  return (
    <AppShell
      workspaceName={workspace?.name || 'Workspace'}
      pageTitle="Board"
      boards={boards}
      onRenameBoard={handleRenameBoard}
      onBoardCreated={handleBoardCreated}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', height: 'calc(100vh - 120px)', overflowX: 'auto', pb: 2 }}>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          {columns.map((col) => (
            <BoardColumn key={col.id} column={col} onAddTask={handleAddTask} members={members} />
          ))}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Add column */}
        <Box sx={{ flexShrink: 0 }}>
          {!addingColumn ? (
            <Tooltip title="Add column">
              <Box onClick={() => setAddingColumn(true)} sx={{
                minWidth: 52, height: 52, bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748b', transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6' },
              }}>
                <AddIcon fontSize="small" />
              </Box>
            </Tooltip>
          ) : (
            <Box sx={{ minWidth: 240, bgcolor: '#111827', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '14px', p: 2 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                New Column
              </Typography>
              <TextField
                value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') { setAddingColumn(false); setNewColumnName('') } }}
                placeholder="Column name" autoFocus size="small" fullWidth
                sx={{
                  mb: 1.5,
                  '& .MuiInputBase-input': { fontSize: '0.88rem', color: '#f1f5f9' },
                  '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused fieldset': { borderColor: '#3b82f6' } },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" onClick={handleAddColumn} disabled={savingColumn || !newColumnName.trim()}
                  sx={{ bgcolor: '#3b82f6', borderRadius: '8px', color: '#fff', '&:hover': { bgcolor: '#2563eb' }, '&.Mui-disabled': { bgcolor: 'rgba(59,130,246,0.3)' } }}>
                  {savingColumn ? <CircularProgress size={16} color="inherit" /> : <CheckIcon sx={{ fontSize: 16 }} />}
                </IconButton>
                <IconButton size="small" onClick={() => { setAddingColumn(false); setNewColumnName('') }}
                  sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '8px', color: '#64748b', '&:hover': { color: '#f1f5f9' } }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>

      </Box>
    </AppShell>
  )
}