# Implementation Plan: Team & Role Management

## Phase 1: Database & Backend
- [x] Update RLS policies for `staff` table to allow admins to UPDATE and DELETE.
- [x] Create `get_all_staff_with_emails()` RPC to fetch staff details joined with `auth.users` emails.
- [x] Implement an Edge Function for "Invite Member".

## Phase 2: Frontend Implementation (`TeamAccess.tsx`)
- [x] Connect `TeamAccess.tsx` to the `get_all_staff_with_emails` RPC.
- [x] Implement `InviteMemberModal` for adding new members.
- [x] Implement `EditRoleModal` for changing staff roles.
- [x] Implement `DeleteMemberDialog` for deleting staff.
- [x] Ensure buttons are only visible/interactive if the current user is an `admin`.

## Phase 3: Integration & Testing
- [x] Verify that non-admins cannot see/access editing tools.
- [x] Verify that role changes persist in the database.
- [x] Verify that members can be removed from the team view.
