export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.0.2 (a4e00ff)";
  };
  public: {
    Tables: {
      strategy_operations: {
        Row: {
          id: string;
          action_id: string;
          requester_id: string;
          state: string;
          source: Json;
          apply_source: Json;
          result: Json | null;
          error_code: string | null;
          quota_reserved: boolean;
          write_attempts: number;
          lease_id: string | null;
          lease_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          action_id: string;
          requester_id: string;
          state: string;
          source: Json;
          apply_source: Json;
          result?: Json | null;
          error_code?: string | null;
          quota_reserved?: boolean;
          write_attempts?: number;
          lease_id?: string | null;
          lease_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          action_id?: string;
          requester_id?: string;
          state?: string;
          source?: Json;
          apply_source?: Json;
          result?: Json | null;
          error_code?: string | null;
          quota_reserved?: boolean;
          write_attempts?: number;
          lease_id?: string | null;
          lease_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "strategy_operations_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "actions";
            referencedColumns: ["id"];
          },
        ];
      };
      strategy_runtime: {
        Row: { singleton: boolean; last_worker_at: string | null };
        Insert: { singleton?: boolean; last_worker_at?: string | null };
        Update: { singleton?: boolean; last_worker_at?: string | null };
        Relationships: [];
      };
      ai_usage: {
        Row: { user_id: string; usage_day: string; attempts: number };
        Insert: { user_id: string; usage_day: string; attempts: number };
        Update: { user_id?: string; usage_day?: string; attempts?: number };
        Relationships: [];
      };
      ai_usage_metering: {
        Row: {
          singleton: boolean;
          started_at: string;
          reference_units: number;
          policy_version: string;
        };
        Insert: {
          singleton?: boolean;
          started_at?: string;
          reference_units?: number;
          policy_version?: string;
        };
        Update: {
          singleton?: boolean;
          started_at?: string;
          reference_units?: number;
          policy_version?: string;
        };
        Relationships: [];
      };
      ai_generation_logs: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          strategy_operation_id: string | null;
          intent: string;
          model: string;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          total_tokens: number | null;
          cached_tokens: number | null;
          units_consumed: number | null;
          policy_version: string;
          measurement_status: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          user_id: string;
          strategy_operation_id?: string | null;
          intent: string;
          model: string;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          cached_tokens?: number | null;
          units_consumed?: number | null;
          policy_version: string;
          measurement_status: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          strategy_operation_id?: string | null;
          intent?: string;
          model?: string;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          cached_tokens?: number | null;
          units_consumed?: number | null;
          policy_version?: string;
          measurement_status?: string;
        };
        Relationships: [];
      };
      action_comments: {
        Row: {
          action_id: string;
          author_id: string;
          author_name: string;
          content: string;
          created_at: string;
          id: string;
          is_internal: boolean | null;
          is_user: boolean;
          mentions: string[] | null;
        };
        Insert: {
          action_id: string;
          author_id: string;
          author_name: string;
          content: string;
          created_at?: string;
          id?: string;
          is_internal?: boolean | null;
          is_user?: boolean;
          mentions?: string[] | null;
        };
        Update: {
          action_id?: string;
          author_id?: string;
          author_name?: string;
          content?: string;
          created_at?: string;
          id?: string;
          is_internal?: boolean | null;
          is_user?: boolean;
          mentions?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "action_comments_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "actions";
            referencedColumns: ["id"];
          },
        ];
      };
      actions: {
        Row: {
          archived: boolean | null;
          category: string;
          color: string;
          content_description: string | null;
          content_files: string[] | null;
          created_at: string;
          date: string;
          description: string | null;
          id: string;
          instagram_caption: string | null;
          partners: string[];
          phase: string;
          priority: string;
          responsibles: string[];
          sprints: string[] | null;
          strategies: Json | null;
          time: number;
          title: string;
          updated_at: string;
          user_id: string;
          work_files: string[] | null;
        };
        Insert: {
          archived?: boolean | null;
          category: string;
          color?: string;
          content_description?: string | null;
          content_files?: string[] | null;
          created_at: string;
          date: string;
          description?: string | null;
          id?: string;
          instagram_caption?: string | null;
          partners: string[];
          phase?: string;
          priority: string;
          responsibles: string[];
          sprints?: string[] | null;
          strategies?: Json | null;
          time?: number;
          title: string;
          updated_at: string;
          user_id?: string;
          work_files?: string[] | null;
        };
        Update: {
          archived?: boolean | null;
          category?: string;
          color?: string;
          content_description?: string | null;
          content_files?: string[] | null;
          created_at?: string;
          date?: string;
          description?: string | null;
          id?: string;
          instagram_caption?: string | null;
          partners?: string[];
          phase?: string;
          priority?: string;
          responsibles?: string[];
          sprints?: string[] | null;
          strategies?: Json | null;
          time?: number;
          title?: string;
          updated_at?: string;
          user_id?: string;
          work_files?: string[] | null;
        };
        Relationships: [];
      };
      celebrations: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          is_holiday: boolean;
          title: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          is_holiday?: boolean;
          title: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          is_holiday?: boolean;
          title?: string;
        };
        Relationships: [];
      };
      partner_holidays: {
        Row: {
          celebration_id: string;
          partner_id: string;
        };
        Insert: {
          celebration_id: string;
          partner_id: string;
        };
        Update: {
          celebration_id?: string;
          partner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_holidays_celebration_id_fkey";
            columns: ["celebration_id"];
            isOneToOne: false;
            referencedRelation: "celebrations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partner_holidays_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          active: boolean;
          created_at: string | null;
          email: string;
          id: string;
          image: string | null;
          name: string | null;
          partners: string[];
          password: string | null;
          password_hash: string | null;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          email: string;
          id?: string;
          image?: string | null;
          name?: string | null;
          partners: string[];
          password?: string | null;
          password_hash?: string | null;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          email?: string;
          id?: string;
          image?: string | null;
          name?: string | null;
          partners?: string[];
          password?: string | null;
          password_hash?: string | null;
        };
        Relationships: [];
      };
      dash_sessions: {
        Row: {
          client_id: string;
          created_at: string;
          expires_at: string;
          id: string;
          revoked_at: string | null;
          token_hash: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          revoked_at?: string | null;
          token_hash: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          revoked_at?: string | null;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dash_sessions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      review_links: {
        Row: {
          action_ids: string[];
          created_at: string;
          created_by: string;
          expires_at: string;
          id: string;
          partner_slug: string;
          revoked_at: string | null;
          token_hash: string;
        };
        Insert: {
          action_ids: string[];
          created_at?: string;
          created_by: string;
          expires_at: string;
          id?: string;
          partner_slug: string;
          revoked_at?: string | null;
          token_hash: string;
        };
        Update: {
          action_ids?: string[];
          created_at?: string;
          created_by?: string;
          expires_at?: string;
          id?: string;
          partner_slug?: string;
          revoked_at?: string | null;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_links_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          answers: Json | null;
          completed: boolean | null;
          created_at: string | null;
          id: string;
          main_need: string | null;
          name: string;
          updated_at: string | null;
          whatsapp: string;
        };
        Insert: {
          answers?: Json | null;
          completed?: boolean | null;
          created_at?: string | null;
          id?: string;
          main_need?: string | null;
          name: string;
          updated_at?: string | null;
          whatsapp: string;
        };
        Update: {
          answers?: Json | null;
          completed?: boolean | null;
          created_at?: string | null;
          id?: string;
          main_need?: string | null;
          name?: string;
          updated_at?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          action_id: string;
          action_title: string;
          author_name: string;
          comment_excerpt: string;
          comment_id: string | null;
          created_at: string;
          id: string;
          read_at: string | null;
          recipient_id: string;
          type: string;
        };
        Insert: {
          action_id: string;
          action_title?: string;
          author_name?: string;
          comment_excerpt?: string;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          recipient_id: string;
          type?: string;
        };
        Update: {
          action_id?: string;
          action_title?: string;
          author_name?: string;
          comment_excerpt?: string;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          recipient_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "actions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "action_comments";
            referencedColumns: ["id"];
          },
        ];
      };
      partners: {
        Row: {
          archived: boolean;
          colors: string[];
          context: string | null;
          created_at: string;
          id: string;
          image: string | null;
          instagram_caption_tail: string | null;
          short: string;
          slug: string;
          sow: Database["public"]["Enums"]["sow"];
          title: string;
          users_ids: string[];
          voice: string | null;
        };
        Insert: {
          archived?: boolean;
          colors: string[];
          context?: string | null;
          created_at?: string;
          id?: string;
          image?: string | null;
          instagram_caption_tail?: string | null;
          short: string;
          slug: string;
          sow?: Database["public"]["Enums"]["sow"];
          title: string;
          users_ids: string[];
          voice?: string | null;
        };
        Update: {
          archived?: boolean;
          colors?: string[];
          context?: string | null;
          created_at?: string;
          id?: string;
          image?: string | null;
          instagram_caption_tail?: string | null;
          short?: string;
          slug?: string;
          sow?: Database["public"]["Enums"]["sow"];
          title?: string;
          users_ids?: string[];
          voice?: string | null;
        };
        Relationships: [];
      };
      people: {
        Row: {
          admin: boolean;
          areas: string[];
          created_at: string;
          email: string | null;
          id: string;
          image: string | null;
          initials: string;
          name: string;
          preferences: Json | null;
          short: string;
          surname: string;
          user_id: string;
          visible: boolean;
        };
        Insert: {
          admin?: boolean;
          areas: string[];
          created_at?: string;
          email?: string | null;
          id?: string;
          image?: string | null;
          initials: string;
          name: string;
          preferences?: Json | null;
          short: string;
          surname: string;
          user_id: string;
          visible?: boolean;
        };
        Update: {
          admin?: boolean;
          areas?: string[];
          created_at?: string;
          email?: string | null;
          id?: string;
          image?: string | null;
          initials?: string;
          name?: string;
          preferences?: Json | null;
          short?: string;
          surname?: string;
          user_id?: string;
          visible?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      strategy_scope: {
        Args: { p_user_id: string; p_action_id: string };
        Returns: boolean;
      };
      strategy_source: {
        Args: { p_action_id: string; p_user_id: string };
        Returns: Json;
      };
      strategy_ready: { Args: Record<string, never>; Returns: boolean };
      strategy_public_operation: {
        Args: {
          p_operation: Database["public"]["Tables"]["strategy_operations"]["Row"];
        };
        Returns: Json;
      };
      accept_strategy_operation: {
        Args: {
          p_user_id: string;
          p_action_id: string;
          p_operation_id: string;
          p_expected_version: string;
        };
        Returns: Json;
      };
      read_strategy_operation: {
        Args: { p_user_id: string; p_action_id: string };
        Returns: Json;
      };
      claim_strategy_operation: {
        Args: { p_lease_id: string; p_limit: number };
        Returns: Json;
      };
      store_strategy_result: {
        Args: { p_operation_id: string; p_lease_id: string; p_result: Json };
        Returns: undefined;
      };
      finish_strategy_operation: {
        Args: { p_operation_id: string; p_lease_id: string };
        Returns: Json;
      };
      fail_strategy_operation: {
        Args: { p_operation_id: string; p_lease_id: string; p_code: string };
        Returns: undefined;
      };
      retry_strategy_result: {
        Args: {
          p_user_id: string;
          p_operation_id: string;
          p_expected_version: string;
          p_confirm_changed_source?: boolean;
        };
        Returns: Json;
      };
      can_notify_mention: {
        Args: {
          p_comment_id: string;
          p_action_id: string;
          p_recipient_id: string;
        };
        Returns: boolean;
      };
      update_my_preferences: { Args: { p_patch: Json }; Returns: Json };
      consume_ai_usage: {
        Args: { p_user_id: string; p_limit: number };
        Returns: boolean;
      };
      record_ai_generation: {
        Args: {
          p_event_id: string;
          p_intent: string;
          p_model: string;
          p_user_id?: string;
          p_operation_id?: string;
          p_lease_id?: string;
          p_prompt_tokens?: number | null;
          p_completion_tokens?: number | null;
          p_total_tokens?: number | null;
          p_cached_tokens?: number | null;
        };
        Returns: string;
      };
      reserve_ai_monthly: {
        Args: {
          p_user_id: string;
          p_id: string;
          p_input_bytes: number;
          p_output_limit: number;
        };
        Returns: boolean;
      };
      get_my_ai_allowance: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_agency_ai_usage: {
        Args: Record<string, never>;
        Returns: Json;
      };
      replace_partner_holidays: {
        Args: {
          p_partner_id: string;
          p_celebration_ids: string[];
        };
        Returns: string[];
      };
      admin_update_person: {
        Args: { p_user_id: string; p_changes: Json };
        Returns: undefined;
      };
      admin_update_client_account: {
        Args: {
          p_client_id: string;
          p_changes: Json;
          p_password_hash: string | null;
        };
        Returns: Json;
      };
      admin_update_client_password: {
        Args: {
          p_client_id: string;
          p_password_hash: string;
        };
        Returns: undefined;
      };
      admin_deactivate_client: {
        Args: {
          p_client_id: string;
        };
        Returns: undefined;
      };
      client_migrate_legacy_password: {
        Args: {
          p_client_id: string;
          p_legacy_hash: string;
          p_new_hash: string;
        };
        Returns: number;
      };
      get_app_bootstrap: { Args: { p_user_id: string }; Returns: Json };
      get_home_actions: {
        Args: {
          p_end_date: string;
          p_partner_slugs?: string[];
          p_start_date: string;
          p_today_end: string;
          p_user_id: string;
        };
        Returns: {
          archived: boolean | null;
          category: string;
          color: string;
          content_description: string | null;
          content_files: string[] | null;
          created_at: string;
          date: string;
          description: string | null;
          id: string;
          instagram_caption: string | null;
          partners: string[];
          phase: string;
          priority: string;
          responsibles: string[];
          sprints: string[] | null;
          strategies: Json | null;
          time: number;
          title: string;
          updated_at: string;
          user_id: string;
          work_files: string[] | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "actions";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      sow: "marketing" | "socialmedia" | "demand";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      sow: ["marketing", "socialmedia", "demand"],
    },
  },
} as const;
