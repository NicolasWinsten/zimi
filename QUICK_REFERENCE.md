# Quick Reference: Streak Tracking Feature

## 🚀 Quick Start

### For Developers

1. **Database Setup** (Required before deployment)
   ```sql
   CREATE TABLE IF NOT EXISTS streaks (
     user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     current_streak_length INTEGER NOT NULL DEFAULT 0,
     longest_streak_length INTEGER NOT NULL DEFAULT 0,
     current_streak_last_date DATE NOT NULL
   );
   CREATE INDEX idx_streaks_user_id ON streaks(user_id);
   ```

2. **Environment Variables** (Ensure these exist)
   - `DATABASE_URL` or `POSTGRES_URL` - PostgreSQL connection string
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `NEXTAUTH_URL` - Application URL
   - `NEXTAUTH_SECRET` - NextAuth secret key

3. **Testing Locally**
   ```bash
   npm install
   npm run dev
   ```
   Visit `http://localhost:3000` and try completing a puzzle

## 📋 Feature Overview

### What Was Built

| Component | Purpose | File |
|-----------|---------|------|
| Database Functions | Track and update user streaks | `app/lib/db/db.js` |
| API Endpoint | Submit scores and update streaks | `app/api/submit-score/route.js` |
| Streak Popup | Show streak after completion | `app/ui/streak-popup.js` |
| Login Prompt | Encourage login for tracking | `app/ui/login-prompt-modal.js` |
| Game Integration | Auto-submit scores | `app/ui/game-session.js` |
| User Menu | Login/logout interface | `app/layout.js` |

### How It Works

```
User completes puzzle
    ↓
Is user authenticated?
    ↓                ↓
   YES              NO
    ↓                ↓
Submit score    Show login prompt
    ↓
Update streak
    ↓
Show streak popup
```

## 🧪 Testing Scenarios

### Manual Test Cases

1. **Anonymous User Completes Puzzle**
   - Expected: Login prompt modal appears
   - Expected: Can dismiss and continue
   - Expected: Can click "Sign In" to authenticate

2. **New User First Completion**
   - Expected: Streak popup shows "Streak Started! 1 Day"
   - Expected: Popup is dismissable
   - Expected: Score appears on leaderboard

3. **User Completes on Consecutive Days**
   - Day 1: Complete puzzle → "1 Day"
   - Day 2: Complete puzzle → "2 Days"
   - Day 3: Complete puzzle → "3 Days"
   - Expected: Streak increments each day

4. **User Misses a Day**
   - Day 1: Complete puzzle → "1 Day"
   - Day 2: Skip
   - Day 3: Complete puzzle → "1 Day" (reset)
   - Expected: Streak resets but longest is preserved

5. **User Fails Puzzle (3 Strikes)**
   - Complete with 3 strikes
   - Expected: No popup shown
   - Expected: Streak resets to 0
   - Expected: Score shows as failed in leaderboard

6. **Duplicate Completion Same Day**
   - Complete puzzle once
   - Try to complete again (refresh page, etc.)
   - Expected: Streak doesn't change
   - Expected: No duplicate submissions

## 🐛 Common Issues

### Streak Not Updating
- Check database has streaks table
- Verify user is authenticated
- Check console for API errors
- Ensure DATABASE_URL is set correctly

### Login Not Working
- Verify Google OAuth credentials
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set
- Check NextAuth configuration

### Popup Not Appearing
- Check browser console for errors
- Verify motion library is installed
- Check if game completion is detected
- Test with different browsers

## 📚 Documentation Files

- **STREAKS_MIGRATION.md** - Database schema and migration SQL
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **USER_EXPERIENCE.md** - Complete user experience guide
- **QUICK_REFERENCE.md** - This file

## 🔍 Code Locations

### Backend
- **Streak Logic**: `app/lib/db/db.js` lines 47-158
- **API Route**: `app/api/submit-score/route.js`
- **Auth Config**: `app/api/auth/[...nextauth]/route.js`

### Frontend
- **Game Completion**: `app/ui/game-session.js` lines 124-157
- **Streak Popup**: `app/ui/streak-popup.js`
- **Login Modal**: `app/ui/login-prompt-modal.js`
- **User Menu**: `app/ui/user-menu.js`

### Types
- **Type Definitions**: `types/app.d.ts` lines 28-32

## 🎨 UI Components

### Streak Popup
- Appears 500ms after score submission
- Animated scale-in effect
- Fire emoji 🔥
- Shows current streak count
- Dismissable by clicking anywhere

### Login Prompt Modal
- Appears 1000ms after puzzle completion (anonymous users)
- Lists benefits of signing in
- Two buttons: "Sign In" and "Maybe Later"
- Purple-themed to match app design

### User Menu
- Always visible in top-right header
- Shows user name when authenticated
- Click to access sign in/out

## 💡 Tips for Customization

### Change Popup Timing
```javascript
// In app/ui/game-session.js
setTimeout(() => setShowStreakPopup(true), 500); // Change 500 to desired ms
setTimeout(() => setShowLoginPrompt(true), 1000); // Change 1000 to desired ms
```

### Modify Streak Colors
```javascript
// In app/ui/streak-popup.js
color: '#9333ea' // Change to any color
border: '3px solid #9333ea' // Change border color
```

### Adjust Streak Logic
```javascript
// In app/lib/db/db.js, line 96
// Current: Resets streak to 1 if not consecutive
// To make it more forgiving, you could add grace periods
```

## 📊 Database Schema

```sql
-- Main tables involved
users (id, name, email, password)
daily_scores (user_id, date, milliseconds)
streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
```

## 🔐 Security

- ✅ Authentication required for score submission
- ✅ Server-side validation of user sessions
- ✅ SQL injection prevention via parameterized queries
- ✅ No sensitive data exposed in frontend
- ✅ 0 vulnerabilities found in security scan

## 🚢 Deployment Checklist

- [ ] Create streaks table in production database
- [ ] Verify environment variables are set
- [ ] Test authentication flow works
- [ ] Verify score submission works
- [ ] Test streak calculation with real dates
- [ ] Monitor error logs for issues
- [ ] Test on mobile devices
- [ ] Verify popup animations work smoothly
