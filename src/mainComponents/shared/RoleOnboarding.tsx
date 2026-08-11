import { useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, CircleHelp, X } from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/redux-store/slices/authSlice";
import { Button } from "@/components/ui/button";

type OnboardingStep = {
  title: string;
  description: string;
  selector: string;
};

const roleSteps: Record<string, OnboardingStep[]> = {
  "Branch-Admin": [
    { title: "Branch control centre", description: "Use this dashboard to monitor customers, stock, value-added services, and branch performance.", selector: "[data-onboarding='dashboard-navigation']" },
    { title: "Manage branch operations", description: "These cards open the tools for customer onboarding, inventory, VAS, and your branch team.", selector: "[data-onboarding='dashboard-features']" },
    { title: "Your account", description: "Open your profile to review the branch assigned to you and keep your account details current.", selector: "[data-onboarding='dashboard-profile']" },
  ],
  "Service-Admin": [
    { title: "Service operations", description: "This dashboard is your starting point for bookings, job cards, service records, and customer follow-up.", selector: "[data-onboarding='dashboard-navigation']" },
    { title: "Daily service work", description: "Use these actions to process booking requests, create job cards, upload service records, and review customer activity.", selector: "[data-onboarding='dashboard-features']" },
    { title: "Your service profile", description: "Your profile shows the dealership branch and account details attached to your service-admin access.", selector: "[data-onboarding='dashboard-profile']" },
  ],
  "Part-Admin": [
    { title: "Parts control centre", description: "Track parts activity, stock levels, upload records, and counter-sale reports from here.", selector: "[data-onboarding='dashboard-navigation']" },
    { title: "Parts inventory tools", description: "These cards take you to stock uploads, parts records, counter-sale reporting, and customer information.", selector: "[data-onboarding='dashboard-features']" },
    { title: "Your parts profile", description: "Use your profile to confirm the branch and account that your parts access belongs to.", selector: "[data-onboarding='dashboard-profile']" },
  ],
  Staff: [
    { title: "Your work dashboard", description: "This is your role-specific home for quotations, leave applications, and Scanfleet sticker sales.", selector: "[data-onboarding='dashboard-navigation']" },
    { title: "Complete daily tasks", description: "Use these cards to create customer quotations, submit leave, and record sticker sales.", selector: "[data-onboarding='dashboard-features']" },
    { title: "Your staff profile", description: "Open your profile to review the dealership branch and details linked to your staff account.", selector: "[data-onboarding='dashboard-profile']" },
  ],
  "Super-Admin": [
    { title: "Platform overview", description: "Use this dashboard to oversee branches, administrators, and dealership-wide activity.", selector: "[data-onboarding='dashboard-navigation']" },
  ],
};

const getTooltipPosition = (selector: string): CSSProperties => {
  const target = document.querySelector(selector);
  if (!target) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const rect = target.getBoundingClientRect();
  const top = Math.min(Math.max(rect.bottom + 16, 16), window.innerHeight - 260);
  const left = Math.min(Math.max(rect.left, 16), window.innerWidth - 336);
  return { top, left };
};

/**
 * Role-aware onboarding overlay. Add this once to a role dashboard and mark
 * its guided elements with data-onboarding attributes from the step config.
 */
const RoleOnboarding = () => {
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const role = user?.role;
  const steps = role ? roleSteps[role] : undefined;
  const storageKey = role ? `tsangpool-onboarding:${role}:complete` : "";
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [position, setPosition] = useState<CSSProperties>({});

  useEffect(() => {
    if (!isAuthenticated || !steps?.length) return;
    setIsOpen(localStorage.getItem(storageKey) !== "true");
    setStepIndex(0);
  }, [isAuthenticated, storageKey, steps?.length]);

  useEffect(() => {
    if (!isOpen || !steps?.[stepIndex]) return;
    const updatePosition = () => setPosition(getTooltipPosition(steps[stepIndex].selector));
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, stepIndex, steps]);

  if (!isAuthenticated || !role || !steps?.length) return null;

  const complete = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  const start = () => {
    setStepIndex(0);
    setIsOpen(true);
  };

  const activeStep = steps[stepIndex];

  return (
    <>
      {!isOpen && (
        <Button type='button' size='icon' onClick={start} aria-label='Start dashboard guide' className='fixed bottom-5 right-5 z-40 h-11 w-11 rounded-full bg-red-600 shadow-lg hover:bg-red-700'>
          <CircleHelp className='h-5 w-5' />
        </Button>
      )}

      {isOpen && (
        <div className='fixed inset-0 z-50' aria-live='polite'>
          <div className='absolute inset-0 bg-zinc-950/45' />
          <section style={position} className='absolute z-10 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-zinc-950 p-5 text-white shadow-2xl'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.18em] text-red-400'>Guide · {stepIndex + 1} of {steps.length}</p>
                <h2 className='mt-2 text-lg font-bold'>{activeStep.title}</h2>
              </div>
              <button type='button' onClick={complete} aria-label='Close onboarding' className='rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white'>
                <X className='h-5 w-5' />
              </button>
            </div>
            <p className='mt-3 text-sm leading-6 text-zinc-300'>{activeStep.description}</p>
            <div className='mt-5 flex items-center justify-between gap-3'>
              <Button type='button' variant='ghost' size='sm' disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)} className='text-zinc-300 hover:bg-white/10 hover:text-white'>
                <ChevronLeft className='mr-1 h-4 w-4' /> Back
              </Button>
              {stepIndex === steps.length - 1 ? (
                <Button type='button' size='sm' onClick={complete} className='bg-red-600 hover:bg-red-700'>Finish</Button>
              ) : (
                <Button type='button' size='sm' onClick={() => setStepIndex((index) => index + 1)} className='bg-red-600 hover:bg-red-700'>Next <ChevronRight className='ml-1 h-4 w-4' /></Button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default RoleOnboarding;
