import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FingerprintIcon, GithubLogoIcon, GoogleLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { RouterOutput } from "@/integrations/orpc/client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/integrations/auth/client";
import { orpc } from "@/integrations/orpc/client";

export function SocialAuth() {
  const { data: providers = {}, isLoading } = useQuery(orpc.auth.providers.list.queryOptions());

  return (
    <>
      <div className="flex items-center gap-x-2">
        <hr className="flex-1" />
        <span className="text-xs font-medium tracking-wide">
          <Trans context="Choose to authenticate with a social provider (Google, GitHub, etc.) instead of email and password">
            or continue with
          </Trans>
        </span>
        <hr className="flex-1" />
      </div>

      {isLoading ? <SocialAuthSkeleton /> : <SocialAuthButtons providers={providers} />}
    </>
  );
}

function SocialAuthSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

type SocialAuthButtonsProps = {
  providers: RouterOutput["auth"]["providers"]["list"];
};

function SocialAuthButtons({ providers }: SocialAuthButtonsProps) {
  const router = useRouter();
  const hasStartedConditionalPasskeyRef = useRef(false);

  const handleSocialLogin = async (provider: string) => {
    const toastId = toast.loading(t`Signing in...`);

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message, { id: toastId });
      return;
    }

    toast.dismiss(toastId);
    await router.invalidate();
  };

  const handlePasskeyLogin = async () => {
    const toastId = toast.loading(t`Signing in...`);

    const { error } = await authClient.signIn.passkey({ autoFill: false });

    if (error) {
      toast.error(error.message, { id: toastId });
      return;
    }

    toast.dismiss(toastId);
    await router.invalidate();
  };

  useEffect(() => {
    if (!("passkey" in providers)) return;
    if (typeof window === "undefined") return;
    if (!("PublicKeyCredential" in window)) return;
    if (!PublicKeyCredential.isConditionalMediationAvailable) return;
    if (hasStartedConditionalPasskeyRef.current) return;

    hasStartedConditionalPasskeyRef.current = true;

    void PublicKeyCredential.isConditionalMediationAvailable().then(async (isAvailable) => {
      if (!isAvailable) return;

      const { error } = await authClient.signIn.passkey({ autoFill: true });
      if (error) return;

      await router.invalidate();
    });
  }, [providers, router]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="secondary"
        onClick={handlePasskeyLogin}
        disabled={!("passkey" in providers)}
        className="inline-flex w-full bg-zinc-800 text-white hover:bg-zinc-800/90 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-200/90"
      >
        <FingerprintIcon />
        Passkey
      </Button>

      <Button
        onClick={() => handleSocialLogin("google")}
        disabled={!("google" in providers)}
        className="inline-flex w-full bg-[#4285F4] text-white hover:bg-[#4285F4]/80"
      >
        <GoogleLogoIcon />
        Google
      </Button>

      <Button
        onClick={() => handleSocialLogin("github")}
        disabled={!("github" in providers)}
        className="inline-flex w-full bg-[#2b3137] text-white hover:bg-[#2b3137]/80"
      >
        <GithubLogoIcon />
        GitHub
      </Button>

      <Button
        onClick={() => handleSocialLogin("linkedin")}
        disabled={!("linkedin" in providers)}
        className="inline-flex w-full bg-[#0A66C2] text-white hover:bg-[#0A66C2]/80"
      >
        <LinkedinLogoIcon />
        LinkedIn
      </Button>
    </div>
  );
}
