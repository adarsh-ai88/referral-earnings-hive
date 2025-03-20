
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
    const adminPassword = "password123"; // Changed to a simpler password
    const adminName = "Admin User";

    // Try to create user with the service role client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName }
    });

    if (authError) {
      // If user already exists, try to update their password
      if (authError.message.includes("User already registered")) {
        // Find the user
        const { data: userData } = await supabase.auth.admin.listUsers();
        const adminUser = userData?.users?.find(user => user.email === adminEmail);
        
        if (adminUser) {
          // Update the user's password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            { password: adminPassword, email_confirm: true }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          // Ensure the admin flag is set properly
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_admin: true, name: adminName })
            .eq('id', adminUser.id);
            
          if (profileError) {
            throw profileError;
          }
          
          return new Response(
            JSON.stringify({
              message: "Admin user password updated successfully",
              adminEmail,
              adminPassword
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
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
          adminPassword: "password123" // Return the simpler password
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
