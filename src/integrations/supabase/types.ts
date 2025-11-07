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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      basket_items: {
        Row: {
          added_at: string
          brand: string | null
          category: string | null
          id: string
          image: string | null
          item_id: string
          item_number: string | null
          name: string
          price: number | null
          shop_url: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          brand?: string | null
          category?: string | null
          id?: string
          image?: string | null
          item_id: string
          item_number?: string | null
          name: string
          price?: number | null
          shop_url?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          brand?: string | null
          category?: string | null
          id?: string
          image?: string | null
          item_id?: string
          item_number?: string | null
          name?: string
          price?: number | null
          shop_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clothing_items: {
        Row: {
          attributes: Json | null
          brand: string | null
          category: string | null
          created_at: string
          id: string
          original_image_url: string
          processed_image_url: string | null
          product_name: string | null
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          original_image_url: string
          processed_image_url?: string | null
          product_name?: string | null
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          original_image_url?: string
          processed_image_url?: string | null
          product_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      outfits: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          occasion: string
          outfit_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: Json
          occasion: string
          outfit_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          occasion?: string
          outfit_number?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          generated_attributes: string | null
          id: string
          image_path: string | null
          image_processed: string | null
          metadata: Json | null
          original_id: string | null
          price: number | null
          product_id: string
          product_name: string
          shop_link: string | null
          style: string | null
          updated_at: string | null
          wildberries_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          generated_attributes?: string | null
          id?: string
          image_path?: string | null
          image_processed?: string | null
          metadata?: Json | null
          original_id?: string | null
          price?: number | null
          product_id: string
          product_name: string
          shop_link?: string | null
          style?: string | null
          updated_at?: string | null
          wildberries_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          generated_attributes?: string | null
          id?: string
          image_path?: string | null
          image_processed?: string | null
          metadata?: Json | null
          original_id?: string | null
          price?: number | null
          product_id?: string
          product_name?: string
          shop_link?: string | null
          style?: string | null
          updated_at?: string | null
          wildberries_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          photo_url: string | null
          telegram_id: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          photo_url?: string | null
          telegram_id?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          photo_url?: string | null
          telegram_id?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_outfits: {
        Row: {
          id: string
          items: Json
          occasion: string | null
          outfit_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          items: Json
          occasion?: string | null
          outfit_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          items?: Json
          occasion?: string | null
          outfit_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trythis_outfits: {
        Row: {
          created_at: string
          id: string
          items: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_action_logs: {
        Row: {
          action_type: string
          anonymous_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          anonymous_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          anonymous_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_outfit_views: {
        Row: {
          anonymous_id: string | null
          id: string
          outfit_id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          anonymous_id?: string | null
          id?: string
          outfit_id: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          anonymous_id?: string | null
          id?: string
          outfit_id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_outfit_views_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
