
import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, HelpCircle, Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('faq');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqs = [
    {
      question: 'How do I mark my attendance?',
      answer: 'You can mark attendance using three methods: QR Code scanning, Face verification, or GPS location verification. Simply go to the Attendance page and choose your preferred method.'
    },
    {
      question: 'What if I miss a class?',
      answer: 'If you miss a class, your attendance will be automatically marked as absent. You can contact your lecturer through the messaging system to explain your absence.'
    },
    {
      question: 'How accurate is the face recognition system?',
      answer: 'Our face recognition system has an accuracy rate of 99.2%. It uses advanced AI algorithms to ensure secure and reliable attendance marking.'
    },
    {
      question: 'Can I view my attendance history?',
      answer: 'Yes, you can view your complete attendance history in the Attendance section. It shows all your classes, attendance status, and methods used.'
    },
    {
      question: 'How do I contact my lecturer?',
      answer: 'You can message your lecturer directly through the messaging system in your student portal. Messages are delivered in real-time.'
    }
  ];

  const handleSubmitTicket = () => {
    if (!supportTicket.subject.trim() || !supportTicket.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Support ticket submitted successfully! We will get back to you within 24 hours.');
    setSupportTicket({ subject: '', message: '', priority: 'medium' });
  };

  const renderFAQ = () => (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span>{faq.question}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{faq.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContact = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>Email Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Get help via email</p>
          <div className="space-y-2">
            <p><strong>General Support:</strong> support@ug.edu.gh</p>
            <p><strong>Technical Issues:</strong> tech@ug.edu.gh</p>
            <p><strong>Academic Support:</strong> academic@ug.edu.gh</p>
          </div>
          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-green-600" />
            <span>Phone Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
          <div className="space-y-2">
            <p><strong>Main Line:</strong> +233 30 213 2680</p>
            <p><strong>Emergency:</strong> +233 24 123 4567</p>
            <p><strong>Hours:</strong> Mon-Fri 8AM-6PM</p>
          </div>
          <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
            <Phone className="h-4 w-4 mr-2" />
            Call Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderTicket = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <span>Submit Support Ticket</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Subject *</label>
          <Input
            value={supportTicket.subject}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Brief description of your issue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={supportTicket.priority}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message *</label>
          <Textarea
            value={supportTicket.message}
            onChange={(e) => setSupportTicket(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Describe your issue in detail..."
            rows={6}
          />
        </div>

        <Button onClick={handleSubmitTicket} className="w-full bg-purple-600 hover:bg-purple-700">
          <Send className="h-4 w-4 mr-2" />
          Submit Ticket
        </Button>
      </CardContent>
    </Card>
  );

  const renderLiveChat = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <span>Live Chat Support</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Bot className="h-6 w-6 bg-indigo-100 rounded-full p-1 mt-1" />
              <div className="bg-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">Hello! I'm the AI support assistant. How can I help you today?</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 justify-end">
              <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">I need help with attendance marking</p>
              </div>
              <User className="h-6 w-6 bg-blue-100 rounded-full p-1 mt-1" />
            </div>
            <div className="flex items-start space-x-2">
              <Bot className="h-6 w-6 bg-indigo-100 rounded-full p-1 mt-1" />
              <div className="bg-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">I'd be happy to help you with attendance marking! You can use QR codes, face recognition, or GPS verification. Which method would you like to know more about?</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input placeholder="Type your message..." className="flex-1" />
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600">Get help and support for your questions</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {/* Support Options */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'faq' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'contact' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'ticket' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Support Ticket
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Live Chat
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'faq' && renderFAQ()}
          {activeTab === 'contact' && renderContact()}
          {activeTab === 'ticket' && renderTicket()}
          {activeTab === 'chat' && renderLiveChat()}
        </div>
      </div>
    </div>
  );
};

export default Support;
