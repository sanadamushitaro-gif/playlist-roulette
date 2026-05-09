export type Playlist = {
  id: string;
  playlist_id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  is_hidden: boolean | null;
};

export type Report = {
  id: string;
  playlist_id: string | null;
  reason: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      playlists: {
        Row: Playlist;
        Insert: {
          id?: string;
          playlist_id: string;
          url: string;
          title?: string | null;
          description?: string | null;
          tags?: string[] | null;
          created_at?: string;
          is_hidden?: boolean | null;
        };
        Update: Partial<Playlist>;
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: {
          id?: string;
          playlist_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Report>;
        Relationships: [
          {
            foreignKeyName: "reports_playlist_id_fkey";
            columns: ["playlist_id"];
            isOneToOne: false;
            referencedRelation: "playlists";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
