CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trusted_teman" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"teman_id" uuid NOT NULL,
	"for_recipient_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_person_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_teman" ADD CONSTRAINT "trusted_teman_owner_id_person_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_teman" ADD CONSTRAINT "trusted_teman_teman_id_person_id_fk" FOREIGN KEY ("teman_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_teman" ADD CONSTRAINT "trusted_teman_for_recipient_id_care_recipient_id_fk" FOREIGN KEY ("for_recipient_id") REFERENCES "public"."care_recipient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_by_request" ON "message" USING btree ("request_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "trusted_teman_unique" ON "trusted_teman" USING btree ("owner_id","teman_id","for_recipient_id");