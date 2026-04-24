type SupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type R2Env = {
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicBaseUrl: string;
};

type AdminEnv = {
  adminSecret: string;
};

let cachedSupabaseEnv: SupabaseEnv | null = null;
let cachedR2Env: R2Env | null = null;
let cachedAdminEnv: AdminEnv | null = null;

function getRequiredValue(value: string | undefined, name: string, scope: "public" | "server"): string {
  if (!value) {
    throw new Error(
      `Missing required ${scope} environment variable: ${name}. Set it in your environment before starting the app.`,
    );
  }

  return value;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getSupabaseEnv(): SupabaseEnv {
  if (cachedSupabaseEnv) {
    return cachedSupabaseEnv;
  }

  cachedSupabaseEnv = {
    supabaseUrl: getRequiredValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL", "public"),
    supabaseAnonKey: getRequiredValue(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "public",
    ),
  };

  return cachedSupabaseEnv;
}

export function getR2Env(): R2Env {
  if (typeof window !== "undefined") {
    throw new Error("getR2Env() can only be called on the server.");
  }

  if (cachedR2Env) {
    return cachedR2Env;
  }

  cachedR2Env = {
    r2AccountId: getRequiredValue(process.env.R2_ACCOUNT_ID, "R2_ACCOUNT_ID", "server"),
    r2AccessKeyId: getRequiredValue(process.env.R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID", "server"),
    r2SecretAccessKey: getRequiredValue(process.env.R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY", "server"),
    r2BucketName: getRequiredValue(process.env.R2_BUCKET_NAME, "R2_BUCKET_NAME", "server"),
    r2PublicBaseUrl: normalizeBaseUrl(
      getRequiredValue(process.env.R2_PUBLIC_BASE_URL, "R2_PUBLIC_BASE_URL", "server"),
    ),
  };

  return cachedR2Env;
}

export function getAdminEnv(): AdminEnv {
  if (typeof window !== "undefined") {
    throw new Error("getAdminEnv() can only be called on the server.");
  }

  if (cachedAdminEnv) {
    return cachedAdminEnv;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("ADMIN_SECRET loaded:", Boolean(process.env.ADMIN_SECRET));
  }

  cachedAdminEnv = {
    adminSecret: getRequiredValue(process.env.ADMIN_SECRET, "ADMIN_SECRET", "server"),
  };

  return cachedAdminEnv;
}
