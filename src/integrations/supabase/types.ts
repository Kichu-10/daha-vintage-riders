export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          capacity: number | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          guests: string | null
          id: string
          is_paid: boolean
          organizer: string | null
          poster_url: string | null
          price: number | null
          prize: string | null
          rules: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          guests?: string | null
          id?: string
          is_paid?: boolean
          organizer?: string | null
          poster_url?: string | null
          price?: number | null
          prize?: string | null
          rules?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          guests?: string | null
          id?: string
          is_paid?: boolean
          organizer?: string | null
          poster_url?: string | null
          price?: number | null
          prize?: string | null
          rules?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string | null
          id: string
          image_url: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          address: string | null
          admin_notes: string | null
          amount: number | null
          bike_model: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          payment_method: string | null
          payment_proof_url: string | null
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["membership_status"]
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          amount?: number | null
          bike_model?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          amount?: number | null
          bike_model?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean
          published_at: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          published_at?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          joined_at: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id: string
          joined_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          joined_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          category: string | null
          created_at: string
          email: string
          event_id: string
          id: string
          name: string
          notes: string | null
          participants: number | null
          payment_method: string | null
          payment_proof_url: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          school_college: string | null
          team_name: string | null
          ticket_code: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          email: string
          event_id: string
          id?: string
          name: string
          notes?: string | null
          participants?: number | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          school_college?: string | null
          team_name?: string | null
          ticket_code?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          participants?: number | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          school_college?: string | null
          team_name?: string | null
          ticket_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number | null
          tier: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number | null
          tier?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          tier?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
      event_status: "draft" | "upcoming" | "ongoing" | "past" | "cancelled"
      event_type:
        | "ride"
        | "meeting"
        | "tour"
        | "workshop"
        | "social"
        | "race"
        | "other"
      membership_status: "pending" | "approved" | "rejected"
      payment_status: "not_required" | "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "member"],
      event_status: ["draft", "upcoming", "ongoing", "past", "cancelled"],
      event_type: [
        "ride",
        "meeting",
        "tour",
        "workshop",
        "social",
        "race",
        "other",
      ],
      membership_status: ["pending", "approved", "rejected"],
      payment_status: ["not_required", "pending", "verified", "rejected"],
    },
  },
} as const
