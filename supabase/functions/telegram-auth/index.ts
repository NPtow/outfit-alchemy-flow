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
    
    console.log('Telegram auth attempt:', { 
      id: telegramData.id, 
      username: telegramData.username 
    });

    // Verify Telegram data
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Create check string
    const checkHash = telegramData.hash;
    const dataCheckObject = { ...telegramData };
    delete dataCheckObject.hash;
    
    const dataCheckArr = Object.keys(dataCheckObject)
      .sort()
      .map(key => `${key}=${dataCheckObject[key]}`);
    const dataCheckString = dataCheckArr.join('\n');

    // Create hash using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(botToken);
    const secretKeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode('WebAppData'));
    
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

    // Convert to hex
    const hash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Verify hash
    if (hash !== checkHash) {
      console.error('Invalid Telegram data hash');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication data' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check auth_date (data shouldn't be older than 24 hours)
    const authDate = parseInt(telegramData.auth_date);
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      console.error('Telegram data too old');
      return new Response(
        JSON.stringify({ error: 'Authentication data expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create or get user by telegram_id
    const email = `telegram_${telegramData.id}@telegram.user`;
    
    // Try to sign in first
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password: telegramData.id.toString(),
    });

    let userId: string;
    let session = signInResult.data.session;

    // If user doesn't exist, create them
    if (signInResult.error) {
      console.log('Creating new user for Telegram ID:', telegramData.id);
      
      const createResult = await supabase.auth.admin.createUser({
        email,
        password: telegramData.id.toString(),
        email_confirm: true,
        user_metadata: {
          telegram_id: telegramData.id,
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          username: telegramData.username,
          photo_url: telegramData.photo_url,
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
          telegram_id: parseInt(telegramData.id),
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          username: telegramData.username,
          photo_url: telegramData.photo_url,
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
      }

      // Sign in the new user to get session
      const newSignIn = await supabase.auth.signInWithPassword({
        email,
        password: telegramData.id.toString(),
      });

      if (newSignIn.error || !newSignIn.data.session) {
        throw new Error('Failed to sign in after user creation');
      }

      session = newSignIn.data.session;
    } else {
      userId = signInResult.data.user!.id;
    }

    console.log('Telegram auth successful for:', telegramData.username);

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