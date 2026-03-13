import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent } from "@/components/ui/card";
import { heroLeadFormSchema, type HeroLeadFormSchema } from "@/lib/validationSchemas";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function HeroLeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HeroLeadFormSchema>({
    resolver: zodResolver(heroLeadFormSchema),
    defaultValues: { name: "", mobile: "", email: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: HeroLeadFormSchema) => {
    setIsSubmitting(true);
    try {
      const mobileNorm = values.mobile.replace(/\D/g, "").replace(/^91/, "").slice(-10);
      const res = await fetch(`${API_BASE}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          mobile: mobileNorm,
          email: values.email.trim().toLowerCase(),
        }),
      });
      const contentType = res.headers.get("content-type");
      let data: { error?: string } = {};
      if (contentType?.includes("application/json")) {
        data = await res.json().catch(() => ({}));
      } else {
        const text = await res.text().catch(() => "");
        if (text) data = { error: text.slice(0, 200) };
      }
      if (!res.ok) {
        const backendError = (data as { error?: string }).error;
        const msg =
          backendError ||
          (res.status === 502 || res.status === 503 || res.status === 0
            ? "Server unavailable. Please try again later."
            : `Request failed (${res.status}). Please try again.`);
        toast.error(msg);
        return;
      }
      toast.success("Our team will contact you. Thank you!");
      form.reset();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      const isNetwork = /fetch|network|failed|refused|load/i.test(message);
      toast.error(isNetwork ? "Could not reach server. Start the backend with: npm run server" : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md min-w-0 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div className="bg-primary/10 px-3 sm:px-4 py-2 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          Already registered?
        </Link>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-5">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
            <Send className="h-5 w-5 shrink-0 text-primary" />
            Apply Now
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Start your journey with Dream Ahead.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" autoComplete="name" {...field} />
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
                  <FormLabel>WhatsApp Mobile Number *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter 10-digit mobile number" autoComplete="tel" {...field} />
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
