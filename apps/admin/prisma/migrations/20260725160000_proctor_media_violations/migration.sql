-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'CAMERA_DISABLED'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'CAMERA_DISABLED';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'MIC_DISABLED'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'MIC_DISABLED';
  END IF;
END $$;
