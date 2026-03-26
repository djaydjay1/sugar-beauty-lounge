export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type AppointmentStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "annual" | "sick" | "unpaid" | "public_holiday";
export type BookingSource = "website" | "whatsapp" | "phone" | "walk_in" | "instagram";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "stripe";

export interface Database {
  public: {
    Tables: {
      // --- SERVICES ---
      service_categories: {
        Row: {
          id: string;
          name: string;
          name_ar: string | null;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["service_categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["service_categories"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          name_ar: string | null;
          description: string | null;
          duration_minutes: number;
          price: number;
          price_from: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };

      // --- LOCATIONS ---
      locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string | null;
          open_time: string;
          close_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };

      // --- CLIENTS / CRM ---
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          nationality: string | null;
          language_preference: "en" | "ar";
          notes: string | null;
          referral_source: string | null;
          loyalty_points: number;
          total_spent: number;
          visit_count: number;
          last_visit_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      client_preferences: {
        Row: {
          id: string;
          client_id: string;
          service_id: string | null;
          staff_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["client_preferences"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["client_preferences"]["Insert"]>;
      };

      // --- STAFF ---
      staff: {
        Row: {
          id: string;
          name: string;
          role: string;
          phone: string | null;
          email: string | null;
          nationality: string | null;
          emirates_id: string | null;
          visa_expiry: string | null;
          passport_expiry: string | null;
          hire_date: string;
          base_salary: number;
          commission_rate: number;
          location_id: string | null;
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>;
      };
      staff_services: {
        Row: { id: string; staff_id: string; service_id: string };
        Insert: Omit<Database["public"]["Tables"]["staff_services"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["staff_services"]["Insert"]>;
      };
      shifts: {
        Row: {
          id: string;
          staff_id: string;
          location_id: string;
          date: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["shifts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["shifts"]["Insert"]>;
      };
      leave_requests: {
        Row: {
          id: string;
          staff_id: string;
          type: LeaveType;
          start_date: string;
          end_date: string;
          days: number;
          reason: string | null;
          status: LeaveStatus;
          approved_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leave_requests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["leave_requests"]["Insert"]>;
      };

      // --- APPOINTMENTS ---
      appointments: {
        Row: {
          id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          location_id: string;
          date: string;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          source: BookingSource;
          notes: string | null;
          reminder_sent: boolean;
          review_requested: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };

      // --- FINANCE ---
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          client_id: string;
          appointment_id: string | null;
          subtotal: number;
          vat_amount: number;
          discount: number;
          total: number;
          status: InvoiceStatus;
          payment_method: PaymentMethod | null;
          stripe_payment_intent: string | null;
          notes: string | null;
          due_date: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["invoices"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
        };
        Insert: Omit<Database["public"]["Tables"]["invoice_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["invoice_items"]["Insert"]>;
      };
      expenses: {
        Row: {
          id: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          receipt_url: string | null;
          staff_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["expenses"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
      };

      // --- INVENTORY ---
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          brand: string | null;
          unit: string;
          current_stock: number;
          reorder_level: number;
          cost_per_unit: number;
          supplier: string | null;
          location_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inventory_items"]["Insert"]>;
      };
      inventory_transactions: {
        Row: {
          id: string;
          item_id: string;
          type: "in" | "out" | "adjustment";
          quantity: number;
          notes: string | null;
          staff_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_transactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inventory_transactions"]["Insert"]>;
      };

      // --- MARKETING ---
      reviews: {
        Row: {
          id: string;
          client_id: string | null;
          appointment_id: string | null;
          platform: "google" | "internal" | "instagram";
          rating: number;
          comment: string | null;
          reply: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      social_posts: {
        Row: {
          id: string;
          platform: "instagram" | "tiktok" | "facebook";
          caption: string;
          caption_ar: string | null;
          image_urls: string[];
          scheduled_at: string | null;
          published_at: string | null;
          status: "draft" | "scheduled" | "published";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["social_posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["social_posts"]["Insert"]>;
      };
      promotions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          code: string | null;
          valid_from: string;
          valid_until: string;
          usage_count: number;
          max_uses: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["promotions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["promotions"]["Insert"]>;
      };

      // --- WAITLIST ---
      waitlist: {
        Row: {
          id: string;
          client_id: string;
          service_id: string;
          staff_id: string | null;
          preferred_date: string;
          preferred_time: string | null;
          notified: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["waitlist"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["waitlist"]["Insert"]>;
      };

      // --- AI CHAT ---
      whatsapp_conversations: {
        Row: {
          id: string;
          phone: string;
          client_id: string | null;
          messages: Json;
          last_message_at: string;
          status: "active" | "resolved" | "escalated";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["whatsapp_conversations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["whatsapp_conversations"]["Insert"]>;
      };
    };
  };
}
