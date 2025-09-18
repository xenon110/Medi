
import { Hand, Bug, Syringe, CircleDot, Dna, ShieldAlert, Layers, UserCheck, Microscope, Bone, CircleSlash, LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export interface KnowledgeBaseArticle {
  slug: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  images: [string, string, string];
  overview: string;
  symptoms: string[];
  causes: string;
  homeRemedies: string[];
  medicalRecommendation: string;
  disclaimer: string;
}

const defaultContent = {
    icon: Layers,
    images: ['kb-eczema-1', 'kb-eczema-2', 'kb-eczema-3'] as [string, string, string],
    overview: 'Detailed information for this topic is coming soon. Our medical team is working on providing comprehensive guides for a wide range of skin conditions.',
    symptoms: ['Symptom information is being compiled.'],
    causes: 'Information about causes and risk factors is being compiled.',
    homeRemedies: ['Home remedy suggestions are being compiled.'],
    medicalRecommendation: 'For an accurate diagnosis and treatment plan, it is always best to consult with a qualified dermatologist. You can use the MediScan AI app to start a consultation.',
    disclaimer: 'This is AI-generated knowledge and not a replacement for professional medical consultation. Always consult a qualified healthcare provider for diagnosis and treatment.'
};

export const KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
  {
    slug: 'eczemas',
    title: 'Eczema / Dermatitis',
    subtitle: 'Understanding and managing inflammatory skin conditions.',
    icon: Hand,
    images: ['kb-eczema-1', 'kb-eczema-2', 'kb-eczema-3'],
    overview:
      'Eczema, also known as atopic dermatitis, is a chronic inflammatory skin condition characterized by dry, itchy, and inflamed skin. It often starts in childhood but can occur at any age. The condition results from a combination of genetic and environmental factors, leading to a compromised skin barrier that is more susceptible to irritants and allergens.',
    symptoms: [
      'Dry, sensitive skin',
      'Intense itching, especially at night',
      'Red to brownish-gray patches, particularly on the hands, feet, ankles, wrists, neck, upper chest, eyelids, and in the bends of the elbows and knees',
      'Small, raised bumps, which may leak fluid and crust over when scratched',
      'Thickened, cracked, scaly skin',
    ],
    causes:
      'The exact cause of eczema is unknown, but it\'s thought to be linked to an overactive immune system that responds aggressively to irritants. A gene variation affecting the skin\'s barrier function can also play a role. Common triggers include dry skin, irritants like soaps and detergents, stress, and allergens like pollen or pet dander.',
    homeRemedies: [
      'Moisturize your skin at least twice a day with a thick cream or ointment.',
      'Take daily baths or showers with lukewarm water and a gentle, non-soap cleanser.',
      'Apply a cold, wet compress to the affected area to relieve itching.',
      'Wear smooth, breathable clothing and avoid scratchy fabrics like wool.',
      'Use a humidifier in dry or cold weather.',
    ],
    medicalRecommendation:
      'AI analysis suggests that if your symptoms are severe or not improving with home care, a dermatologist consultation is highly recommended. They may prescribe topical corticosteroids, calcineurin inhibitors, or other medications to control inflammation and itching. Light therapy or injectable biologics may be options for severe cases.',
    disclaimer: 'This is AI-generated knowledge and not a replacement for professional medical consultation. Always consult a qualified healthcare provider for diagnosis and treatment.',
  },
  { ...defaultContent, slug: 'reactions', title: 'Reactions', subtitle: 'Understanding skin reactions.' },
  { ...defaultContent, slug: 'infections', title: 'Infections', icon: Bug, subtitle: 'Understanding skin infections.' },
  { ...defaultContent, slug: 'treatments', title: 'Treatments', icon: Syringe, subtitle: 'Understanding skin treatments.' },
  { ...defaultContent, slug: 'lesions-cancerous', title: 'Cancerous Lesions', icon: CircleDot, subtitle: 'Understanding cancerous lesions.' },
  { ...defaultContent, slug: 'lesions-benign', title: 'Benign Lesions', icon: CircleSlash, subtitle: 'Understanding benign lesions.' },
  { ...defaultContent, slug: 'genetic', title: 'Genetic Conditions', icon: Dna, subtitle: 'Understanding genetic skin conditions.' },
  { ...defaultContent, slug: 'systemic-diseases', title: 'Systemic Diseases', icon: UserCheck, subtitle: 'Understanding systemic diseases affecting skin.' },
  { ...defaultContent, slug: 'autoimmune', title: 'Autoimmune Disorders', icon: ShieldAlert, subtitle: 'Understanding autoimmune skin disorders.' },
  { ...defaultContent, slug: 'rashes', title: 'Rashes', icon: Layers, subtitle: 'Understanding different types of rashes.' },
  { ...defaultContent, slug: 'follicular-disorder', title: 'Follicular Disorders', icon: Microscope, subtitle: 'Understanding follicular disorders.' },
  { ...defaultContent, slug: 'infestations', title: 'Infestations', icon: Bone, subtitle: 'Understanding skin infestations.' },
  { ...defaultContent, slug: 'blood-vessel-problems', title: 'Blood Vessel Problems', icon: Dna, subtitle: 'Understanding blood vessel-related skin issues.' },
  { ...defaultContent, slug: 'pigmentary-disorders', title: 'Pigmentary Disorders', icon: Layers, subtitle: 'Understanding disorders of skin pigmentation.' },
  { ...defaultContent, slug: 'acne', title: 'Acne', subtitle: 'Understanding acne.' },
  { ...defaultContent, slug: 'athletes-foot', title: "Athlete's Foot", subtitle: "Understanding athlete's foot." },
  { ...defaultContent, slug: 'cellulitis', title: 'Cellulitis', subtitle: 'Understanding cellulitis.' },
  { ...defaultContent, slug: 'cold-sores', title: 'Cold Sores', subtitle: 'Understanding cold sores.' },
  { ...defaultContent, slug: 'heat-rash', title: 'Heat Rash', subtitle: 'Understanding heat rash.' },
  { ...defaultContent, slug: 'hives', title: 'Hives', subtitle: 'Understanding hives.' },
  { ...defaultContent, slug: 'impetigo', title: 'Impetigo', subtitle: 'Understanding impetigo.' },
  { ...defaultContent, slug: 'psoriasis', title: 'Psoriasis', subtitle: 'Understanding psoriasis.' },
  { ...defaultContent, slug: 'ringworm', title: 'Ringworm', subtitle: 'Understanding ringworm.' },
  { ...defaultContent, slug: 'rosacea', title: 'Rosacea', subtitle: 'Understanding rosacea.' },
  { ...defaultContent, slug: 'seborrhoeic-dermatitis', title: 'Seborrhoeic Dermatitis', subtitle: 'Understanding seborrhoeic dermatitis.' },
  { ...defaultContent, slug: 'shingles', title: 'Shingles', subtitle: 'Understanding shingles.' },
  { ...defaultContent, slug: 'vitiligo', title: 'Vitiligo', subtitle: 'Understanding vitiligo.' },
];
