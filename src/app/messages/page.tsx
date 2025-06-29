'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  role: string
}

type Message = {
  id: string
  content: string
  createdAt: string
  sender: User
  receiver: User
}

function MessagesPageInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Oturum kontrolü - useEffect içinde yapılmalı
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Oturum kontrolü - en erken kontrol
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    // Oturum açmamış kullanıcılar için loading göster
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser)
      // Okunmamış mesajları okundu olarak işaretle
      fetch(`/api/messages/${selectedUser}`, { method: 'PATCH' })
        .then(() => {
          window.dispatchEvent(new Event('unread-messages-updated'))
        })
      // Set up polling for real-time updates
      const pollInterval = setInterval(() => {
        fetchMessages(selectedUser)
      }, 3000) // Poll every 3 seconds
      return () => clearInterval(pollInterval)
    }
  }, [selectedUser])

  useEffect(() => {
    // Her mesaj gönderildiğinde veya sohbete girildiğinde en alta kaydır
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  useEffect(() => {
    // URL'de user parametresi varsa otomatik seç
    const userParam = searchParams ? searchParams.get('user') : null;
    if (userParam && users.some(u => u.id === userParam)) {
      setSelectedUser(userParam);
    }
  }, [users, searchParams]);

  useEffect(() => {
    // Admin her zaman sohbet listesinde görünsün
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Kullanıcılar yüklenemedi');
        }
        return res.json();
      })
      .then((users) => {
        // users'ın array olduğundan emin ol
        if (Array.isArray(users)) {
          const admin = users.find((u: User) => u.role === 'ADMIN');
          let newUsers = users.filter((u: User) => u.id !== session?.user?.id);
          if (admin && !newUsers.some((u: User) => u.id === admin.id)) {
            newUsers = [admin, ...newUsers];
          }
          setUsers(newUsers);
        } else {
          console.error('API\'den beklenmeyen yanıt formatı:', users);
          setError('Kullanıcılar yüklenirken bir hata oluştu');
        }
      })
      .catch((error) => {
        console.error('Kullanıcılar yüklenirken hata:', error);
        setError('Kullanıcılar yüklenirken bir hata oluştu');
      });
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Kullanıcılar yüklenirken bir hata oluştu')
      }

      // data'nın array olduğundan emin ol
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.error('API\'den beklenmeyen yanıt formatı:', data);
        throw new Error('Kullanıcılar yüklenirken bir hata oluştu')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Kullanıcılar yüklenirken bir hata oluştu')
      }
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
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Mesajlar yüklenirken bir hata oluştu')
      }
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
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Mesaj gönderilirken bir hata oluştu')
      }
    }
  }

  // Admin kullanıcıyı bulurken adı override et
  const displayName = (user: User) => user.role === 'ADMIN' ? 'ar-el Catering' : user.name;

  // Kullanıcıya ait son mesajı bul
  const getLastMessage = (userId: string) => {
    const userMessages = messages.filter(
      (msg) => msg.sender.id === userId || msg.receiver.id === userId
    );
    if (userMessages.length === 0) return '';
    return userMessages[userMessages.length - 1].content;
  };

  // Son mesajı gönderen kullanıcıyı tespit et
  const lastMessages = users.map((user) => {
    const userMessages = messages.filter(
      (msg) => msg.sender.id === user.id || msg.receiver.id === user.id
    );
    return {
      userId: user.id,
      lastSenderId:
        userMessages.length > 0 ? userMessages[userMessages.length - 1].sender.id : null,
    };
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Hata</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('');
              fetchUsers();
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500">Henüz admin yok veya iletişim kurulacak kullanıcı bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navbar ile aynı font ve renk */}
      {/* <a className="ml-4 p-2 text-sm font-medium text-secondary hover:text-primary mb-4" tabIndex={-1} style={{ pointerEvents: 'none' }}>Mesajlar</a> */}
      <div className="flex h-[calc(100vh-12rem)]">
        {/* Kullanıcı listesi */}
        <div className="w-1/4 bg-white shadow-sm rounded-l-lg overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sohbetler</h2>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Aratın veya yeni sohbet başlatın"
              className="w-full px-3 py-2 rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <ul className="divide-y divide-gray-200">
            {users
              .filter((user) => user.id !== session?.user?.id && displayName(user).toLowerCase().includes(search.toLowerCase()))
              .map((user) => {
                const lastMsg = getLastMessage(user.id);
                const lastSenderId = lastMessages.find((u) => u.userId === user.id)?.lastSenderId;
                const isLastSender = lastSenderId === user.id;
                // Son mesajın saatini bul
                const userMessages = messages.filter(
                  (msg) => msg.sender.id === user.id || msg.receiver.id === user.id
                );
                const lastMsgObj = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
                const lastMsgTime = lastMsgObj ? new Date(lastMsgObj.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <li
                    key={user.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedUser === user.id ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${isLastSender ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {displayName(user)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold truncate ${isLastSender ? 'text-primary' : 'text-gray-900'}`}>{displayName(user)}</span>
                        <span className="text-xs text-gray-400 ml-2">{lastMsgTime}</span>
                      </div>
                      <span className="block text-xs text-gray-500 truncate mt-1">{lastMsg}</span>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Mesaj alanı */}
        <div className="flex-1 flex flex-col bg-white shadow-sm rounded-r-lg">
          {selectedUser ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {(() => {
                    const user = users.find((u) => u.id === selectedUser);
                    return user ? displayName(user) : '';
                  })()}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                      className={`max-w-xs px-4 py-2 rounded-lg shadow-sm text-sm break-words '
                        ${message.sender.id === session?.user?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'}
                      `}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-75 text-right">
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesPageInner />
    </Suspense>
  );
} 
