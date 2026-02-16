/**
 * Supabase client configuration
 * Used for storing push notification tokens
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Register a push notification token
 */
export async function registerPushToken(token: string) {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          token,
          platform: 'expo',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'token',
        }
      );

    if (error) {
      console.error('Error registering push token:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to register push token:', error);
    return false;
  }
}

/**
 * Unregister a push notification token
 */
export async function unregisterPushToken(token: string) {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .update({ active: false })
      .eq('token', token);

    if (error) {
      console.error('Error unregistering push token:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to unregister push token:', error);
    return false;
  }
}
