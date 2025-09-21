
import { BrainCircuit, Zap, UserCheck, Globe, ShieldCheck, MessagesSquare } from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Analysis',
    description:
      'Advanced machine learning algorithms trained on thousands of dermatological cases for accurate skin condition identification.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description:
      'Get comprehensive analysis and recommendations within seconds of uploading your skin condition image.',
  },
  {
    icon: UserCheck,
    title: 'Expert Verification',
    description:
      'All AI-generated reports are reviewed and verified by licensed dermatologists for maximum accuracy.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description:
      'Access reports and communicate in your preferred language with support for 5+ regional languages.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy & Security',
    description:
      'Your medical data is protected with end-to-end encryption and HIPAA-compliant security standards.',
  },
  {
    icon: MessagesSquare,
    title: 'Seamless Communication',
    description:
      'Connect directly with doctors through our secure, WhatsApp-style messaging interface.',
  },
];

const Features = () => {
  return (
     <section className="features py-20 bg-white" id="features">
        <div className="features-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient">Why Choose MEDISKIN?</h2>
            <p className="section-subtitle text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">Advanced technology meets medical expertise</p>
            
            <div className="features-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {features.map((feature, index) => (
                    <div key={index} className="feature-card p-8 rounded-2xl bg-muted/30 border border-border/20 transition-transform duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-secondary text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <feature.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default Features;
