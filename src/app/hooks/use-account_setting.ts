import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function useOrgSettingsPath() {
  const [path, setPath] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found or error:", userError);
        setPath("/account-settings/user");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData) {
        console.error("Role fetch error:", roleError?.message);
        setPath("/account-settings/user");
        return;
      }

      console.log(roleData.role);
      const role = roleData.role ?? "individual";

      setPath(role === "organization" ? "/account-settings/admin" : "/account-settings/user");
    };

    fetchRole();
  }, []);

  return path;
}
