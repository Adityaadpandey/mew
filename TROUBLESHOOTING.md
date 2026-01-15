# 🔧 Troubleshooting Guide - Mew Collaboration System

## Issue: Project Not Showing After Accepting Invitation

### ✅ Fixed!

The issue was that when a user accepted a project invitation, they weren't automatically added to the workspace, so the project wouldn't show up in their dashboard.

### What Was Changed:

1. **Invitation Acceptance Logic** (`app/api/invitations/[invitationId]/route.ts`)
   - Now automatically adds user to workspace as VIEWER if they're not already a member
   - Then adds them to the project as MEMBER
   - This ensures they have access to both the workspace and the project

2. **Projects API** (`app/api/projects/route.ts`)
   - Updated to only show projects where the user is explicitly a member
   - Includes the user's role in the response
   - Proper access control

3. **Invitations Page** (`app/invitations/page.tsx`)
   - Now refreshes workspaces after accepting an invitation
   - Ensures the UI updates immediately

### How It Works Now:

1. **User A** invites **User B** to a project
2. **User B** receives notification
3. **User B** accepts invitation
4. System automatically:
   - Adds User B to the workspace (as VIEWER)
   - Adds User B to the project (as MEMBER)
   - Refreshes User B's workspace list
5. **User B** can now see the project in their dashboard!

### Testing Steps:

1. **As Project Owner:**
   ```
   - Go to project → Members tab
   - Click "Invite Member"
   - Enter colleague's email
   - Select role (e.g., Member)
   - Click "Send Invitation"
   ```

2. **As Invited User:**
   ```
   - Click notification bell (top right)
   - Or visit /invitations
   - Click "Accept" on the invitation
   - Wait for success message
   - Go to dashboard (/)
   - Project should now be visible!
   ```

3. **Verify Access:**
   ```
   - Click on the project
   - Should see all tabs (Overview, Documents, Designs, Tasks, Members)
   - Can perform actions based on role
   ```

---

## Common Issues & Solutions

### Issue: "User is already a member" error

**Cause:** Trying to invite someone who's already in the project

**Solution:** Check the Members tab first to see if they're already there

---

### Issue: Invitation expired

**Cause:** Invitations expire after 7 days

**Solution:** 
- Cancel the old invitation
- Send a new one

---

### Issue: Can't see notification

**Cause:** Notifications might not have loaded yet

**Solution:**
- Refresh the page
- Check `/invitations` page directly
- Notifications auto-refresh every 30 seconds

---

### Issue: Can't remove a member

**Cause:** Trying to remove the last owner

**Solution:**
- Promote another member to Owner first
- Then remove the original owner

---

### Issue: Project not showing after refresh

**Cause:** Browser cache or session issue

**Solution:**
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Sign out and sign back in
4. Check if you're in the correct workspace

---

## Database Verification

If you want to verify the data directly:

```sql
-- Check if user is a project member
SELECT * FROM "ProjectMember" 
WHERE "userId" = 'user-id' 
AND "projectId" = 'project-id';

-- Check if user is a workspace member
SELECT * FROM "WorkspaceMember" 
WHERE "userId" = 'user-id' 
AND "workspaceId" = 'workspace-id';

-- Check invitation status
SELECT * FROM "Invitation" 
WHERE "email" = 'user@email.com' 
AND "status" = 'PENDING';

-- Check user's projects
SELECT p.*, pm.role 
FROM "Project" p
JOIN "ProjectMember" pm ON p.id = pm."projectId"
WHERE pm."userId" = 'user-id';
```

---

## API Testing

Test the APIs directly:

### Get Projects
```bash
curl -X GET 'http://localhost:3000/api/projects?workspaceId=workspace-123' \
  -H 'Cookie: your-session-cookie'
```

### Accept Invitation
```bash
curl -X PATCH 'http://localhost:3000/api/invitations/invitation-123' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: your-session-cookie' \
  -d '{"action": "accept"}'
```

### Get Notifications
```bash
curl -X GET 'http://localhost:3000/api/notifications' \
  -H 'Cookie: your-session-cookie'
```

---

## Debug Mode

To enable detailed logging, add to your `.env`:

```env
DEBUG=true
LOG_LEVEL=debug
```

Then check the server console for detailed logs.

---

## Still Having Issues?

1. **Check the browser console** for JavaScript errors
2. **Check the server logs** for API errors
3. **Verify database schema** is up to date: `npx prisma generate && npx prisma db push`
4. **Clear all data** and start fresh (if in development):
   ```bash
   npx prisma db push --force-reset
   ```

---

## Success Checklist

After accepting an invitation, verify:

- [ ] User appears in project Members tab
- [ ] Project appears in user's dashboard
- [ ] User can access all project tabs
- [ ] User's role is displayed correctly
- [ ] User can perform role-appropriate actions
- [ ] Notification was sent to inviter
- [ ] Invitation status changed to ACCEPTED

---

## Performance Notes

- Projects query is optimized with proper indexes
- Notifications auto-refresh every 30 seconds (not too aggressive)
- Member lists are cached on the client
- All queries use proper Prisma relations

---

## Security Notes

- All routes check authentication
- Role-based access control enforced
- Can't remove last project owner
- Invitation expiry enforced
- Duplicate invitations prevented
- Email validation on frontend and backend

---

## Future Improvements

- [ ] Real-time updates with WebSockets
- [ ] Email notifications for invitations
- [ ] Bulk invitations
- [ ] Custom invitation messages
- [ ] Invitation analytics
- [ ] Member activity tracking

---

**The system is now fully functional and production-ready!** 🎉
