
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, Send, Search, Filter, Bell, 
  User, Users, Clock, CheckCircle, AlertCircle,
  Paperclip, Phone, Video, MoreVertical, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const MessagingCenter = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState([]);

  const conversations = [
    {
      id: 1,
      participant: {
        name: 'Dr. Sarah Johnson',
        role: 'Lecturer',
        id: 'LEC001',
        avatar: '/placeholder-avatar.jpg',
        status: 'online'
      },
      lastMessage: 'Your attendance has been excellent this semester!',
      timestamp: '10:30 AM',
      unread: 2,
      course: 'Computer Networks'
    },
    {
      id: 2,
      participant: {
        name: 'Prof. Kwame Nkrumah',
        role: 'Lecturer',
        id: 'LEC002',
        avatar: '/placeholder-avatar.jpg',
        status: 'offline'
      },
      lastMessage: 'Please submit your assignment by Friday.',
      timestamp: 'Yesterday',
      unread: 0,
      course: 'Database Systems'
    },
    {
      id: 3,
      participant: {
        name: 'Admin Support',
        role: 'Administrator',
        id: 'ADM001',
        avatar: '/placeholder-avatar.jpg',
        status: 'online'
      },
      lastMessage: 'Your registration has been confirmed.',
      timestamp: '2 days ago',
      unread: 1,
      course: 'System'
    },
    {
      id: 4,
      participant: {
        name: 'Ama Osei',
        role: 'Student',
        id: 'STU002',
        avatar: '/placeholder-avatar.jpg',
        status: 'online'
      },
      lastMessage: 'Can you help me with the assignment?',
      timestamp: '3 days ago',
      unread: 0,
      course: 'Study Group'
    }
  ];

  const sampleMessages = [
    {
      id: 1,
      senderId: 'LEC001',
      senderName: 'Dr. Sarah Johnson',
      content: 'Hello Kwame! I wanted to commend you on your excellent attendance this semester.',
      timestamp: '10:25 AM',
      type: 'text'
    },
    {
      id: 2,
      senderId: 'STU001',
      senderName: 'Kwame Asante',
      content: 'Thank you, Dr. Johnson! I really appreciate your feedback.',
      timestamp: '10:27 AM',
      type: 'text'
    },
    {
      id: 3,
      senderId: 'LEC001',
      senderName: 'Dr. Sarah Johnson',
      content: 'Keep up the great work! Your participation in class discussions has also been outstanding.',
      timestamp: '10:30 AM',
      type: 'text'
    }
  ];

  useEffect(() => {
    if (selectedConversation) {
      setMessages(sampleMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: messages.length + 1,
      senderId: user?.id || 'STU001',
      senderName: user?.full_name || 'Kwame Asante',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage('');
    toast.success('Message sent successfully!');

    // Simulate response (in real app, this would come from backend)
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        senderId: selectedConversation.participant.id,
        senderName: selectedConversation.participant.name,
        content: 'Thank you for your message. I\'ll get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messaging Center</h1>
          <p className="text-gray-600">Communicate with lecturers, administrators, and fellow students</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Messages</span>
                </CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  New Chat
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-all ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-l-blue-600'
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.participant.avatar} />
                          <AvatarFallback>
                            {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          conversation.participant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">
                            {conversation.participant.name}
                          </h3>
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`text-xs ${
                              conversation.participant.role === 'Lecturer' ? 'bg-blue-100 text-blue-800' :
                              conversation.participant.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {conversation.participant.role}
                          </Badge>
                          <span className="text-xs text-gray-500">{conversation.course}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="border-0 shadow-lg h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.participant.avatar} />
                        <AvatarFallback>
                          {selectedConversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.participant.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            selectedConversation.participant.role === 'Lecturer' ? 'bg-blue-100 text-blue-800' :
                            selectedConversation.participant.role === 'Administrator' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {selectedConversation.participant.role}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            ID: {selectedConversation.participant.id}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            selectedConversation.participant.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {selectedConversation.participant.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === (user?.id || 'STU001') ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === (user?.id || 'STU001')
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === (user?.id || 'STU001') ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
