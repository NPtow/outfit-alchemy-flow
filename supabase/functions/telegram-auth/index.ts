import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramData } = await req.json();
    
    console.log('Telegram auth attempt:', telegramData);

    // Verify Telegram data
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Check if this is Mini App (initData) or Login Widget format
    let userData;
    
    if (telegramData.initData) {
      // Telegram Mini App validation
      console.log('Validating Mini App data');
      
      const initData = telegramData.initData;
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        throw new Error('No hash in initData');
      }
      
      // Remove hash from params for validation
      urlParams.delete('hash');
      
      // Sort params and create data check string
      const params = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      console.log('Data check string:', params);
      
      // Create secret key from bot token
      const encoder = new TextEncoder();
      const secretKeyBuffer = await crypto.subtle.digest(
        'SHA-256',
        encoder.encode(botToken)
      );
      
      // Import key for HMAC
      const key = await crypto.subtle.importKey(
        'raw',
        secretKeyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      // Sign the data check string
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(params)
      );
      
      // Convert to hex
      const calculatedHash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log('Calculated hash:', calculatedHash);
      console.log('Received hash:', hash);
      
      if (calculatedHash !== hash) {
        console.error('Hash mismatch - invalid Telegram data');
        return new Response(
          JSON.stringify({ error: 'Invalid authentication data' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check auth_date
      const authDate = parseInt(urlParams.get('auth_date') || '0');
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - authDate > 86400) {
        console.error('Telegram data too old');
        return new Response(
          JSON.stringify({ error: 'Authentication data expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userData = telegramData.user;
    } else {
      // Login Widget validation (existing code)
      console.log('Validating Login Widget data');
      
      const checkHash = telegramData.hash;
      const dataCheckObject = { ...telegramData };
      delete dataCheckObject.hash;
      
      const dataCheckArr = Object.keys(dataCheckObject)
        .sort()
        .map(key => `${key}=${dataCheckObject[key]}`);
      const dataCheckString = dataCheckArr.join('\n');

      const encoder = new TextEncoder();
      const secretKeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(botToken));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        secretKeyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(dataCheckString)
      );

      const hash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (hash !== checkHash) {
        console.error('Invalid Telegram data hash');
        return new Response(
          JSON.stringify({ error: 'Invalid authentication data' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authDate = parseInt(telegramData.auth_date);
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - authDate > 86400) {
        console.error('Telegram data too old');
        return new Response(
          JSON.stringify({ error: 'Authentication data expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userData = telegramData;
    }

    console.log('Telegram data validated successfully');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or get user by telegram_id
    const email = `telegram_${userData.id}@telegram.user`;
    
    // Try to sign in first
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password: userData.id.toString(),
    });

    let userId: string;
    let session = signInResult.data.session;

    // If user doesn't exist, create them
    if (signInResult.error) {
      console.log('Creating new user for Telegram ID:', userData.id);
      
      const createResult = await supabase.auth.admin.createUser({
        email,
        password: userData.id.toString(),
        email_confirm: true,
        user_metadata: {
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
        },
      });

      if (createResult.error || !createResult.data.user) {
        console.error('Failed to create user:', createResult.error);
        throw createResult.error || new Error('Failed to create user');
      }

      userId = createResult.data.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          telegram_id: parseInt(userData.id),
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
      }

      // Sign in the new user to get session
      const newSignIn = await supabase.auth.signInWithPassword({
        email,
        password: userData.id.toString(),
      });

      if (newSignIn.error || !newSignIn.data.session) {
        throw new Error('Failed to sign in after user creation');
      }

      session = newSignIn.data.session;
    } else {
      userId = signInResult.data.user!.id;
    }

    console.log('Telegram auth successful for:', userData.username);

    return new Response(
      JSON.stringify({
        session: session,
        user: { id: userId }
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
