interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    googleId?: string;
  };
}

class AuthService {
  private user: AuthResponse['user'] | null = null;

  async initializeGoogleAuth(): Promise<void> {
    // Load Google Sign-In script
    if (!window.google) {
      await this.loadGoogleScript();
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-signin-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
      document.head.appendChild(script);
    });
  }

  private async handleCredentialResponse(response: any) {
    try {
      // Decode the JWT token to get user info
      const token = response.credential;
      const payload = this.parseJwt(token);
      
      const googleUser: GoogleUser = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Send to backend for authentication
      const authResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          user: googleUser,
        }),
        credentials: 'include',
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const { user } = await authResponse.json();
      this.user = user;
      
      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { user, isAuthenticated: true }
      }));

    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  async signInWithGoogle(): Promise<void> {
    await this.initializeGoogleAuth();
    
    // Trigger the Google Sign-In flow
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to renderButton if prompt is not shown
        this.renderSignInButton();
      }
    });
  }

  renderSignInButton(elementId: string = 'google-signin-button'): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    if (this.user) {
      return this.user;
    }

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const { user } = await response.json();
        this.user = user;
        return user;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }

    return null;
  }

  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.user = null;
      window.google?.accounts.id.disableAutoSelect();
      
      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { user: null, isAuthenticated: false }
      }));
    }
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  getUser(): AuthResponse['user'] | null {
    return this.user;
  }
}

export const authService = new AuthService();

import { useState, useEffect } from "react";

// React hook for auth state
export function useAuth() {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const handleAuthStateChange = (event: CustomEvent) => {
      setUser(event.detail.user);
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange as EventListener);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: authService.signInWithGoogle.bind(authService),
    signOut: authService.signOut.bind(authService),
  };
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}
