"use client";
import { useState } from "react";
import { Plus, Loader2, Globe } from "lucide-react";
import { Button, Input, Label, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars"),
  websiteUrl: z.string().url("Enter a valid URL starting with https://"),
  description: z.string().optional(),
  engine: z.enum(["AUTO", "CHEERIO", "FIRECRAWL"]),
});
type Form = z.infer<typeof schema>;

export function NewProjectDialog({ size = "default" }: { size?: "sm" | "default" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { engine: "AUTO" },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Failed"); }
      const project = await res.json();
      toast.success("Project created! Scraping started…");
      setOpen(false);
      reset();
      router.push(`/dashboard/projects/${project.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)} className="gradient-brand text-white border-0 hover:opacity-90 gap-2">
        <Plus className="h-4 w-4" /> New Project
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-indigo-500" />New Scraper Project</DialogTitle>
            <DialogDescription>Enter a URL. We&apos;ll scrape it and generate REST APIs automatically.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Project Name</Label>
              <Input placeholder="e.g. Amazon Product Prices" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input placeholder="https://example.com" {...register("websiteUrl")} />
              {errors.websiteUrl && <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Engine</Label>
              <Select defaultValue="AUTO" onValueChange={(v) => setValue("engine", v as Form["engine"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">🤖 Auto (Recommended)</SelectItem>
                  <SelectItem value="CHEERIO">⚡ Cheerio — Fast & free</SelectItem>
                  <SelectItem value="FIRECRAWL">🔥 Firecrawl — JS-heavy sites (API key needed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea placeholder="What data are you extracting?" rows={2} {...register("description")} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 gradient-brand text-white border-0 hover:opacity-90">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</> : "Create & Scrape"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
