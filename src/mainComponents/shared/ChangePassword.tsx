import { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useChangeMyPasswordMutation } from "@/redux-store/services/adminApi";

/** Mirrors the `minlength: 6` on every role schema's password field. */
const MIN_PASSWORD_LENGTH = 6;

const EMPTY = {
  currentPassword: "",
  securityCode: "",
  newPassword: "",
  confirmPassword: "",
};

type Field = keyof typeof EMPTY;

/**
 * Password field with its own show/hide toggle. Each field tracks visibility
 * independently so revealing the security code doesn't also expose the
 * password typed above it.
 */
function SecretInput({
  id,
  label,
  hint,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>{label}</Label>
      <div className='relative'>
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='pr-10'
        />
        <button
          type='button'
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className='absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground'
        >
          {visible ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
        </button>
      </div>
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  );
}

/**
 * Shared change-password form, used by every role area via `ProfileView`.
 * Submits to `PATCH /api/users/me/password`, which always acts on the
 * authenticated user's own account — there is no way to target someone else.
 *
 * Three inputs are required: the current password, the shared security code,
 * and the new password (typed twice). The backend re-validates all of it; the
 * checks here only exist to save a round-trip.
 */
export default function ChangePassword({
  onChanged,
  onCancel,
}: {
  onChanged?: () => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [changePassword, { isLoading }] = useChangeMyPasswordMutation();

  const set = (key: Field, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { currentPassword, securityCode, newPassword, confirmPassword } = form;

    if (!currentPassword || !securityCode || !newPassword) {
      toast.error("Please fill in every field");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current one");
      return;
    }

    try {
      await changePassword({
        currentPassword,
        securityCode: securityCode.trim(),
        newPassword,
      }).unwrap();
      toast.success("Password updated");
      setForm(EMPTY);
      onChanged?.();
    } catch (err) {
      // RTK Query surfaces the server's JSON body under `data`.
      const message = (err as { data?: { message?: string } })?.data?.message;
      toast.error(message || "Failed to update password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <SecretInput
        id='currentPassword'
        label='Current Password'
        value={form.currentPassword}
        onChange={(v) => set("currentPassword", v)}
        autoComplete='current-password'
        placeholder='The password you log in with today'
      />

      <SecretInput
        id='securityCode'
        label='Security Code'
        hint='The authorisation code issued by your administrator.'
        value={form.securityCode}
        onChange={(v) => set("securityCode", v)}
        autoComplete='off'
        placeholder='Authorisation code'
      />

      <div className='h-px bg-border' />

      <SecretInput
        id='newPassword'
        label='New Password'
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        value={form.newPassword}
        onChange={(v) => set("newPassword", v)}
        autoComplete='new-password'
        placeholder='Choose a new password'
      />

      <SecretInput
        id='confirmPassword'
        label='Confirm New Password'
        value={form.confirmPassword}
        onChange={(v) => set("confirmPassword", v)}
        autoComplete='new-password'
        placeholder='Re-type the new password'
      />

      <div className='flex items-start gap-2 rounded-md bg-muted/60 p-3'>
        <ShieldCheck className='w-4 h-4 mt-0.5 shrink-0 text-muted-foreground' />
        <p className='text-xs text-muted-foreground'>
          You will stay signed in on this device. Use the new password the next
          time you log in.
        </p>
      </div>

      <div className='flex justify-end gap-2 pt-1'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type='submit' disabled={isLoading} className='gap-2'>
          {isLoading ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <KeyRound className='w-4 h-4' />
          )}
          Update Password
        </Button>
      </div>
    </form>
  );
}
