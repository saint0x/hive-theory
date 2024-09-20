import React from 'react';
import axios from 'axios';

const GoogleSignInButton = () => {
  const handleSignIn = async () => {
    try {
      // Get the Google Auth URL
      const { data: { url } } = await axios.get('/api/auth/google/url');

      // Open the Google Sign-In popup
      const popup = window.open(url, 'Google Sign-In', 'width=500,height=600');

      // Listen for the callback
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
          const { code } = event.data;

          // Exchange the code for tokens
          const { data } = await axios.post('/api/auth/google/callback', { code });

          if (data.success) {
            // Store the JWT in local storage
            localStorage.setItem('token', data.token);
            // TODO: Update your app state to reflect that the user is signed in
            console.log('Sign-in successful');
          } else {
            console.error('Sign-in failed');
          }

          popup?.close();
        }
      });
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
    }
  };

  return (
    <button onClick={handleSignIn}>Sign in with Google</button>
  );
};

export default GoogleSignInButton;