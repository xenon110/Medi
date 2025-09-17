'use server';

/**
 * @fileOverview A flow to validate image uploads and reject non-skin-related images.
 *
 * - validateImageUpload - A function that validates the image upload.
 * - ValidateImageUploadInput - The input type for the validateImageUpload function.
 * - ValidateImageUploadOutput - The return type for the validateImageUpload function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateImageUploadInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ValidateImageUploadInput = z.infer<typeof ValidateImageUploadInputSchema>;

const ValidateImageUploadOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the uploaded image is skin-related or not.'),
  reason: z.string().optional().describe('The reason why the image is not valid, if applicable.'),
});
export type ValidateImageUploadOutput = z.infer<typeof ValidateImageUploadOutputSchema>;

export async function validateImageUpload(input: ValidateImageUploadInput): Promise<ValidateImageUploadOutput> {
  return validateImageUploadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateImageUploadPrompt',
  input: {schema: ValidateImageUploadInputSchema},
  output: {schema: ValidateImageUploadOutputSchema},
  prompt: `You are an AI assistant that validates if an uploaded image is related to skin or not.

  Analyze the image and determine if it is a skin-related image.

  Photo: {{media url=photoDataUri}}

  Respond with JSON object.
  If the image is skin-related, set isValid to true.
  If the image is not skin-related, set isValid to false and provide a reason in the reason field.
  `,
});

const validateImageUploadFlow = ai.defineFlow(
  {
    name: 'validateImageUploadFlow',
    inputSchema: ValidateImageUploadInputSchema,
    outputSchema: ValidateImageUploadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
