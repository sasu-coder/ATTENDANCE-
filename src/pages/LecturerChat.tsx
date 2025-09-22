
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const LecturerChat = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: 1,
      studentId: 'STU001',
      studentName: 'Kwame Asante',
      lastMessage: 'Hello Dr. Johnson, I have a question about the assignment',
      timestamp: '10:30 AM',
      unread: 2,
      messages: [
        { id: 1, sender: 'student', text: 'Hello Dr. Johnson, I have a question about the assignment', time: '10:25 AM' },
        { id: 2, sender: 'lecturer', text: 'Hello Kwame! What would you like to know?', time: '10:27 AM' },
        { id: 3, sender: 'student', text: 'I\'m having trouble with question 3. Could you provide some guidance?', time: '10:30 AM' }
      ]
    },
    {
      id: 2,
      studentId: 'STU002',
      studentName: 'Ama Osei',
      lastMessage: 'Thank you for the explanation in class today',
      timestamp: '09:15 AM',
      unread: 0,
      messages: [
        { id: 1, sender: 'student', text: 'Thank you for the explanation in class today', time: '09:15 AM' },
        { id: 2, sender: 'lecturer', text: 'You\'re welcome! Feel free to ask if you need clarification on anything.', time: '09:18 AM' }
      ]
    }
  ]);

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;

    const newMessage = {
      id: Date.now(),
      sender: 'lecturer',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeChat.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage],
            lastMessage: message,
            timestamp: newMessage.time
          }
        : conv
    ));

    setMessage('');
  };

  const selectChat = (conversation) => {
    setActiveChat(conversation);
    // Mark as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Chat with your students</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/lecturer-portal')}>
            Back to Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search messages..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectChat(conv)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      activeChat?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-8 w-8 bg-gray-200 rounded-full p-1" />
                        <div>
                          <p className="font-medium text-sm">{conv.studentName}</p>
                          <p className="text-xs text-gray-600">{conv.studentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{conv.timestamp}</p>
                        {conv.unread > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">{conv.unread}</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {activeChat ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <User className="h-10 w-10 bg-gray-200 rounded-full p-2" />
                    <div>
                      <CardTitle className="text-lg">{activeChat.studentName}</CardTitle>
                      <p className="text-sm text-gray-600">{activeChat.studentId}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-96">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'lecturer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === 'lecturer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'lecturer' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a conversation to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LecturerChat;
