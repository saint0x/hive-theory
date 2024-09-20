export async function checkGoogleConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/google/check-connection');
      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error('Error checking Google connection:', error);
      return false;
    }
  }