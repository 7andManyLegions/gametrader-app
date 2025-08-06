import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/firebase';

let idleTimer: NodeJS.Timeout;
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetIdleTimer(callback: () => void) {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(callback, IDLE_TIMEOUT);
}

export function useIdleLogout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => {
      if (auth.currentUser) {
        toast('You were logged out due to inactivity');
        router.push('/logged-out');
      }
    };

    resetIdleTimer(handleLogout);
    const reset = () => resetIdleTimer(handleLogout);
    const events = ['mousemove', 'keydown', 'click'];

    events.forEach(e => window.addEventListener(e, reset));

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(idleTimer);
    };
  }, []);
}

// import { useIdleLogout } from '@/hooks/useIdleLogout';

// export default function SomePage() {
//   useIdleLogout();

//   return <div>...</div>;
// }
