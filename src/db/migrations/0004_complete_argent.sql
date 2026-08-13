CREATE TABLE "circle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"area_id" uuid,
	"organisation_id" uuid,
	"join_policy" text DEFAULT 'open' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circle_member" (
	"circle_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"state" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organisation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"area_id" uuid,
	"verified_at" timestamp with time zone,
	"contact" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"teman_id" uuid NOT NULL,
	"for_recipient_id" uuid,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"frequency" text NOT NULL,
	"time_of_day" text NOT NULL,
	"state" text DEFAULT 'proposed' NOT NULL,
	"proposed_by" uuid NOT NULL,
	"next_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "circle" ADD CONSTRAINT "circle_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle" ADD CONSTRAINT "circle_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle" ADD CONSTRAINT "circle_created_by_person_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_member" ADD CONSTRAINT "circle_member_circle_id_circle_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_member" ADD CONSTRAINT "circle_member_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation" ADD CONSTRAINT "organisation_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_requester_id_person_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_teman_id_person_id_fk" FOREIGN KEY ("teman_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_for_recipient_id_care_recipient_id_fk" FOREIGN KEY ("for_recipient_id") REFERENCES "public"."care_recipient"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring" ADD CONSTRAINT "recurring_proposed_by_person_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "circle_member_unique" ON "circle_member" USING btree ("circle_id","person_id");