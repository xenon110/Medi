
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const faqs = [
    {
        question: "How accurate is the AI analysis?",
        answer: "Our AI model is trained on a vast dataset of dermatological images to provide a highly accurate preliminary analysis. However, it is not a substitute for a professional medical diagnosis. Always consult a qualified dermatologist for a definitive diagnosis."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take your privacy and security very seriously. All data, including images and personal information, is encrypted both in transit and at rest. We comply with industry-standard security practices to protect your information."
    },
    {
        question: "How does the doctor consultation work?",
        answer: "After you receive your AI report, you have the option to share it with a licensed dermatologist on our platform. The doctor will review your report, the AI's findings, and your images to provide their expert opinion and recommendations. You will be notified when the doctor responds."
    },
    {
        question: "What kind of pictures should I upload?",
        answer: "For the best results, please upload a clear, well-lit, close-up photo of the skin area in question. Avoid blurry images, poor lighting, or photos taken from too far away."
    }
]

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                 <CardDescription>
                    Find answers to common questions about MediScan AI.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                 <CardDescription>
                    Can't find an answer? Reach out to our support team.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
               <p className="mb-4">For any issues or inquiries, please email us at:</p>
               <a href="mailto:support@mediscan.ai" className="text-primary font-semibold hover:underline">
                support@mediscan.ai
               </a>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
