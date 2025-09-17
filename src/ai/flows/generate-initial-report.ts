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
  potentialConditions: z.array(z.object({
    name: z.string().describe('The name of the potential skin condition.'),
    likelihood: z.enum(['High', 'Medium', 'Low']).describe('The likelihood of this condition.'),
    description: z.string().describe('A brief description of the condition.'),
  })).describe('An array of potential skin conditions identified from the image and symptoms.'),
  report: z.string().describe('A summary of the analysis and findings.'),
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
  prompt: `You are an AI medical assistant specializing in dermatology. Your task is to analyze a patient's skin condition based on an image and provided information.

  Patient Information:
  - Age: {{{age}}}
  - Gender: {{{gender}}}
  - Region: {{{region}}}
  - Skin Tone: {{{skinTone}}}
  - Described Symptoms: {{{symptomInputs}}}

  Image of the skin condition: {{media url=photoDataUri}}

  Instructions:
  1.  Carefully analyze the image and the patient's data.
  2.  Identify a list of potential skin conditions. For each condition, provide its name, likelihood (High, Medium, or Low), and a brief description.
  3.  Generate a comprehensive summary 'report' of your findings.
  4.  Suggest relevant 'homeRemedies'. If none are appropriate, state "No specific home remedies are recommended. Please consult a healthcare professional."
  5.  Provide a 'medicalRecommendation' for next steps.
  6.  Set 'doctorConsultationSuggestion' to true if you recommend professional medical consultation, otherwise false.

  You must provide a structured JSON output.
  `,
});

const generateInitialReportFlow = ai.defineFlow(
  {
    name: 'generateInitialReportFlow',
    inputSchema: GenerateInitialReportInputSchema,
    outputSchema: GenerateInitialReportOutputSchema,
    model: 'googleai/gemini-2.5-pro',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
