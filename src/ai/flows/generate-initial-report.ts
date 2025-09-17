'use server';

/**
 * @fileOverview Generates an initial medical report based on a skin image and symptom inputs.
 *
 * - generateInitialReport - A function that generates the report.
 * - GenerateInitialReportInput - The input type for the generateInitialReport function.
 * - GenerateInitialReportOutput - The return type for the generateInitialReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialReportInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  symptomInputs: z.string().describe('Additional symptoms described by the patient.'),
  region: z.string().describe('The region of the patient.'),
  skinTone: z.string().describe('The skin tone of the patient.'),
  age: z.number().describe('The age of the patient.'),
  gender: z.string().describe('The gender of the patient.'),
});
export type GenerateInitialReportInput = z.infer<typeof GenerateInitialReportInputSchema>;

const GenerateInitialReportOutputSchema = z.object({
  report: z.string().describe('The generated medical report.'),
  homeRemedies: z.string().describe('Applicable home remedies, if any.'),
  medicalRecommendation: z.string().describe('General medical advice or dermatologist recommendation.'),
  doctorConsultationSuggestion: z.boolean().describe('Whether a doctor consultation is suggested.'),
});
export type GenerateInitialReportOutput = z.infer<typeof GenerateInitialReportOutputSchema>;

export async function generateInitialReport(
  input: GenerateInitialReportInput
): Promise<GenerateInitialReportOutput> {
  return generateInitialReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialReportPrompt',
  input: {schema: GenerateInitialReportInputSchema},
  output: {schema: GenerateInitialReportOutputSchema},
  prompt: `You are an AI assistant that generates initial medical reports based on a patient's skin condition image and symptom inputs.

  The patient is from the following region: {{{region}}}.
  The patient has the following skin tone: {{{skinTone}}}.
  The patient is the following age: {{{age}}}.
  The patient is the following gender: {{{gender}}}.

  Analyze the image and consider the following symptoms:
  {{symptomInputs}}

  Based on the analysis, generate a report covering potential issues, home remedies (if applicable; otherwise, state "No home remedy available for this condition."), general medical recommendations, and whether a doctor consultation is suggested.

  Image: {{media url=photoDataUri}}

  Format the output as a JSON object with the following keys:
  - report: The generated medical report.
  - homeRemedies: Applicable home remedies, if any.
  - medicalRecommendation: General medical advice or dermatologist recommendation.
  - doctorConsultationSuggestion: Whether a doctor consultation is suggested (true/false).

  Make sure the output is a valid JSON object.
  `,
});

const generateInitialReportFlow = ai.defineFlow(
  {
    name: 'generateInitialReportFlow',
    inputSchema: GenerateInitialReportInputSchema,
    outputSchema: GenerateInitialReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
