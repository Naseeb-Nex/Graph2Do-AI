import React, { useState, useEffect, useRef } from 'react'
import { useKindeAuth } from '@/shared/auth'
import { TopNav } from '@/widgets/top-nav'
import { GraphCanvas } from '@/widgets/graph-canvas'
import { AIChatPanel } from '@/features/ai-chat'
import { NodeModal } from '@/features/node-modal'
import { api } from '@/shared/api/client'
import { GraphNode, GraphEdge, ChatMessage } from '@/shared/types/graph'
import { INITIAL_NODES, INITIAL_EDGES } from '@/shared/lib/initialData'
import { LogIn, UserPlus } from 'lucide-react'

export const MainGraphPage: React.FC = () => {
  const { isAuthenticated, isLoading, login, register, getToken } = useKindeAuth()

  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES)
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [globalExpandMode, setGlobalExpandMode] = useState<'auto' | 'always-expand' | 'always-collapse'>('auto')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'blocked'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nodeToEdit, setNodeToEdit] = useState<GraphNode | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const wsConnectionsRef = useRef<Record<number, WebSocket>>({})

  // Sync token from auth provider
  useEffect(() => {
    if (isAuthenticated && getToken) {
      getToken().then((token: string) => {
        if (token) api.setToken(token)
      }).catch(() => {})
    }
  }, [isAuthenticated, getToken])

  const loadGraph = async () => {
    try {
      const data = await api.fetchGraph()
      if (data && data.nodes && data.nodes.length > 0) {
        setNodes(data.nodes)
        setEdges(data.edges)
      }
      setIsLiveConnected(true)
    } catch {
      // Keep local state on error
    }
  }

  // Fetch initial graph and nodes from backend on load
  useEffect(() => {
    if (isAuthenticated) {
      loadGraph()
    }
  }, [isAuthenticated])

  // Re-establish WebSockets when graph IDs change
  useEffect(() => {
    if (!isLiveConnected) return
    const graphIds = Array.from(new Set(nodes.map(n => n.graphId).filter((id): id is number => id !== undefined)))
    const wsUrl = import.meta.env?.VITE_API_URL?.replace(/^http/, "ws") || `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
    const token = api.getToken()

    for (const gid of graphIds) {
      if (!wsConnectionsRef.current[gid] && token) {
        const ws = new WebSocket(`${wsUrl}/ws/${gid}?token=${token}`)
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === "graph_updated") {
              loadGraph()
            }
          } catch (e) {
            console.error("WS parse error", e)
          }
        }
        wsConnectionsRef.current[gid] = ws
      }
    }

    for (const gid of Object.keys(wsConnectionsRef.current).map(Number)) {
      if (!graphIds.includes(gid)) {
        wsConnectionsRef.current[gid].close()
        delete wsConnectionsRef.current[gid]
      }
    }

    return () => {
      Object.values(wsConnectionsRef.current).forEach(ws => ws.close())
      wsConnectionsRef.current = {}
    }
  }, [nodes, isLiveConnected])

  const handleToggleComplete = async (id: string) => {
    const node = nodes.find(n => n.id === id)
    if (!node) return
    const newCompleted = !node.completed
    setNodes(nodes.map(n => n.id === id ? { ...n, completed: newCompleted } : n))
    try {
      await api.updateNode(Number(id), { completed: newCompleted })
    } catch (err) {
      console.error('Failed to complete node:', err)
      setNodes(nodes.map(n => n.id === id ? { ...n, completed: !newCompleted } : n))
    }
  }

  const handleSelectNode = (node: GraphNode | null) => {
    setSelectedNodeId(node ? node.id : null)
    if (node) {
      const contextMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: `Target node updated: "${node.title}" (${node.nodeType}) - ${node.completed ? 'Completed' : node.status}. Scope: ${node.estimatedHours}h.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextNodeId: node.id,
        contextNodeTitle: node.title,
      }
      setMessages((prev) => [...prev, contextMsg])
    }
  }

  const handleToggleExpandNode = (nodeId: string) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, isExpanded: !n.isExpanded } : n))
  }

  const handleOpenCreateModal = () => {
    setNodeToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (node: GraphNode) => {
    setNodeToEdit(node)
    setIsModalOpen(true)
  }

  const handleSaveNode = async (nodeData: Partial<GraphNode>) => {
    if (!nodeData.title) return
    try {
      if (nodeToEdit) {
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeToEdit.id ? ({ ...n, ...nodeData } as GraphNode) : n))
        )
        try {
          await api.updateNode(Number(nodeToEdit.id), nodeData)
        } catch (err) {
          console.error('Failed to update node on backend:', err)
        }
      } else {
        const newId = `node-${Date.now()}`
        const newNode: GraphNode = {
          id: newId,
          title: nodeData.title || 'Untitled Node',
          description: nodeData.description || '',
          completed: nodeData.completed || false,
          nodeType: nodeData.nodeType || 'task',
          status: nodeData.status || 'pending',
          estimatedHours: nodeData.estimatedHours || 2,
          deadline: nodeData.deadline,
          parentId: nodeData.parentId,
          position: nodeData.position || { x: 400, y: 400 },
          isExpanded: nodeData.isExpanded ?? true,
        }
        setNodes((prev) => [...prev, newNode])
        try {
          await api.createNode(nodeData)
        } catch (err) {
          console.error('Failed to create node on backend:', err)
        }
      }
      setIsModalOpen(false)
      setNodeToEdit(null)
    } catch (err) {
      console.error('Failed to save node:', err)
    }
  }

  const handleDeleteNode = async (id: string) => {
    try {
      await api.deleteNode(Number(id))
      setNodes(nodes.filter(n => n.id !== id))
      if (selectedNodeId === id) setSelectedNodeId(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to delete node:', err)
    }
  }

  const handleSendMessage = async (text: string, contextNodeId?: string | null) => {
    const selected = nodes.find(n => n.id === contextNodeId)
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextNodeId: contextNodeId || undefined,
      contextNodeTitle: selected?.title,
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const response = await api.triggerAIAction('chat', contextNodeId || undefined, text)
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || response.reply || 'AI action completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggested_actions,
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to communicate with AI agent.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  const handleDecomposeNode = async (node: GraphNode) => {
    await handleSendMessage(`Break down project "${node.title}" into sequential subtasks.`, node.id)
  }

  const handleCompleteNode = async (nodeId: string) => {
    await handleToggleComplete(nodeId)
  }

  const handleAnalyzeSchedule = async () => {
    await handleSendMessage('Analyze the current graph schedule and identify blockers.')
  }

  const handleClearContext = () => {
    setSelectedNodeId(null)
  }

  const handleClearMessages = () => {
    setMessages([])
  }

  const handleFilterChange = (status: 'all' | 'active' | 'completed' | 'blocked') => {
    setFilterStatus(status)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setNodeToEdit(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading Graph2Do...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            G2
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Graph2Do</h1>
          <p className="text-slate-400 text-sm mb-6">
            A visual task management interface that structures tasks as a sequential knowledge graph.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => login()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => register()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 md:h-screen md:overflow-hidden font-sans">
      <TopNav
        nodes={nodes}
        filterStatus={filterStatus}
        isLiveConnected={isLiveConnected}
        onFilterChange={handleFilterChange}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-visible md:overflow-hidden relative">
        <div className="flex-1 h-[55vh] min-h-[360px] md:h-full relative">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            globalExpandMode={globalExpandMode}
            filterStatus={filterStatus}
            onSelectNode={handleSelectNode}
            onToggleExpandNode={handleToggleExpandNode}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenEditModal={handleOpenEditModal}
            onToggleGlobalExpand={setGlobalExpandMode}
          />
        </div>

        <div className="w-full h-[45vh] min-h-[320px] md:w-[380px] md:h-full border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/50 backdrop-blur flex flex-col z-10 shrink-0">
          <AIChatPanel
            selectedNode={nodes.find(n => n.id === selectedNodeId) || null}
            nodes={nodes}
            messages={messages}
            onSendMessage={handleSendMessage}
            onDecomposeNode={handleDecomposeNode}
            onCompleteNode={handleCompleteNode}
            onAnalyzeSchedule={handleAnalyzeSchedule}
            onClearContext={handleClearContext}
            onClearMessages={handleClearMessages}
          />
        </div>
      </div>

      <NodeModal
        isOpen={isModalOpen}
        nodeToEdit={nodeToEdit}
        allNodes={nodes}
        onClose={handleCloseModal}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
      />
    </div>
  )
}

export default MainGraphPage
