-- AlterEnum: behavior / media analysis violations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'NO_FACE_DETECTED'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'NO_FACE_DETECTED';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'MULTIPLE_FACES'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'MULTIPLE_FACES';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'CAMERA_OBSTRUCTED'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'CAMERA_OBSTRUCTED';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'CAMERA_FROZEN'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'CAMERA_FROZEN';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ProctorViolationKind' AND e.enumlabel = 'SPEECH_DETECTED'
  ) THEN
    ALTER TYPE "ProctorViolationKind" ADD VALUE 'SPEECH_DETECTED';
  END IF;
END $$;
