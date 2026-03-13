import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { leadFormSchema, type LeadFormSchema } from "@/lib/validationSchemas";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Send } from "lucide-react";

const LeadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { name: "", email: "", mobile: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: LeadFormSchema) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          mobile: values.mobile.replace(/\D/g, "").replace(/^91/, "").slice(-10),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { error?: string }).error || "Something went wrong. Please try again.");
        return;
      }
      toast.success((data as { message?: string }).message || "Thank you! We'll be in touch soon.");
      form.reset();
    } catch (e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
            <CardDescription>
              Share your details and we'll add you to our list. Your information will be sent to our team via Neodove CRM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="10-digit mobile number" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
            </form>
            </Form>
            <p className="mt-4 text-sm text-center text-muted-foreground">
              <Link to="/" className="text-primary underline underline-offset-2">Back to home</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LeadForm;
