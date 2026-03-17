export const cookieService = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    } catch (error) {
      console.error('Error reading cookie:', error);
      return null;
    }
  },

  set(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    
    try {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
      document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax; ${secure}`;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  },

  remove(name: string): void {
    if (typeof document === 'undefined') return;
    
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.error('Error removing cookie:', error);
    }
  },

  // Additional helper methods
  getAuthToken(): string | null {
    return this.get('accessToken');
  },

  setAuthToken(token: string, days: number = 7): void {
    this.set('accessToken', token, days);
  },

  clearAuthToken(): void {
    this.remove('accessToken');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
};