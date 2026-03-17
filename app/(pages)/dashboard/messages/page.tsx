"use client";
import { useState } from 'react';
import {
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');

  // Mock data - replace with real API calls
  const chats = [
    {
      id: '1',
      user: {
        name: 'John Doe',
        avatar: null,
        role: 'customer'
      },
      lastMessage: 'When can you start the plumbing work?',
      time: '5 min ago',
      unread: 2
    },
    {
      id: '2',
      user: {
        name: 'Sarah Okafor',
        avatar: null,
        role: 'customer'
      },
      lastMessage: 'Thanks for the quick response!',
      time: '1 hour ago',
      unread: 0
    },
    {
      id: '3',
      user: {
        name: 'Mike Obi',
        avatar: null,
        role: 'business_owner'
      },
      lastMessage: 'The job is scheduled for next week',
      time: '1 day ago',
      unread: 0
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'John Doe',
      content: 'Hi, I need help with my plumbing',
      time: '10:30 AM',
      isMe: false
    },
    {
      id: 2,
      sender: 'Me',
      content: 'Sure, what seems to be the problem?',
      time: '10:32 AM',
      isMe: true
    },
    {
      id: 3,
      sender: 'John Doe',
      content: 'The bathroom sink is leaking',
      time: '10:33 AM',
      isMe: false
    },
    {
      id: 4,
      sender: 'John Doe',
      content: 'When can you come take a look?',
      time: '10:33 AM',
      isMe: false
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-5rem)]">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                selectedChat === chat.id ? 'bg-emerald-50' : ''
              }`}
            >
              <div className="relative">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {chat.user.name.charAt(0)}
                  </span>
                </div>
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 truncate">{chat.user.name}</p>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">J</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">John Doe</h3>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100">
                <PhoneIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100">
                <VideoCameraIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.isMe ? 'bg-emerald-600' : 'bg-gray-100'} rounded-lg p-3`}>
                  <p className={`text-sm ${message.isMe ? 'text-white' : 'text-gray-900'}`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${message.isMe ? 'text-emerald-200' : 'text-gray-500'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}