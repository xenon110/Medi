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
  isValid: z.boolean().describe('Whether the uploaded image is a clear, close-up photograph of a human skin condition.'),
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
  prompt: `You are an AI assistant that validates image uploads for a skin-health application. Your task is to determine if an image is a clear, close-up photograph of a human skin condition.

  Analyze the provided image: {{media url=photoDataUri}}

  Criteria for a valid image:
  - The image must clearly show human skin.
  - The image should be a close-up of a specific area.
  - The image must not be of a generic object, animal, landscape, or anything other than human skin.

  Respond with a JSON object.
  - If the image meets the criteria, set 'isValid' to true.
  - If the image does not meet the criteria, set 'isValid' to false and provide a concise 'reason' (e.g., "The image does not appear to show human skin," or "The image is too blurry to analyze.").
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
