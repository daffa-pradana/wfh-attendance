-- CreateTable
CREATE TABLE "profile_change_logs" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "changed_field" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_change_logs_pkey" PRIMARY KEY ("id")
);
