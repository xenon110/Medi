'use server';
/**
 * @fileOverview A conversational AI chatbot for discussing symptoms.
 *
 * - symptomChat - A function that handles the conversational chat about symptoms.
 * - SymptomChatInput - The input type for the symptomChat function.
 * - SymptomChatOutput - The return type for the symptomChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomChatInputSchema = z.object({
  message: z.string().describe("The user's message about their symptoms."),
});
export type SymptomChatInput = z.infer<typeof SymptomChatInputSchema>;

const SymptomChatOutputSchema = z.object({
  response: z.string().describe("The AI's conversational response."),
});
export type SymptomChatOutput = z.infer<typeof SymptomChatOutputSchema>;

export async function symptomChat(input: SymptomChatInput): Promise<SymptomChatOutput> {
  return symptomChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomChatPrompt',
  input: {schema: SymptomChatInputSchema},
  output: {schema: SymptomChatOutputSchema},
  prompt: `You are a friendly and empathetic AI medical assistant chatbot. Your role is to have a conversation with a user about their symptoms.

  - Be conversational and reassuring.
  - You can ask clarifying questions.
  - You MUST NOT provide a diagnosis or medical advice.
  - You can provide general information about symptoms.
  - Gently guide the user to use the main tool (uploading an image and describing symptoms) for a proper analysis if they seem ready.
  - Keep your responses concise and easy to understand.

  User's message: {{{message}}}
  `,
});

const symptomChatFlow = ai.defineFlow(
  {
    name: 'symptomChatFlow',
    inputSchema: SymptomChatInputSchema,
    outputSchema: SymptomChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
