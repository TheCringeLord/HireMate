"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { experienceLevels, JobInfoTable } from "@/drizzle/schema/jobInfo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobInfoSchema } from "../schemas";
import { formatExperienceLevel } from "../lib/formatters";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useMemo } from "react";
import { createJobInfo, updateJobInfo } from "../actions";
import { toast } from "sonner";

type JobInfoFormData = z.infer<typeof jobInfoSchema>;

export function JobInfoForm({
  jobInfo,
}: {
  jobInfo?: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "name" | "title" | "description" | "experienceLevel"
  >;
}) {
  const isEditing = Boolean(jobInfo?.id);

  const form = useForm<JobInfoFormData>({
    resolver: zodResolver(jobInfoSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: jobInfo ?? {
      name: "",
      title: null,
      description: "",
      experienceLevel: "junior",
    },
  });


  const submitLabel = useMemo(
    () =>
      form.formState.isSubmitting
        ? isEditing
          ? "Saving changes…"
          : "Creating…"
        : isEditing
        ? "Save changes"
        : "Save Job Information",
    [form.formState.isSubmitting, isEditing]
  );

  async function onSubmit(values: JobInfoFormData) {
    const action = isEditing
      ? updateJobInfo.bind(null, jobInfo!.id)
      : createJobInfo;
    const res = await action(values);
    if (res?.error) {
      toast.error(res.message || "Something went wrong");
      return;
    }
    toast.success(isEditing ? "Job updated" : "Job created");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {isEditing ? "Edit job" : "Create a job"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Provide clear, specific details to improve interview quality.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          noValidate
        >
          {/* Name (required) */}
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Name{" "}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="job-name"
                    autoComplete="off"
                    aria-invalid={!!fieldState.error}
                    aria-describedby="job-name-desc"
                  />
                </FormControl>
                <FormDescription id="job-name-desc">
                  Shown in pickers and lists across the app.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Two-column row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Title (optional) */}
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Job title (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="job-title"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      aria-invalid={!!fieldState.error}
                      aria-describedby="job-title-desc"
                    />
                  </FormControl>
                  <FormDescription id="job-title-desc">
                    Fill only if applying for a specific title (e.g. “Frontend
                    Engineer”).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience level (required) */}
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Experience level{" "}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        id="experience-level"
                        aria-invalid={!!fieldState.error}
                        aria-describedby="experience-level-desc"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {formatExperienceLevel(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription id="experience-level-desc">
                    Used to tailor question difficulty.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description with counter */}
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      {...field}
                      id="job-desc"
                      placeholder="e.g., Full-stack role with Next.js 15, React 19, Drizzle ORM, and Postgres. Includes system design and API integration."
                      
                      rows={6}
                      aria-invalid={!!fieldState.error}
                      aria-describedby="job-desc-desc job-desc-count"
                    />
                    
                  </div>
                </FormControl>
                <FormDescription id="job-desc-desc">
                  Include tech stack, responsibilities, and any must-have
                  skills.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button
              disabled={
                form.formState.isSubmitting ||
                !form.formState.isDirty ||
                !form.formState.isValid
              }
              type="submit"
              className="w-full "
            >
              <LoadingSwap isLoading={form.formState.isSubmitting}>
                {submitLabel}
              </LoadingSwap>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
