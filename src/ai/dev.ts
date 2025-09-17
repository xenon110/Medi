import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-report.ts';
import '@/ai/flows/validate-image-upload.ts';
import '@/ai/flows/assist-with-symptom-inputs.ts';