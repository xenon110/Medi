
import { KNOWLEDGE_BASE, KnowledgeBaseArticle } from '@/lib/kb-content';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, FlaskConical, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export async function generateStaticParams() {
  const paths = KNOWLEDGE_BASE.map((article) => ({
    category: article.slug,
  }));
  return paths;
}

type KnowledgePageProps = {
  params: {
    category: string;
  };
};

export default function KnowledgePage({ params }: KnowledgePageProps) {
  const article: KnowledgeBaseArticle | undefined = KNOWLEDGE_BASE.find(
    (item) => item.slug === params.category
  );

  if (!article) {
    notFound();
  }

  const image1 = placeholderImages.find(img => img.id === article.images[0]);
  const image2 = placeholderImages.find(img => img.id === article.images[1]);
  const image3 = placeholderImages.find(img => img.id === article.images[2]);

  const currentIndex = KNOWLEDGE_BASE.findIndex(a => a.slug === params.category);
  const nextArticle = KNOWLEDGE_BASE[currentIndex + 1];
  const previousArticle = KNOWLEDGE_BASE[currentIndex - 1];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative h-60 md:h-80 w-full flex items-center justify-center text-white text-center p-4 overflow-hidden -mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="mx-auto bg-white/10 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-4 border-2 border-white/20 shadow-lg">
            <article.icon className="w-12 h-12" />
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">{article.title}</h1>
          <p className="mt-2 text-lg md:text-xl max-w-2xl text-white/80">
            {article.subtitle}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-12 md:py-16">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[image1, image2, image3].map((img, index) => (
                img && <div key={index} className="relative h-60 rounded-lg overflow-hidden shadow-2xl group">
                     <Image
                        src={img.imageUrl}
                        alt={img.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint={img.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
            ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-headline flex items-center gap-3"><FileText className="text-accent"/>Overview</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none text-foreground/80">
                <p>{article.overview}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-headline flex items-center gap-3"><CheckCircle className="text-accent"/>Common Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside text-foreground/80">
                  {article.symptoms.map((symptom, i) => <li key={i}>{symptom}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-headline flex items-center gap-3"><FlaskConical className="text-accent"/>Causes & Risk Factors</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none text-foreground/80">
                 <p>{article.causes}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg border-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Medical Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90">{article.medicalRecommendation}</p>
              </CardContent>
              <CardContent>
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-[0_0_20px_hsl(var(--accent))] transition-all duration-300">
                    <Link href="/patient/dashboard"><Stethoscope className="mr-2"/>Consult a Doctor</Link>
                  </Button>
              </CardContent>
            </Card>

             <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Home Remedies</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-foreground/80">
                        {article.homeRemedies.map((remedy, i) => <li key={i}>{remedy}</li>)}
                    </ul>
                </CardContent>
            </Card>
            
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive-foreground/80">
                <AlertTitle className="text-destructive-foreground/90 font-bold">Disclaimer</AlertTitle>
                <AlertDescription className="text-destructive-foreground/80">
                    {article.disclaimer}
                </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="outline" asChild>
                <Link href="/"><ArrowLeft className="mr-2"/>Back to Categories</Link>
            </Button>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/patient/consult"><Stethoscope className="mr-2"/>Consult a Doctor</Link>
            </Button>
             {nextArticle ? (
              <Button variant="outline" asChild>
                  <Link href={`/kb/${nextArticle.slug}`}>Next: {nextArticle.title} <ArrowRight className="ml-2"/></Link>
              </Button>
            ) : previousArticle ? (
               <Button variant="outline" asChild>
                  <Link href={`/kb/${previousArticle.slug}`}>Prev: {previousArticle.title} <ArrowLeft className="mr-2"/></Link>
              </Button>
            ) : null}
        </div>
      </div>
    </div>
  );
}
