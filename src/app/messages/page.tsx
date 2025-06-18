'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
}

type Message = {
  id: string
  content: string
  createdAt: string
  sender: User
  receiver: User
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, router])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser)
      
      // Set up polling for real-time updates
      const pollInterval = setInterval(() => {
        fetchMessages(selectedUser)
      }, 3000) // Poll every 3 seconds
      
      return () => clearInterval(pollInterval)
    }
  }, [selectedUser])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Kullanıcılar yüklenirken bir hata oluştu')
      }

      setUsers(data)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Mesajlar yüklenirken bir hata oluştu')
      }

      setMessages(data)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newMessage.trim()) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedUser,
          content: newMessage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Mesaj gönderilirken bir hata oluştu')
      }

      setMessages((prev) => [...prev, data])
      setNewMessage('')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-12rem)]">
        {/* Kullanıcı listesi */}
        <div className="w-1/4 bg-white shadow-sm rounded-l-lg overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Kullanıcılar</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {users
              .filter((user) => user.id !== session?.user?.id)
              .map((user) => (
                <li
                  key={user.id}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedUser === user.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Mesaj alanı */}
        <div className="flex-1 flex flex-col bg-white shadow-sm rounded-r-lg">
          {selectedUser ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {users.find((u) => u.id === selectedUser)?.name}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.id === session?.user?.id
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender.id === session?.user?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Gönder
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Mesajlaşmak için bir kullanıcı seçin
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 