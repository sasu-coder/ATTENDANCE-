# Manual Test Plan — Attend Secure Campus

Purpose: Quick manual verification steps to validate QR scanning, face recognition, and Supabase attendance flows.

Prerequisites
- Node 18+ installed
- Run `npm ci` in project root
- Ensure Supabase project info set in `.env` or `src/integrations/supabase/client.ts` for local testing
- For native testing: Android device/emulator with Capacitor setup if needed

Local Dev Start
```bash
npm ci
npx tsc --noEmit
npm run dev
```

Basic Smoke Tests

1) App loads
- Visit `http://localhost:5173` (or host/port shown by Vite)
- Navigate to `/student-attendance`
- Expect the Student Attendance page to load with camera permission prompts on scan actions.

2) QR Scanning Flow
- Preconditions: Generate or obtain a QR payload: JSON `{ "sessionId": "<session-id>", "courseId": "<course-id>" }` or URL `https://.../attend?sessionId=...&courseId=...`.
- Steps:
  - Click 'Scan QR' (or open QR modal)
  - Grant camera permissions
  - Present QR to camera
  - Expected: QR detected -> app verifies eligibility (calls Supabase) -> shows progress bar -> on success the attendance record is created
- Checks:
  - Network tab shows call to Supabase (insert into `attendance_records`)
  - UI shows success state

3) Face Recognition Flow
- Preconditions: Test profile with `face_encoding` in `profiles` table (or enroll a sample student and register face)
- Steps:
  - Click 'Verify Face' (or open Face modal)
  - Grant camera permissions
  - Align face and hold until detection occurs
  - Expected: FaceLandmarker runs, app shows verifying progress, then success and attendance recorded
- Checks:
  - MediaPipe tasks load in network tab (CDN URL)
  - Face progress completes and Supabase write occurs to `attendance_records`

4) Supabase Integration
- Verify that `attendance_records` has a new row with correct `session_id` and `student_id` after successful verification
- Check `attendance_analytics` entry is updated (or analytics calculation reflects new attendance)

5) Edge Cases
- Deny camera permissions -> Verify UI handles error and shows instructions
- Invalid QR payload -> Expect visible error and no DB write
- Duplicate attendance attempts -> App should prevent duplicate insert (server-side RLS/schema should reject)

Recording Results
- Mark each test step: PASS / FAIL / NOTES

If you want, I can also scaffold simple Cypress or Playwright tests for the main flows after we confirm the dev server runs locally.
