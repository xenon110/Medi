
import { config } from 'dotenv';
config();

import '@/ai/schemas/report-schema.ts';
import '@/ai/flows/generate-initial-report.ts';
import '@/ai/flows/validate-image-upload.ts';
import '@/ai/flows/assist-with-symptom-inputs.ts';
import '@/ai/flows/translate-report.ts';
import '@/ai/flows/symptom-chat.ts';
