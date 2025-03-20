export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      commission_levels: {
        Row: {
          amount: number
          created_at: string | null
          level: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          level: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          level?: number
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          created_at: string | null
          from_user_id: string
          id: string
          level: number
          paid_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_user_id: string
          id?: string
          level: number
          paid_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_user_id?: string
          id?: string
          level?: number
          paid_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string | null
          expires_at: string
          is_active: boolean | null
          key: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          is_active?: boolean | null
          key: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          is_active?: boolean | null
          key?: string
        }
        Relationships: []
      }
      referral_tree: {
        Row: {
          created_at: string | null
          id: string
          level: number
          referrer_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: number
          referrer_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          referrer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_tree_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_tree_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_signals: {
        Row: {
          asset: string
          created_at: string | null
          direction: string
          entry_time: string
          id: string
          is_active: boolean | null
          result: string | null
          visible_to_users: boolean | null
        }
        Insert: {
          asset: string
          created_at?: string | null
          direction: string
          entry_time: string
          id?: string
          is_active?: boolean | null
          result?: string | null
          visible_to_users?: boolean | null
        }
        Update: {
          asset?: string
          created_at?: string | null
          direction?: string
          entry_time?: string
          id?: string
          is_active?: boolean | null
          result?: string | null
          visible_to_users?: boolean | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          expires_at: string | null
          id: string
          phone_number: string | null
          referral_code: string | null
          subscription_price: number | null
          total_earnings: number | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          expires_at?: string | null
          id?: string
          phone_number?: string | null
          referral_code?: string | null
          subscription_price?: number | null
          total_earnings?: number | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          phone_number?: string | null
          referral_code?: string | null
          subscription_price?: number | null
          total_earnings?: number | null
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
