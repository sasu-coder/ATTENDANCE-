import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Send, X, Bot, User, Minimize2, 
  Maximize2, HelpCircle, Book, Calendar, BarChart3,
  Settings, Phone, Mail, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI attendance assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: Book, text: 'Check Attendance', action: 'attendance' },
    { icon: Calendar, text: 'View Schedule', action: 'schedule' },
    { icon: BarChart3, text: 'Analytics', action: 'analytics' },
    { icon: Settings, text: 'Settings Help', action: 'settings' },
    { icon: HelpCircle, text: 'Attendance Policy', action: 'policy' },
    { icon: MessageSquare, text: 'Request Attendance Correction', action: 'correction' },
    { icon: Mail, text: 'Contact Lecturer', action: 'contact_lecturer' }
  ];

  const supportTeam = [
    { name: 'Dr. Tech Support', role: 'Technical Lead', icon: Phone, contact: 'support@ug.edu.gh' },
    { name: 'Academic Assistant', role: 'Student Support', icon: Mail, contact: 'academic@ug.edu.gh' },
    { name: 'Live Chat', role: 'Instant Help', icon: MessageSquare, contact: 'chat' }
  ];

  const predefinedResponses = {
    greeting: [
      'Hello! How can I assist you with your attendance today?',
      'Hi there! I\'m here to help you with any attendance-related questions.',
      'Welcome! What would you like to know about your attendance system?'
    ],
    attendance: [
      'Your current attendance rate is 87%. You\'ve attended 18 out of 21 classes this semester.',
      'To mark attendance, you can use QR code scanning, face recognition, or GPS verification.',
      'Your attendance for this week: Monday ✓, Tuesday ✓, Wednesday ✗, Thursday ✓, Friday - upcoming.'
    ],
    schedule: [
      'Your next class is Database Systems at 2:00 PM in Room 101.',
      'Today\'s schedule: Computer Networks (8:00 AM), Software Engineering (10:00 AM), Database Systems (2:00 PM).',
      'You have 4 classes scheduled for today. Would you like me to show the complete timetable?'
    ],
    analytics: [
      'Your attendance trend is improving! You\'re up 5% from last month.\n\nAttendance Chart:\n[██████████░░] 87%\n[████████░░░░] 78% (Database Systems)\n[███████████░] 95% (Computer Networks)',
      'Best performing course: Computer Networks (95% attendance). Needs attention: Database Systems (78%).',
      'You\'re in the top 25% of students for consistent attendance this semester!'
    ],
    technical: [
      'For technical issues, please contact our support team at support@ug.edu.gh.',
      'Try refreshing the app or clearing your browser cache if you\'re experiencing issues.',
      'Make sure location services are enabled for GPS-based attendance marking.'
    ],
    policy: [
      'Attendance Policy: Students must attend at least 75% of classes to be eligible for exams. Absences must be justified with valid documentation. Read more: https://www.ug.edu.gh/attendance-policy',
      'University attendance policy requires regular participation. For details, visit: https://www.ug.edu.gh/attendance-policy.'
    ],
    correction: [
      'To request an attendance correction, please fill out the correction form: https://www.ug.edu.gh/attendance-correction or contact your lecturer directly.',
      'Attendance correction requests should be submitted within 7 days of the class. Use this link: https://www.ug.edu.gh/attendance-correction.'
    ],
    contact_lecturer: [
      'You can contact your lecturer at: lecturer@ug.edu.gh or visit during office hours (Mon-Fri, 10am-12pm).',
      'For urgent matters, email your lecturer or use the staff directory: https://www.ug.edu.gh/staff-directory.'
    ],
    grading: [
      'Grading: Attendance counts for 10% of your final grade. Missing more than 25% of classes may result in a failing grade.',
      'Grades are based on attendance, assignments, and exams. For grading breakdown, see: https://www.ug.edu.gh/grading-policy.'
    ],
    resources: [
      'Campus Resources: Library (https://library.ug.edu.gh), Counseling (https://www.ug.edu.gh/counseling), IT Support (https://www.ug.edu.gh/it-support).',
      'Useful links: [Library](https://library.ug.edu.gh), [Counseling](https://www.ug.edu.gh/counseling), [IT Support](https://www.ug.edu.gh/it-support)'
    ]
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return predefinedResponses.greeting[Math.floor(Math.random() * predefinedResponses.greeting.length)];
    }
    
    if (message.includes('attendance policy') || message.includes('policy')) {
      return predefinedResponses.policy[Math.floor(Math.random() * predefinedResponses.policy.length)];
    }
    
    if (message.includes('grading') || message.includes('grade')) {
      return predefinedResponses.grading[Math.floor(Math.random() * predefinedResponses.grading.length)];
    }
    
    if (message.includes('campus resources') || message.includes('resources')) {
      return predefinedResponses.resources[Math.floor(Math.random() * predefinedResponses.resources.length)];
    }
    
    if (message.includes('attendance correction') || message.includes('correction')) {
      return predefinedResponses.correction[Math.floor(Math.random() * predefinedResponses.correction.length)];
    }
    
    if (message.includes('contact lecturer') || message.includes('lecturer')) {
      return predefinedResponses.contact_lecturer[Math.floor(Math.random() * predefinedResponses.contact_lecturer.length)];
    }
    
    if (message.includes('attendance') || message.includes('present') || message.includes('absent')) {
      return predefinedResponses.attendance[Math.floor(Math.random() * predefinedResponses.attendance.length)];
    }
    
    if (message.includes('schedule') || message.includes('class') || message.includes('timetable')) {
      return predefinedResponses.schedule[Math.floor(Math.random() * predefinedResponses.schedule.length)];
    }
    
    if (message.includes('analytics') || message.includes('statistics') || message.includes('performance')) {
      return predefinedResponses.analytics[Math.floor(Math.random() * predefinedResponses.analytics.length)];
    }
    
    if (message.includes('help') || message.includes('support') || message.includes('problem')) {
      return predefinedResponses.technical[Math.floor(Math.random() * predefinedResponses.technical.length)];
    }
    
    return 'I understand you\'re asking about "' + userMessage + '". Let me help you with that. For specific technical issues, please contact our support team.';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: generateBotResponse(inputMessage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      attendance: 'Show me my attendance statistics',
      schedule: 'What\'s my schedule for today?',
      analytics: 'Show my attendance analytics',
      settings: 'I need help with settings',
      policy: 'What is the attendance policy?',
      correction: 'I want to request an attendance correction',
      contact_lecturer: 'Contact my lecturer',
    };

    setInputMessage(actionMessages[action]);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSupportContact = (contact) => {
    if (contact === 'chat') {
      toast.success('Connecting to live chat support...');
    } else {
      toast.success(`Opening ${contact}...`);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg animate-pulse"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        <Badge className="absolute -top-2 -left-2 bg-red-500 text-white animate-bounce">
          AI
        </Badge>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className="border-0 shadow-2xl">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Assistant</span>
              <Badge className="bg-green-500 text-white text-xs">Online</Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Quick Actions */}
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <action.icon className="h-3 w-3" />
                    <span>{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs`}>
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div dangerouslySetInnerHTML={{ __html: message.content.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" class="text-blue-600 underline">$1</a>') }} />
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Support Team */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Need human help?</p>
              <div className="space-y-2">
                {supportTeam.map((member, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSupportContact(member.contact)}
                    className="w-full justify-start text-xs"
                  >
                    <member.icon className="h-3 w-3 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-gray-500">{member.role}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Chatbot;
