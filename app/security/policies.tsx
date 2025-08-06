'use client';

import { useState } from 'react';
import RedirectConfirmationModal from './RedirectConfirmationModal';

export function useRedirectWithConfirmation() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const requestRedirect = (url: string) => {
    setRedirectUrl(url);
  };

  const cancel = () => setRedirectUrl(null);

  const confirm = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      setRedirectUrl(null);
    }
  };

  const modal = redirectUrl ? (
    <RedirectConfirmationModal url={redirectUrl} onCancel={cancel} onOpen={confirm} />
  ) : null;

  return { requestRedirect, modal };
}


/**
 * 
 * Account Lockout
 * WAF
 * Injection Image
 * Input Validation
 * File Uploads
 * Forced Browsing
 * Directory Traversal
 * 
 */
