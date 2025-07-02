"use client";

import { useEffect, useState, useRef } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  receiver: User;
  isRead: boolean;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        // Benzersiz kullanıcıları çıkar
        const userMap: { [id: string]: User } = {};
        data.forEach((msg: Message) => {
          if (msg.sender) userMap[msg.sender.id] = msg.sender;
          if (msg.receiver) userMap[msg.receiver.id] = msg.receiver;
        });
        setUsers(Object.values(userMap).filter(u => u.id !== undefined));
      });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      // Okunmamış mesajları okundu olarak işaretle
      fetch(`/api/messages/${selectedUser}`, { method: 'PATCH' })
        .then(() => {
          window.dispatchEvent(new Event('unread-messages-updated'))
        });
    }
  }, [selectedUser]);

  useEffect(() => {
    // Her mesaj gönderildiğinde en alta kaydır
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  // Seçili kullanıcıya ait tüm mesajlar (hem admin hem kullanıcı tarafından gönderilenler)
  const filteredMessages = selectedUser
    ? messages.filter(
        (msg) =>
          (msg.sender.id === selectedUser && msg.receiver.email === 'admin@admin.com') ||
          (msg.sender.email === 'admin@admin.com' && msg.receiver.id === selectedUser)
      )
    : [];

  // Kullanıcı listesinde admin kendini görmesin
  const filteredUsers = users.filter(u => u.email !== 'admin@admin.com');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedUser,
          content: newMessage,
        }),
      });
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: { id: 'admin', name: 'ar-el Catering', email: 'admin@admin.com' },
            receiver: users.find((u) => u.id === selectedUser)!,
            isRead: true,
          },
        ]);
        setNewMessage("");
      }
    } catch {
      // Hata yönetimi
    }
  };

  

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{`
        .pulse-border {
          animation: pulse 1.2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
      `}</style>
      <div className="flex h-[calc(100vh-12rem)]">
        {/* Kullanıcı listesi */}
        <div className="w-1/4 bg-white shadow-sm rounded-l-lg overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcılar</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedUser === user.id ? 'bg-gray-100' : ''}`}
                onClick={() => setSelectedUser(user.id)}
              >
                <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold bg-gray-200 text-gray-700">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
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
                  {users.find((u) => u.id === selectedUser)?.name || ''}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {filteredMessages.length === 0 && (
                  <div className="text-gray-400 text-center mt-8">Henüz mesaj yok.</div>
                )}
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.email === 'admin@admin.com' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`relative max-w-xs px-4 py-2 rounded-lg shadow-sm text-sm break-words '
                        ${message.sender.email === 'admin@admin.com'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'}
                        ${message.sender.id === selectedUser && message.isRead === false ? 'pulse-border border-2 border-indigo-400' : ''}
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
              <form onSubmit={handleSendMessage} className="p-4 border-t">
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
    </div>
  );
} 
