import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Clock, Users, Stethoscope, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  const features = [
    {
      icon: Stethoscope,
      title: "Verified Doctors",
      description: "Connect with qualified and verified healthcare professionals across various specialties.",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule appointments instantly with real-time availability and instant confirmations.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security and HIPAA compliance.",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your health records and book consultations anytime, from anywhere.",
    },
  ];

  const solutions = [
    {
      title: "For Patients",
      description: "Find doctors, book appointments, and manage your health records all in one place.",
      cta: "Get Started",
      link: "/signup",
    },
    {
      title: "For Doctors",
      description: "Manage your practice, connect with patients, and grow your healthcare service digitally.",
      cta: "Join as Doctor",
      link: "/signup",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Your Health,{" "}
              <span className="text-gradient">Digitally Reimagined</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with verified doctors, book appointments instantly, and manage your healthcare journey with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doctors">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-base w-full sm:w-auto">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Find a Doctor
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="text-base w-full sm:w-auto">
                  <Users className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose Kromium Health?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to making quality healthcare accessible, efficient, and secure for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-medium transition-smooth animate-slide-up border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Our Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital healthcare solutions designed for both patients and healthcare providers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {solutions.map((solution, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-strong transition-smooth animate-scale-in border-border"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h3 className="font-heading font-bold text-2xl mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <Link to={solution.link}>
                  <Button className="bg-primary hover:bg-primary-hover w-full">
                    {solution.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              At Kromium Health, we're on a mission to transform healthcare delivery across Africa by bridging the gap between patients and quality medical care through innovative digital solutions.
            </p>
            <p className="text-muted-foreground">
              We believe everyone deserves access to reliable healthcare services, transparent medical information, and the convenience of managing their health journey digitally—all while maintaining the highest standards of data security and privacy.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers already using Kromium Health.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-base">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
