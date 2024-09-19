export interface GoogleAuthResult {
    access_token: string;
    error?: string;
  }
  
  export interface GooglePickerDocument {
    id: string;
    name: string;
  }
  
  export interface GooglePickerResponse {
    action: string;
    docs: GooglePickerDocument[];
  }
  
  export interface GoogleUser {
    getBasicProfile: () => {
      getId: () => string;
      getName: () => string;
      getEmail: () => string;
      getImageUrl: () => string;
    };
  }
  
  export interface GoogleAuth {
    isSignedIn: {
      get: () => boolean;
      listen: (callback: (isSignedIn: boolean) => void) => void;
    };
    currentUser: {
      get: () => GoogleUser;
    };
    signIn: () => Promise<GoogleUser>;
    signOut: () => Promise<void>;
  }
  
  export interface GooglePickerBuilder {
    addView: (view: string) => GooglePickerBuilder;
    setOAuthToken: (token: string) => GooglePickerBuilder;
    setDeveloperKey: (key: string) => GooglePickerBuilder;
    setCallback: (callback: (data: GooglePickerResponse) => void) => GooglePickerBuilder;
    build: () => GooglePicker;
  }
  
  export interface GooglePicker {
    setVisible: (visible: boolean) => void;
  }
  
  declare global {
    interface Window {
      gapi: {
        load: (api: string, callback: () => void) => void;
        auth: {
          authorize: (
            params: {
              client_id: string;
              scope: string;
              immediate: boolean;
            },
            callback: (authResult: GoogleAuthResult) => void
          ) => void;
        };
        auth2: {
          init: (params: { client_id: string; scope: string }) => Promise<void>;
          getAuthInstance: () => GoogleAuth;
        };
      };
      google: {
        picker: {
          PickerBuilder: new () => GooglePickerBuilder;
          ViewId: {
            SPREADSHEETS: string;
            PRESENTATIONS: string;
          };
          Action: {
            PICKED: string;
          };
        };
      };
    }
  }