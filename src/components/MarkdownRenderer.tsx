import { cn } from "@/lib/utils";
import { ComponentProps, Children, isValidElement } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const headingBase = "font-semibold tracking-tight text-foreground";
const styles = {
  h1: "text-2xl md:text-3xl mt-6 mb-3",
  h2: "text-xl md:text-2xl mt-6 mb-3",
  h3: "text-lg md:text-xl mt-5 mb-2",
  h4: "text-base md:text-lg mt-4 mb-2",
  p: "leading-relaxed mt-3",
  ul: "list-disc ml-6 my-3 space-y-1",
  ol: "list-decimal ml-6 my-3 space-y-1",
  codeInline:
    "rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono border border-border/60",
  // Enhanced highlight for block code: subtle gradient + accent tint + shadow
  pre: [
    "relative rounded-md p-4 overflow-x-auto text-sm leading-relaxed border",
    "border-border/60 shadow-sm font-medium",
    // Background layering: base muted + accent tint for better pop in both themes
    "bg-muted/70 dark:bg-muted/60",
    "before:absolute before:inset-0 before:-z-10 before:rounded-md",
    // Soft radial highlight in the corner
    "before:bg-[radial-gradient(circle_at_15%_20%,hsl(var(--accent)/0.35),transparent_70%)]",
  ].join(" "),
  blockquote:
    "border-l-4 pl-4 italic text-muted-foreground my-4 border-border/70",
  hr: "my-8 border-border/60",
};

export function MarkdownRenderer({
  className,
  ...props
}: { className?: string } & ComponentProps<typeof Markdown>) {
  // Explicitly type the components map so TS knows about the optional `inline` prop on code.
  const components: Components = {
    h1: ({ ...p }) => <h1 className={cn(headingBase, styles.h1)} {...p} />,
    h2: ({ ...p }) => <h2 className={cn(headingBase, styles.h2)} {...p} />,
    h3: ({ ...p }) => <h3 className={cn(headingBase, styles.h3)} {...p} />,
    h4: ({ ...p }) => <h4 className={cn(headingBase, styles.h4)} {...p} />,
    p: ({ children, ...p }) => {
      // If a paragraph contains a block element like <pre>, replace <p> with a <div>
      const hasBlock = Children.toArray(children).some(
        (child) =>
          isValidElement(child) &&
          (child.type === "pre" ||
            (typeof child.type === "string" &&
              ["pre", "table"].includes(child.type)))
      );
      const Component = hasBlock ? "div" : "p";
      return (
        <Component className={styles.p} {...p}>
          {children}
        </Component>
      );
    },
    ul: ({ ...p }) => <ul className={styles.ul} {...p} />,
    ol: ({ ...p }) => <ol className={styles.ol} {...p} />,
    // Handle inline code only here. Block code is wrapped by <pre> which we style separately.
    code: (codeProps) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { inline, className, children, ...rest } = codeProps as any;
      if (!inline) {
        // Let the parent <pre> handle block styling; just render <code>
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      }
      return (
        <code className={cn(styles.codeInline, className)} {...rest}>
          {children}
        </code>
      );
    },
    pre: ({ children, className, ...p }) => (
      <pre className={cn(styles.pre, className)} {...p}>
        {children}
      </pre>
    ),
    blockquote: ({ ...p }) => (
      <blockquote className={styles.blockquote} {...p} />
    ),
    hr: ({ ...p }) => <hr className={styles.hr} {...p} />,
  };
  return (
    <div className={cn("max-w-none font-sans text-sm md:text-base", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={components}
        {...props}
      />
    </div>
  );
}
