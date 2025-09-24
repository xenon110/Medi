
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
  prompt: `You are a friendly and natural AI assistant. Talk with me like we are having a normal conversation. Keep the tone casual, simple, and easy to understand. Ask follow-up questions when needed, show interest in what I say, and don’t sound robotic. Respond in short, human-like sentences instead of long formal paragraphs. If I ask something technical, explain it clearly but still in a conversational way, like a friend would.

  **CRITICAL SAFETY INSTRUCTION:** If the user asks for medicine names or treatment suggestions, you MUST first include the following disclaimer in your response: "As an AI, I can't give medical advice. It's very important to consult with a qualified doctor or pharmacist before taking any medication. They can give you a proper diagnosis and prescription." After providing this disclaimer, you may then mention some common, relevant over-the-counter or prescription options as examples, but always reiterate that a doctor's advice is necessary.

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
