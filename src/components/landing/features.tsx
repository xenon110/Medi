'use client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  MessageSquare, 
  Shield, 
  Stethoscope, 
  Upload, 
  Users,
  CheckCircle,
  Globe,
  FileText,
  Video,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

const Features = () => {
  const router = useRouter();
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze skin conditions with 95% accuracy, providing instant preliminary assessments.",
      color: "text-primary"
    },
    {
      icon: Upload,
      title: "Easy Image Upload",
      description: "Simply upload clear photos of skin conditions. Our system validates images and guides you through the process.",
      color: "text-accent"
    },
    {
      icon: MessageSquare,
      title: "Smart Chatbot Assistant",
      description: "Interactive AI assistant helps gather symptoms, medical history, and additional context through text or voice input.",
      color: "text-success"
    },
    {
      icon: Stethoscope,
      title: "Expert Doctor Review",
      description: "Verified dermatologists review AI analyses, provide customized treatment plans, and offer professional consultations.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant Security",
      description: "End-to-end encryption, secure data storage, and compliance with healthcare privacy regulations ensure your data is protected.",
      color: "text-accent"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Get reports and consultations in your preferred language with support for 5+ regional languages including Hindi, English, and more.",
      color: "text-success"
    }
  ];

  const patientFlow = [
    {
      step: "01",
      title: "Upload & Analyze",
      description: "Upload skin condition photos and provide symptoms through our AI chatbot assistant.",
      icon: Upload
    },
    {
      step: "02", 
      title: "AI Assessment",
      description: "Our advanced AI analyzes images and symptoms to provide preliminary diagnosis and recommendations.",
      icon: Brain
    },
    {
      step: "03",
      title: "Doctor Review",
      description: "Verified dermatologists review AI analysis and provide professional medical guidance.",
      icon: Stethoscope
    },
    {
      step: "04",
      title: "Treatment Plan",
      description: "Receive personalized treatment recommendations, prescriptions, and follow-up care instructions.",
      icon: FileText
    }
  ];

  const doctorFeatures = [
    {
      icon: Users,
      title: "Patient Management",
      description: "WhatsApp-style interface to manage patient consultations and review AI-generated reports efficiently."
    },
    {
      icon: CheckCircle,
      title: "Quick Verification",
      description: "Approve or customize AI analyses with one-click approval or detailed editing capabilities."
    },
    {
      icon: Video,
      title: "Professional Verification",
      description: "Secure verification process using medical licenses, degrees, and registration numbers."
    }
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Advanced AI meets
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Expert Care</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Combining cutting-edge artificial intelligence with professional dermatological expertise to provide comprehensive skin health solutions.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 shadow-card hover:shadow-elevated transition-smooth border-0 bg-card">
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* How It Works - Patient Flow */}
        <div id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              How It Works for <span className="text-success">Patients</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get professional skin health guidance in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {patientFlow.map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                    <item.icon className="w-6 h-6 text-success" />
                  </div>
                  {index < patientFlow.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-accent opacity-30"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Features */}
        <div className="bg-gradient-subtle rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Built for <span className="text-accent">Healthcare Professionals</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Streamlined tools for doctors to review, verify, and enhance AI-generated medical assessments
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {doctorFeatures.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="doctor" size="lg" onClick={() => router.push('/login?role=doctor')}>
              Join Our Medical Network
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
