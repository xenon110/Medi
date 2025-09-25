
import { Hand, Bug, Syringe, CircleDot, Dna, ShieldAlert, Layers, UserCheck, Microscope, Bone, CircleSlash, LucideIcon, Utensils, Zap, Sun, Virus } from 'lucide-react';
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

const defaultDisclaimer = 'This is AI-generated knowledge and not a replacement for professional medical consultation. Always consult a qualified healthcare provider for diagnosis and treatment.';

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
    disclaimer: defaultDisclaimer,
  },
  {
    slug: 'psoriasis',
    title: 'Psoriasis',
    subtitle: 'Managing an autoimmune condition causing rapid skin cell growth.',
    icon: Layers,
    images: ['kb-psoriasis-1', 'kb-psoriasis-2', 'kb-psoriasis-3'],
    overview: 'Psoriasis is a chronic autoimmune disease that causes the rapid build-up of skin cells. This build-up of cells causes scaling on the skin’s surface. Inflammation and redness around the scales are common. Psoriatic scales are whitish-silver and develop in thick, red patches. Sometimes, these patches will crack and bleed.',
    symptoms: [
        'Red patches of skin covered with thick, silvery scales',
        'Small scaling spots (commonly seen in children)',
        'Dry, cracked skin that may bleed or itch',
        'Itching, burning, or soreness',
        'Thickened, pitted, or ridged nails',
        'Swollen and stiff joints'
    ],
    causes: 'Psoriasis is thought to be an immune system problem where T-cells and other white blood cells, known as neutrophils, in your body mistakenly attack healthy skin cells. Triggers can include infections, stress, cold weather, and certain medications.',
    homeRemedies: [
        'Take daily baths with colloidal oatmeal or Epsom salts.',
        'Use moisturizer daily, especially after bathing.',
        'Expose skin to small amounts of sunlight (phototherapy), as recommended by a doctor.',
        'Avoid triggers such as smoking and high-stress situations.'
    ],
    medicalRecommendation: 'A doctor can diagnose psoriasis by examining your skin, nails, and scalp. Treatment aims to stop skin cells from growing so quickly and may include topical ointments, light therapy, and oral or injected medication.',
    disclaimer: defaultDisclaimer,
  },
  {
    slug: 'acne',
    title: 'Acne',
    subtitle: 'Treating and preventing common skin blemishes.',
    icon: CircleDot,
    images: ['kb-acne-1', 'kb-acne-2', 'kb-acne-3'],
    overview: 'Acne is a skin condition that occurs when your hair follicles become plugged with oil and dead skin cells. It causes whiteheads, blackheads or pimples. Acne is most common among teenagers, though it affects people of all ages.',
    symptoms: [
        'Whiteheads (closed plugged pores)',
        'Blackheads (open plugged pores)',
        'Small red, tender bumps (papules)',
        'Pimples (pustules), which are papules with pus at their tips',
        'Large, solid, painful lumps under the skin (nodules)',
        'Painful, pus-filled lumps under the skin (cystic lesions)'
    ],
    causes: 'Four main factors cause acne: Excess oil (sebum) production, hair follicles clogged by oil and dead skin cells, bacteria, and inflammation. Hormonal changes, certain medications, diet, and stress can also trigger or worsen acne.',
    homeRemedies: [
        'Wash your face twice a day and after sweating.',
        'Use a gentle, non-abrasive cleanser and apply it with your fingertips.',
        'Shampoo your hair regularly if it\'s oily.',
        'Avoid touching your face.',
        'Use over-the-counter acne creams with benzoyl peroxide or salicylic acid.'
    ],
    medicalRecommendation: 'If self-care remedies don\'t clear your acne, see a dermatologist. They can prescribe stronger lotions, oral antibiotics, or hormonal treatments. Early, effective treatment of acne reduces the risk of scarring.',
    disclaimer: defaultDisclaimer,
  },
  {
    slug: 'rosacea',
    title: 'Rosacea',
    subtitle: 'Controlling redness and bumps on the face.',
    icon: ShieldAlert,
    images: ['kb-rosacea-1', 'kb-rosacea-2', 'kb-rosacea-3'],
    overview: 'Rosacea is a common skin condition that causes redness and visible blood vessels in your face. It may also produce small, red, pus-filled bumps. These signs and symptoms may flare up for weeks to months and then go away for a while.',
    symptoms: [
        'Facial redness, with flushing and persistent redness in the central part of the face',
        'Swollen, red bumps (papules and pustules)',
        'Eye problems (ocular rosacea), such as dry, irritated, swollen eyes and red, swollen eyelids',
        'Enlarged nose (rhinophyma), where the skin on the nose thickens and becomes bulbous'
    ],
    causes: 'The cause of rosacea is unknown, but it could be due to a combination of hereditary and environmental factors. A number of factors can trigger or aggravate rosacea by increasing blood flow to the surface of your skin, such as hot drinks, spicy foods, alcohol, temperature extremes, sunlight, stress, and certain medications.',
    homeRemedies: [
        'Identify and avoid your personal triggers.',
        'Protect your face by using a broad-spectrum sunscreen with an SPF of 30 or higher.',
        'Use gentle skincare products and avoid harsh scrubbing.',
        'Apply a green-tinted makeup to reduce the appearance of redness.'
    ],
    medicalRecommendation: 'Treatment for rosacea focuses on controlling signs and symptoms. A dermatologist can recommend topical drugs that reduce redness, oral antibiotics for inflammation, or laser therapy to reduce visible blood vessels.',
    disclaimer: defaultDisclaimer,
  },
  {
    slug: 'infections',
    title: 'Skin Infections',
    icon: Bug,
    subtitle: 'Identifying and treating bacterial, fungal, and viral skin issues.',
    images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'],
    overview: 'Skin infections occur when bacteria, fungi, viruses, or parasites invade the skin through a break, such as a cut or scratch. These infections can range from mild conditions that resolve on their own to severe problems requiring medical intervention.',
    symptoms: [
      'Redness and swelling at the site of infection.',
      'Pain or tenderness.',
      'Pus or other drainage from an open skin sore.',
      'Blisters, boils, or abscesses.',
      'Fever (in more severe cases).',
    ],
    causes: 'Bacterial infections are often caused by Staphylococcus or Streptococcus. Fungal infections include athlete\'s foot and ringworm. Viral infections can cause warts or cold sores. The risk increases with a weakened immune system or poor circulation.',
    homeRemedies: [
      'Keep the affected area clean and dry.',
      'Apply over-the-counter antibiotic or antifungal creams for minor infections.',
      'Use a cold compress to reduce swelling and pain.',
      'Avoid scratching the area to prevent spreading.'
    ],
    medicalRecommendation: 'If the infection is worsening, spreading, or accompanied by a fever, consult a doctor. Prescription antibiotics, antifungals, or antiviral medications may be necessary. A doctor might need to drain a severe abscess.',
    disclaimer: defaultDisclaimer,
  },
  {
    slug: 'lesions-cancerous',
    title: 'Cancerous Lesions',
    icon: CircleDot,
    subtitle: 'Recognizing signs of skin cancer.',
    images: ['kb-lesions-cancerous-1', 'kb-lesions-cancerous-2', 'kb-lesions-cancerous-3'],
    overview: 'Skin cancer is the abnormal growth of skin cells, most often developing on skin exposed to the sun. The three major types are basal cell carcinoma, squamous cell carcinoma, and melanoma. Early detection is key to successful treatment.',
    symptoms: [
      'A new mole or a change in an existing mole (ABCDEs of melanoma: Asymmetry, Border, Color, Diameter, Evolving).',
      'A firm, red nodule or a flat lesion with a scaly, crusted surface (squamous cell).',
      'A pearly or waxy bump or a flat, flesh-colored or brown scar-like lesion (basal cell).',
      'A sore that does not heal.',
    ],
    causes: 'The primary cause is exposure to ultraviolet (UV) radiation from sunlight or tanning beds. Risk factors include fair skin, a history of sunburns, numerous moles, a family history of skin cancer, and a weakened immune system.',
    homeRemedies: [
      'There are no home remedies for treating skin cancer. Prevention is key.',
      'Wear protective clothing and use broad-spectrum sunscreen with SPF 30 or higher.',
      'Avoid peak sun hours (10 a.m. to 4 p.m.).',
      'Perform regular self-examinations of your skin.'
    ],
    medicalRecommendation: 'Immediate consultation with a dermatologist is crucial if you suspect a cancerous lesion. Diagnosis involves a skin biopsy. Treatment options include surgical excision, radiation therapy, chemotherapy, and immunotherapy, depending on the type and stage.',
    disclaimer: defaultDisclaimer,
  },
   {
    slug: 'hives',
    title: 'Hives (Urticaria)',
    subtitle: 'Understanding welts on the skin.',
    icon: Layers,
    images: ['kb-hives-1', 'kb-hives-2', 'kb-hives-3'],
    overview: 'Hives, also known as urticaria, are an outbreak of swollen, pale red bumps or plaques (wheals) on the skin that appear suddenly — either as a result of the body’s reaction to certain allergens, or for unknown reasons. Hives usually cause itching, but may also burn or sting.',
    symptoms: [
        'Raised, itchy, red or skin-colored welts (wheals)',
        'Welts that vary in size, change shape, and appear and fade repeatedly as the reaction runs its course',
        'Blanching (when pressed, the center of a hive turns white)',
        'Can occur anywhere on the body'
    ],
    causes: 'Hives are caused by the body\'s reaction to an allergen or other trigger, which causes mast cells in the skin to release histamine and other chemicals. Common triggers include certain foods (nuts, eggs, shellfish), medications, insect stings, sunlight, and stress.',
    homeRemedies: [
        'Apply cool compresses to the affected areas.',
        'Take a comfortably cool bath with colloidal oatmeal.',
        'Wear loose, smooth-textured cotton clothing.',
        'Avoid known triggers.'
    ],
    medicalRecommendation: 'Over-the-counter antihistamines can help relieve itching. If symptoms are severe, include swelling of the throat or tongue, or do not respond to treatment, seek immediate medical attention. A doctor may prescribe stronger antihistamines or a course of oral corticosteroids.',
    disclaimer: defaultDisclaimer,
  },
  { slug: 'reactions', title: 'Reactions', subtitle: 'Understanding skin reactions.', icon: Hand, images: ['kb-hives-1', 'kb-hives-2', 'kb-hives-3'], overview: 'Skin reactions occur when the skin is exposed to an irritant or allergen, leading to inflammation.', symptoms: ['Redness, itching, swelling.'], causes: 'Contact with chemicals, plants, or certain materials.', homeRemedies: ['Avoid the trigger, apply cool compresses.'], medicalRecommendation: 'Consult a doctor if the reaction is severe or widespread.', disclaimer: defaultDisclaimer, },
  { slug: 'treatments', title: 'Treatments', icon: Syringe, subtitle: 'Understanding skin treatments.', images: ['kb-eczema-3', 'kb-acne-3', 'kb-psoriasis-3'], overview: 'Various treatments exist for skin conditions, from topical creams to systemic medications.', symptoms: ['Improvement of skin condition.'], causes: 'Application or ingestion of prescribed treatments.', homeRemedies: ['Follow prescribed regimen.'], medicalRecommendation: 'Use as directed by a healthcare professional.', disclaimer: defaultDisclaimer, },
  { slug: 'lesions-benign', title: 'Benign Lesions', icon: CircleSlash, subtitle: 'Understanding non-cancerous skin growths.', images: ['kb-acne-1', 'kb-acne-2', 'kb-acne-3'], overview: 'Benign lesions are non-cancerous growths on the skin, such as moles, warts, or skin tags.', symptoms: ['Stable, non-changing growths.'], causes: 'Genetics, sun exposure, or viral infections.', homeRemedies: ['Generally not required, but some can be removed for cosmetic reasons.'], medicalRecommendation: 'Monitor for any changes and consult a doctor if you notice evolution in size, shape, or color.', disclaimer: defaultDisclaimer, },
  { slug: 'genetic', title: 'Genetic Conditions', icon: Dna, subtitle: 'Understanding inherited skin conditions.', images: ['kb-psoriasis-1', 'kb-psoriasis-2', 'kb-psoriasis-3'], overview: 'Some skin conditions are inherited and can be present from birth or develop later in life.', symptoms: ['Varies greatly by condition.'], causes: 'Genetic mutations passed down through families.', homeRemedies: ['Management focuses on symptom relief.'], medicalRecommendation: 'A dermatologist can help create a long-term management plan.', disclaimer: defaultDisclaimer, },
  { slug: 'systemic-diseases', title: 'Systemic Diseases', icon: UserCheck, subtitle: 'Understanding how internal diseases affect skin.', images: ['kb-rosacea-1', 'kb-rosacea-2', 'kb-rosacea-3'], overview: 'Many internal diseases, such as lupus or diabetes, can manifest with skin symptoms.', symptoms: ['Rashes, sores, or changes in skin color/texture.'], causes: 'The underlying systemic disease process.', homeRemedies: ['Manage the underlying disease as directed by a doctor.'], medicalRecommendation: 'Treating the root disease is crucial. Skin symptoms should be managed by a dermatologist.', disclaimer: defaultDisclaimer, },
  { slug: 'autoimmune', title: 'Autoimmune Disorders', icon: ShieldAlert, subtitle: 'Understanding autoimmune skin disorders.', images: ['kb-psoriasis-1', 'kb-psoriasis-2', 'kb-psoriasis-3'], overview: 'Autoimmune disorders can cause the immune system to attack healthy skin cells.', symptoms: ['Blisters, rashes, or thickened skin patches.'], causes: 'An overactive and misdirected immune system.', homeRemedies: ['Lifestyle changes to reduce inflammation may help.'], medicalRecommendation: 'Requires diagnosis and treatment by a specialist, often involving immunosuppressive medications.', disclaimer: defaultDisclaimer, },
  { slug: 'rashes', title: 'Rashes', icon: Layers, subtitle: 'Understanding different types of rashes.', images: ['kb-hives-1', 'kb-hives-2', 'kb-hives-3'], overview: 'A rash is a noticeable change in the texture or color of your skin. It can be itchy, bumpy, scaly, or otherwise irritated.', symptoms: ['Redness, itching, bumps, blisters.'], causes: 'Allergies, infections, heat, or medical conditions.', homeRemedies: ['Oatmeal baths, cool compresses, and avoiding irritants.'], medicalRecommendation: 'If a rash is persistent, painful, or accompanied by fever, see a doctor.', disclaimer: defaultDisclaimer, },
  { slug: 'follicular-disorder', title: 'Follicular Disorders', icon: Microscope, subtitle: 'Understanding follicular disorders.', images: ['kb-acne-1', 'kb-acne-2', 'kb-acne-3'], overview: 'These disorders affect the hair follicles, leading to conditions like acne or folliculitis.', symptoms: ['Pimples, cysts, or inflamed hair follicles.'], causes: 'Clogged pores, bacteria, or inflammation.', homeRemedies: ['Gentle cleansing and avoiding tight clothing.'], medicalRecommendation: 'Topical or oral medications can effectively treat most follicular disorders.', disclaimer: defaultDisclaimer, },
  { slug: 'infestations', title: 'Infestations', icon: Bone, subtitle: 'Understanding skin infestations.', images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'], overview: 'Skin infestations are caused by tiny insects or mites that burrow into the skin, such as scabies or lice.', symptoms: ['Intense itching, rash, and visible burrow lines.'], causes: 'Direct contact with an infested person or their belongings.', homeRemedies: ['Thoroughly wash all clothing and bedding in hot water.'], medicalRecommendation: 'Requires prescription creams or lotions to kill the mites and their eggs.', disclaimer: defaultDisclaimer, },
  { slug: 'blood-vessel-problems', title: 'Blood Vessel Problems', icon: Zap, subtitle: 'Understanding blood vessel-related skin issues.', images: ['kb-rosacea-1', 'kb-rosacea-2', 'kb-rosacea-3'], overview: 'Conditions like vasculitis or spider veins are related to issues with blood vessels near the skin surface.', symptoms: ['Visible red or purple lines, bruising, or ulcers.'], causes: 'Genetics, sun damage, or underlying medical conditions.', homeRemedies: ['Compression stockings can help with leg vein issues.'], medicalRecommendation: 'Laser therapy or sclerotherapy are common treatments for cosmetic concerns.', disclaimer: defaultDisclaimer, },
  { slug: 'pigmentary-disorders', title: 'Pigmentary Disorders', icon: Layers, subtitle: 'Understanding disorders of skin pigmentation.', images: ['kb-vitiligo-1', 'kb-vitiligo-2', 'kb-vitiligo-3'], overview: 'These disorders affect the color (pigment) of the skin. They can cause patches of lighter or darker skin.', symptoms: ['White patches (vitiligo) or dark patches (melasma).'], causes: 'Autoimmune activity, hormonal changes, or sun exposure.', homeRemedies: ['Sun protection is crucial for managing these conditions.'], medicalRecommendation: 'Various treatments like light therapy or topical creams can help restore skin tone.', disclaimer: defaultDisclaimer, },
  { slug: 'athletes-foot', title: "Athlete's Foot", icon: Bug, subtitle: "Understanding athlete's foot.", images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'], overview: 'A common fungal infection that affects the feet, causing itching, scaling, and redness.', symptoms: ['Itchy, scaly rash, usually between the toes.'], causes: 'Fungus that thrives in warm, moist environments.', homeRemedies: ['Keep feet clean and dry, use OTC antifungal powders.'], medicalRecommendation: 'Prescription-strength antifungal creams or oral medications may be needed.', disclaimer: defaultDisclaimer, },
  { slug: 'cellulitis', title: 'Cellulitis', icon: Bug, subtitle: 'Understanding cellulitis.', images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'], overview: 'A serious bacterial skin infection that appears as a swollen, red area of skin that feels hot and tender.', symptoms: ['Red, swollen, hot, and painful skin area.'], causes: 'Bacteria entering a break in the skin.', homeRemedies: ['None. This requires medical attention.'], medicalRecommendation: 'Seek immediate medical care. Oral or intravenous antibiotics are required.', disclaimer: defaultDisclaimer, },
  { slug: 'cold-sores', title: 'Cold Sores', icon: Virus, subtitle: 'Understanding cold sores.', images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'], overview: 'Painful blisters on or near the lips caused by the herpes simplex virus (HSV-1).', symptoms: ['Tingling or burning, followed by small fluid-filled blisters.'], causes: 'Herpes simplex virus, which is highly contagious.', homeRemedies: ['OTC creams can shorten the duration.'], medicalRecommendation: 'A doctor can prescribe antiviral medications to manage outbreaks.', disclaimer: defaultDisclaimer, },
  { slug: 'heat-rash', title: 'Heat Rash', icon: Sun, subtitle: 'Understanding heat rash.', images: ['kb-rashes-1', 'kb-rashes-2', 'kb-rashes-3'], overview: 'Also known as prickly heat, it occurs when sweat is trapped in the skin, causing a rash of small red bumps.', symptoms: ['Clusters of small, red, itchy bumps.'], causes: 'Blocked sweat ducts in hot, humid weather.', homeRemedies: ['Move to a cooler, less humid environment. Keep the skin cool and dry.'], medicalRecommendation: 'Usually resolves on its own. Severe forms may need topical treatments.', disclaimer: defaultDisclaimer, },
  { slug: 'impetigo', title: 'Impetigo', icon: Bug, subtitle: 'Understanding impetigo.', images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'], overview: 'A highly contagious bacterial skin infection that causes red sores that can break open, ooze fluid, and develop a yellow-brown crust.', symptoms: ['Red sores that form a honey-colored crust.'], causes: 'Staphylococcus or Streptococcus bacteria.', homeRemedies: ['Keep clean, but medical treatment is necessary.'], medicalRecommendation: 'Requires topical or oral antibiotics to clear the infection and prevent spread.', disclaimer: defaultDisclaimer, },
  { slug: 'ringworm', title: 'Ringworm', icon: Bug, subtitle: 'Understanding ringworm.', images: ['kb-infections-1', 'kb-infections-2', 'kb-infections-3'], overview: 'A common fungal infection of the skin, characterized by a circular rash.', symptoms: ['A ring-shaped rash that is itchy, red, and scaly.'], causes: 'A fungus, not a worm. It is contagious.', homeRemedies: ['Over-the-counter antifungal creams.'], medicalRecommendation: 'If OTC treatments don\'t work, a doctor can prescribe stronger medications.', disclaimer: defaultDisclaimer, },
  { slug: 'seborrhoeic-dermatitis', title: 'Seborrhoeic Dermatitis', icon: Hand, subtitle: 'Understanding seborrhoeic dermatitis.', images: ['kb-eczema-1', 'kb-eczema-2', 'kb-eczema-3'], overview: 'A common skin condition that mainly affects your scalp, causing scaly patches, red skin, and stubborn dandruff.', symptoms: ['Dandruff, greasy scales, and itchy patches on the scalp, face, or chest.'], causes: 'May be related to a fungus called malassezia, hormones, or an inflammatory response.', homeRemedies: ['Medicated shampoos containing ketoconazole, selenium sulfide, or zinc pyrithione.'], medicalRecommendation: 'A dermatologist can prescribe stronger shampoos, creams, or lotions.', disclaimer: defaultDisclaimer, },
  { slug: 'shingles', title: 'Shingles', icon: Bug, subtitle: 'Understanding shingles.', images: ['kb-rashes-1', 'kb-rashes-2', 'kb-rashes-3'], overview: 'A viral infection that causes a painful rash. It is caused by the varicella-zoster virus, the same virus that causes chickenpox.', symptoms: ['Pain, burning, numbness or tingling, followed by a red rash and fluid-filled blisters.'], causes: 'Reactivation of the chickenpox virus in people who have previously had it.', homeRemedies: ['Cool compresses and oatmeal baths can soothe skin.'], medicalRecommendation: 'Antiviral drugs can speed healing and reduce the risk of complications. See a doctor as soon as you suspect shingles.', disclaimer: defaultDisclaimer, },
  { slug: 'vitiligo', title: 'Vitiligo', icon: Layers, subtitle: 'Understanding vitiligo.', images: ['kb-vitiligo-1', 'kb-vitiligo-2', 'kb-vitiligo-3'], overview: 'A disease that causes the loss of skin color in blotches. The extent and rate of color loss from vitiligo are unpredictable.', symptoms: ['Patchy loss of skin color, which usually first appears on the hands, face, and areas around body openings.'], causes: 'It occurs when pigment-producing cells (melanocytes) die or stop producing melanin.', homeRemedies: ['Using sunscreen to protect the affected skin from the sun is crucial.'], medicalRecommendation: 'Treatments like light therapy and medications can help restore some skin tone, but results vary.', disclaimer: defaultDisclaimer, },
];
