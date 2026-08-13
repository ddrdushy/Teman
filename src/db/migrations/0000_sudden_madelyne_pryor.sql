CREATE TYPE "public"."lang" AS ENUM('en', 'ms', 'ta', 'zh');--> statement-breakpoint
CREATE TYPE "public"."offer_state" AS ENUM('offered', 'accepted', 'declined', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."party_role" AS ENUM('requester', 'teman');--> statement-breakpoint
CREATE TYPE "public"."req_status" AS ENUM('draft', 'looking', 'matched', 'active', 'completed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."sess_state" AS ENUM('scheduled', 'active', 'ended', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('planned', 'today', 'soon');--> statement-breakpoint
CREATE TYPE "public"."verif_state" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."verif_tier" AS ENUM('none', 'basic', 'identity', 'community', 'enhanced');--> statement-breakpoint
CREATE TABLE "area" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"level" text NOT NULL,
	"name" text NOT NULL,
	"name_ms" text,
	"name_ta" text,
	"name_zh" text,
	"centroid" geography(Point, 4326)
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"subject_type" text,
	"subject_id" uuid,
	"meta" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"area_id" uuid,
	"centre_point" geography(Point, 4326) NOT NULL,
	"radius_m" integer DEFAULT 5000 NOT NULL,
	"categories" uuid[],
	"transport" jsonb,
	"destination_point" geography(Point, 4326),
	"repeats_weekly" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "block" (
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_recipient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"managed_by" uuid NOT NULL,
	"preferred_name" text NOT NULL,
	"relationship" text,
	"age_band" text,
	"preferred_language" "lang" NOT NULL,
	"mobility_notes" text,
	"accessibility" jsonb,
	"conversation_prefs" jsonb,
	"emergency_contact" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group" text NOT NULL,
	"key" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ms" text,
	"name_ta" text,
	"name_zh" text,
	"sort" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "category_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"from_person" uuid NOT NULL,
	"about_person" uuid NOT NULL,
	"role" "party_role" NOT NULL,
	"descriptors" text[],
	"felt_safe" boolean,
	"would_meet_again" boolean,
	"private_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"teman_id" uuid NOT NULL,
	"accepted_by_requester_at" timestamp with time zone,
	"accepted_by_teman_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "match_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "offer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"teman_id" uuid NOT NULL,
	"state" "offer_state" DEFAULT 'offered' NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "otp_challenge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_e164" text NOT NULL,
	"code_hash" text NOT NULL,
	"salt" text NOT NULL,
	"request_ip" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_e164" text NOT NULL,
	"phone_verified_at" timestamp with time zone,
	"email" text,
	"display_name" text NOT NULL,
	"photo_key" text,
	"preferred_language" "lang" DEFAULT 'en' NOT NULL,
	"text_scale" smallint DEFAULT 18 NOT NULL,
	"area_id" uuid,
	"approx_point" geography(Point, 4326),
	"bio" text,
	"languages" text[],
	"categories" uuid[],
	"transport" jsonb,
	"verification_tier" "verif_tier" DEFAULT 'none' NOT NULL,
	"is_elder_view" boolean DEFAULT false NOT NULL,
	"suspended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "person_phone_e164_unique" UNIQUE("phone_e164")
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"subject_person_id" uuid NOT NULL,
	"session_id" uuid,
	"category" text NOT NULL,
	"detail" text,
	"severity" text DEFAULT 'high' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"handled_by" uuid,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"beneficiary_type" text NOT NULL,
	"beneficiary_id" uuid,
	"category_id" uuid NOT NULL,
	"status" "req_status" DEFAULT 'draft' NOT NULL,
	"urgency" "urgency" DEFAULT 'planned' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"area_id" uuid,
	"approx_point" geography(Point, 4326) NOT NULL,
	"exact_point" geography(Point, 4326),
	"exact_address" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"is_flexible" boolean DEFAULT false NOT NULL,
	"prefs" jsonb,
	"visibility" text DEFAULT 'public' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"state" "sess_state" DEFAULT 'scheduled' NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"expected_duration_min" integer,
	"started_by" uuid,
	"ended_by" uuid,
	"live_location_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "session_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "trusted_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"relationship" text,
	"notify_on" jsonb
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"tier" "verif_tier" NOT NULL,
	"doc_type" text,
	"doc_key" text,
	"doc_hash" text,
	"selfie_key" text,
	"state" "verif_state" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"reject_reason" text,
	"purge_after" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_person_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blocker_id_person_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blocked_id_person_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_recipient" ADD CONSTRAINT "care_recipient_managed_by_person_id_fk" FOREIGN KEY ("managed_by") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_from_person_person_id_fk" FOREIGN KEY ("from_person") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_about_person_person_id_fk" FOREIGN KEY ("about_person") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_teman_id_person_id_fk" FOREIGN KEY ("teman_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer" ADD CONSTRAINT "offer_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer" ADD CONSTRAINT "offer_teman_id_person_id_fk" FOREIGN KEY ("teman_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_person_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_subject_person_id_person_id_fk" FOREIGN KEY ("subject_person_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_handled_by_person_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_requester_id_person_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_contact" ADD CONSTRAINT "trusted_contact_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_reviewed_by_person_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_actor" ON "audit_log" USING btree ("actor_id","at");--> statement-breakpoint
CREATE INDEX "audit_subject" ON "audit_log" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "availability_centre_gist" ON "availability" USING gist ("centre_point");--> statement-breakpoint
CREATE INDEX "availability_time" ON "availability" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "block_unique" ON "block" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offer_unique" ON "offer" USING btree ("request_id","teman_id");--> statement-breakpoint
CREATE INDEX "offer_by_request" ON "offer" USING btree ("request_id","state");--> statement-breakpoint
CREATE INDEX "otp_phone" ON "otp_challenge" USING btree ("phone_e164","created_at");--> statement-breakpoint
CREATE INDEX "otp_ip" ON "otp_challenge" USING btree ("request_ip","created_at");--> statement-breakpoint
CREATE INDEX "person_approx_gist" ON "person" USING gist ("approx_point");--> statement-breakpoint
CREATE INDEX "request_approx_gist" ON "request" USING gist ("approx_point");--> statement-breakpoint
CREATE INDEX "request_looking" ON "request" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX "verification_hash" ON "verification" USING btree ("doc_hash");--> statement-breakpoint
CREATE INDEX "verification_queue" ON "verification" USING btree ("state","created_at");