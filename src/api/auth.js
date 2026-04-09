import { gqlRequest } from './graphqlClient'

// ─── Auth ────────────────────────────────────────────────────

const REGISTER_MUTATION = `
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      id
      fullName
      email
      createdAt
    }
  }
`

export async function registerUser({ fullName, email, password }) {
  const data = await gqlRequest(REGISTER_MUTATION, { input: { fullName, email, password } })
  return data.registerUser
}

const LOGIN_MUTATION = `
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      token
      user {
        id
        fullName
        email
      }
    }
  }
`

export async function loginUser({ email, password }) {
  const data = await gqlRequest(LOGIN_MUTATION, { input: { email, password } })
  return data.loginUser
}

// ─── Workspaces ──────────────────────────────────────────────

const GET_WORKSPACES_QUERY = `
  query GetWorkspaces($where: WorkspaceFilterInput) {
    workspaces(where: $where) {
      id
      name
      type
      createdAt
      owner {
        id
        fullName
      }
      workspaceMembers {
        userId
        role
      }
    }
  }
`

export async function getWorkspaces(userId) {
  const data = await gqlRequest(GET_WORKSPACES_QUERY, {
    where: { workspaceMembers: { some: { userId: { eq: userId } } } }
  })
  return data.workspaces
}

const CREATE_WORKSPACE_MUTATION = `
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id
      name
      type
      createdAt
    }
  }
`

export async function createWorkspace({ name, type, ownerId }) {
  const data = await gqlRequest(CREATE_WORKSPACE_MUTATION, { input: { name, type, ownerId } })
  return data.createWorkspace
}

const GET_WORKSPACE_BY_ID_QUERY = `
  query GetWorkspaceById($id: Int!) {
    workspaceById(id: $id) {
      id
      name
      type
      createdAt
      owner {
        id
        fullName
        email
      }
    }
  }
`

export async function getWorkspaceById(id) {
  const data = await gqlRequest(GET_WORKSPACE_BY_ID_QUERY, { id: parseInt(id) })
  return data.workspaceById
}

// ─── Boards ──────────────────────────────────────────────────

const GET_BOARDS_QUERY = `
  query GetBoards($workspaceId: Int!) {
    boards(workspaceId: $workspaceId) {
      id
      name
      isDefault
    }
  }
`

export async function getBoards(workspaceId) {
  const data = await gqlRequest(GET_BOARDS_QUERY, { workspaceId: parseInt(workspaceId) })
  return data.boards
}

const CREATE_BOARD_MUTATION = `
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      name
      isDefault
    }
  }
`

export async function createBoard({ name, workspaceId, isDefault }) {
  const data = await gqlRequest(CREATE_BOARD_MUTATION, {
    input: { name, workspaceId: parseInt(workspaceId), isDefault }
  })
  return data.createBoard
}

const UPDATE_BOARD_MUTATION = `
  mutation UpdateBoard($input: UpdateBoardInput!) {
    updateBoard(input: $input) {
      id
      name
    }
  }
`

export async function updateBoard({ id, name }) {
  const data = await gqlRequest(UPDATE_BOARD_MUTATION, { input: { id: parseInt(id), name } })
  return data.updateBoard
}

// ─── Columns ─────────────────────────────────────────────────

const GET_COLUMNS_QUERY = `
  query GetColumns($boardId: Int!) {
    columns(boardId: $boardId) {
      id
      name
      position
    }
  }
`

export async function getColumns(boardId) {
  const data = await gqlRequest(GET_COLUMNS_QUERY, { boardId: parseInt(boardId) })
  return data.columns
}

const ADD_COLUMN_MUTATION = `
  mutation CreateColumn($input: CreateColumnInput!) {
    createColumn(input: $input) {
      id
      name
      position
    }
  }
`

export async function addColumn({ boardId, name, position }) {
  const data = await gqlRequest(ADD_COLUMN_MUTATION, {
    input: { boardId: parseInt(boardId), name, position }
  })
  return data.createColumn
}

// ─── Tasks ───────────────────────────────────────────────────

const ADD_TASK_MUTATION = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      effort
      urgency
      dueDate
      columnId
      assignedTo {
        id
        fullName
      }
    }
  }
`

export async function addTask({ workspaceId, columnId, createdById, title, description, effort, urgency, assignedToId, dueDate }) {
  const data = await gqlRequest(ADD_TASK_MUTATION, {
    input: {
      workspaceId: parseInt(workspaceId),
      columnId: parseInt(columnId),
      createdById: parseInt(createdById),
      title,
      description: description || null,
      effort,        // pass as enum string e.g. "MEDIUM"
      urgency,       // pass as enum string e.g. "MEDIUM"
      assignedToId: assignedToId ? parseInt(assignedToId) : null,
      dueDate: dueDate || null,
    }
  })
  return data.createTask
}

const CREATE_BOARD_FROM_SIDEBAR_MUTATION = `
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      name
      isDefault
    }
  }
`

export async function createBoardInWorkspace({ name, workspaceId }) {
  const data = await gqlRequest(CREATE_BOARD_FROM_SIDEBAR_MUTATION, {
    input: { name, workspaceId: parseInt(workspaceId), isDefault: true }
  })
  return data.createBoard
}