'use server';
/**
 * @fileOverview An AI-powered chatbot to assist patients with providing symptom inputs.
 *
 * - assistWithSymptomInputs - A function that handles the symptom input assistance process.
 * - AssistWithSymptomInputsInput - The input type for the assistWithSymptomInputs function.
 * - AssistWithSymptomInputsOutput - The return type for the assistWithSymptomInputs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistWithSymptomInputsInputSchema = z.object({
  symptomQuery: z
    .string()
    .describe("The patient's query regarding their symptoms. Can be text or audio transcription."),
});
export type AssistWithSymptomInputsInput = z.infer<typeof AssistWithSymptomInputsInputSchema>;

const AssistWithSymptomInputsOutputSchema = z.object({
  refinedSymptoms: z.string().describe('A refined and comprehensive list of symptoms based on the user query.'),
  suggestedQuestions: z.array(z.string()).describe('A list of suggested questions to further clarify the patient’s condition.'),
});
export type AssistWithSymptomInputsOutput = z.infer<typeof AssistWithSymptomInputsOutputSchema>;

export async function assistWithSymptomInputs(input: AssistWithSymptomInputsInput): Promise<AssistWithSymptomInputsOutput> {
  return assistWithSymptomInputsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistWithSymptomInputsPrompt',
  input: {schema: AssistWithSymptomInputsInputSchema},
  output: {schema: AssistWithSymptomInputsOutputSchema},
  prompt: `You are an AI-powered chatbot assisting patients with describing their symptoms.

  Based on the patient's input, refine the symptoms into a comprehensive list and suggest further questions to better understand their condition.

  Patient Input: {{{symptomQuery}}}

  Refined Symptoms:
  {{#each refinedSymptoms}}- {{{this}}}
  {{/each}}

  Suggested Questions:
  {{#each suggestedQuestions}}- {{{this}}}
  {{/each}}`,
});

const assistWithSymptomInputsFlow = ai.defineFlow(
  {
    name: 'assistWithSymptomInputsFlow',
    inputSchema: AssistWithSymptomInputsInputSchema,
    outputSchema: AssistWithSymptomInputsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
