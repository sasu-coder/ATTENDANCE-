
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Users, BookOpen, BarChart3, Shield, 
  ChevronLeft, ChevronRight, Play, Star, Award,
  Globe, MessageSquare, Settings, Clock, MapPin,
  Camera, QrCode, Bell, Zap, ExternalLink, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const images = [
    '/lovable-uploads/45cafd7d-4a91-4c10-b716-b13825770636.png',
    '/lovable-uploads/8411934e-409f-4f18-a498-4a7ac098b66c.png',
    '/lovable-uploads/bdd45c7a-98a0-406d-8c79-777d4e626b8b.png',
    '/lovable-uploads/a412f669-3fea-47bb-8696-4227480ffc47.png',
    '/lovable-uploads/28347c20-2b64-43f8-a953-4feeb1df07b9.png',
    '/lovable-uploads/8e596744-2997-4b44-a657-d1f5d13bbe97.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Attendance',
      description: 'Quick and secure attendance marking with QR technology',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Camera,
      title: 'Face Recognition',
      description: 'AI-powered facial verification for seamless check-ins',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: MapPin,
      title: 'GPS Verification',
      description: 'Location-based attendance with real-time tracking',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and attendance analytics',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Real-time alerts and attendance reminders',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with blockchain verification',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students', icon: Users },
    { number: '500+', label: 'Courses', icon: BookOpen },
    { number: '98%', label: 'Accuracy Rate', icon: Award },
    { number: '24/7', label: 'Support', icon: Clock }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Computer Science Lecturer',
      image: '/placeholder-avatar.jpg',
      text: 'This system has revolutionized how we manage attendance. The face recognition is incredibly accurate!'
    },
    {
      name: 'Kwame Asante',
      role: 'Computer Science Student',
      image: '/placeholder-avatar.jpg',
      text: 'Super convenient! I can mark attendance with just my phone. No more paper-based systems.'
    },
    {
      name: 'Prof. Ama Aidoo',
      role: 'Engineering Department Head',
      image: '/placeholder-avatar.jpg',
      text: 'The analytics provided help us identify at-risk students early. Fantastic tool for education!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">UG Attendance System</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  🚀 Next-Gen Attendance System
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Smart Attendance 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {' '}Management
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your institution with AI-powered attendance tracking, 
                  real-time analytics, and seamless integration for students and educators.
                </p>
              </div>

              {/* Portal Access Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <User className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Student Portal</h3>
                    <p className="text-sm text-gray-600 mb-4">Access your attendance, courses, and analytics</p>
                    <div className="space-y-2">
                      <Link to="/login">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                          Student Login
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          localStorage.setItem('simulationMode', 'true');
                          localStorage.setItem('simulationUser', JSON.stringify({
                            id: 'sim-student-123',
                            email: 'student@simulation.com',
                            role: 'student',
                            full_name: 'User'
                          }));
                          navigate('/student-dashboard');
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Demo Mode
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 hover:border-green-400 transition-all duration-300 cursor-pointer hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Lecturer Portal</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage classes, attendance, and student analytics</p>
                    <div className="space-y-2">
                      <Link to="/login">
                        <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                          Lecturer Login
                        </Button>
                      </Link>
                      <Link to="/lecturer-dashboard">
                        <Button variant="outline" size="sm" className="w-full">
                          <Zap className="h-3 w-3 mr-1" />
                          Demo Mode
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Image Slider */}
            <div className="relative">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={images[currentSlide]} 
                  alt="Attendance System"
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Slider Controls */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2 hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-blue-600' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive attendance management system combines cutting-edge technology 
              with user-friendly design to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by thousands of educators and students worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educational institutions already using our smart attendance system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <GraduationCap className="h-8 w-8" />
                <span className="text-xl font-bold">UG Attendance</span>
              </div>
              <p className="text-gray-400">
                Smart attendance management for the digital age.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UG Attendance System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;
