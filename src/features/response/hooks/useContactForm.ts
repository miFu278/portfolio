import { useCallback, useState } from 'react';
import { sendContactMessage } from '../../../lib/emailjs';
import type { Mission } from '../../../types';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

interface FormState {
  name: string;
  email: string;
  message: string;
}

const EMPTY: FormState = { name: '', email: '', message: '' };

export const useContactForm = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [mission, setMission] = useState<Mission | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const setField = useCallback(
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    [],
  );

  const pickMission = useCallback((m: Mission) => {
    setMission((prev) => (prev?.id === m.id ? null : m));
    setForm((prev) => ({
      ...prev,
      message: m.opener ? (prev.message.trim() ? prev.message : m.opener) : prev.message,
    }));
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (status === 'sending') return;

      setStatus('sending');
      try {
        await sendContactMessage({
          ...form,
          subject: mission?.subject ?? 'Portfolio enquiry',
        });
        setStatus('sent');
        setForm(EMPTY);
      } catch {
        setStatus('failed');
      }
    },
    [form, mission, status],
  );

  return { form, mission, status, setField, pickMission, submit };
};
