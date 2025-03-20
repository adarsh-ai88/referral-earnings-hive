
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    const adminEmail = "admin@example.com";
    const adminPassword = "admin@example.com";
    const adminName = "Admin User";

    // Create user with the service role client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName }
    });

    if (authError) {
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error("Failed to create admin user");
    }

    // Update the profile to set is_admin flag
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', authData.user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        message: "Admin user created successfully",
        adminEmail,
        adminPassword
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    
    // Check if error is about user existing already
    if (error.message && error.message.includes("User already registered")) {
      return new Response(
        JSON.stringify({ 
          message: "Admin user already exists", 
          adminEmail: "admin@example.com",
          adminPassword: "admin@example.com"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
