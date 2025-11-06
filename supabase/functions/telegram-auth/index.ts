import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate Telegram Mini App initData
async function validateTelegramWebAppData(initData: string, botToken: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    
    // Parse initData as URLSearchParams
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      console.error('No hash found in initData');
      return false;
    }
    
    // Remove hash from params
    params.delete('hash');
    
    // Create data-check-string: sorted key=value pairs joined with \n
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    console.log('Data check string:', dataCheckString);
    
    // Create secret key: HMAC-SHA256(bot_token, "WebAppData")
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(botToken),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const secretKeyData = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode('WebAppData')
    );
    
    // Import the secret key for signing data
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Sign the data-check-string
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataCheckString)
    );
    
    // Convert signature to hex
    const calculatedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Calculated hash:', calculatedHash);
    console.log('Received hash:', hash);
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    
    if (!initData) {
      return new Response(
        JSON.stringify({ error: 'No initData provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Received initData');

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Validate initData
    const isValid = await validateTelegramWebAppData(initData, botToken);
    
    if (!isValid) {
      console.error('Invalid Telegram data');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication data' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse user data from initData
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    const authDate = params.get('auth_date');
    
    if (!userStr) {
      throw new Error('No user data in initData');
    }
    
    // Check auth_date (should be within 24 hours)
    if (authDate) {
      const authTimestamp = parseInt(authDate);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp - authTimestamp > 86400) {
        return new Response(
          JSON.stringify({ error: 'Authentication data expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const userData = JSON.parse(decodeURIComponent(userStr));
    console.log('User authenticated:', userData.id, userData.username);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or get user
    const email = `telegram_${userData.id}@telegram.user`;
    const password = `tg_${userData.id}_${botToken.slice(0, 10)}`;
    
    // Try to sign in
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If user doesn't exist, create them
    if (signInError) {
      console.log('Creating new user:', userData.id);
      
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          language_code: userData.language_code,
        },
      });

      if (createError) {
        console.error('Failed to create user:', createError);
        throw createError;
      }

      // Try to create profile if table exists
      try {
        await supabase.from('profiles').insert({
          user_id: createData.user.id,
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
        });
      } catch (profileError) {
        console.log('Note: Could not create profile (table may not exist)');
      }

      // Sign in the new user
      const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (newSignInError || !newSignInData.session) {
        throw new Error('Failed to sign in after user creation');
      }

      signInData = newSignInData;
    }

    if (!signInData?.session) {
      throw new Error('No session created');
    }

    console.log('Authentication successful');

    return new Response(
      JSON.stringify({
        session: signInData.session,
        user: signInData.user,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Telegram auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
