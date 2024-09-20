import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const { code } = router.query;
    if (code && typeof code === 'string') {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_SIGN_IN_SUCCESS', code },
          window.location.origin
        );
        window.close();
      } else {
        // Handle the case when the window is not opened as a popup
        router.push('/');  // Redirect to home page or dashboard
      }
    }
  }, [router]);

  return <div>Processing Google Sign-In...</div>;
}