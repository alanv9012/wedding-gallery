export type PhotoRow = {
  id: string;
  event_slug: string;
  file_key: string;
  url: string;
  approved: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      photos: {
        Row: PhotoRow;
        Insert: {
          id?: string;
          event_slug: string;
          file_key: string;
          url: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_slug?: string;
          file_key?: string;
          url?: string;
          approved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
