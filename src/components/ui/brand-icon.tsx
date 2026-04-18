import { cn } from "@/utils/style";

type Props = React.ComponentProps<"img"> & {
  variant?: "logo" | "icon";
};

export function BrandIcon({ variant = "logo", className, ...props }: Props) {
  return (
    <>
      <img
        src={`/${variant}/dark.ico`}
        alt="Reactive Resume"
        className={cn("hidden size-12 dark:block", className)}
        {...props}
      />
      <img
        src={`/${variant}/light.ico`}
        alt="Reactive Resume"
        className={cn("block size-12 dark:hidden", className)}
        {...props}
      />
    </>
  );
}
