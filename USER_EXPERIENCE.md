# User Experience Guide: Streak Tracking Feature

This document describes how users will experience the new streak tracking feature.

## For New/Anonymous Users

### Before Signing In
1. User plays and completes the daily puzzle
2. A modal appears titled "Track Your Progress! 📊"
3. The modal explains the benefits:
   - 🔥 Start your streak
   - 🏆 Compete on the leaderboard
   - 📈 Track your progress over time
4. User can either:
   - Click "Sign In to Start Tracking" → Redirects to Google OAuth
   - Click "Maybe Later" → Closes modal, can continue playing

### User Menu (Header)
- User icon in the top-right corner of the page
- Click to open menu with "Sign in" option
- Available at all times, not just after game completion

## For Authenticated Users

### After Signing In
1. User's name appears next to the user icon in the header
2. User menu now shows "Sign Out" option instead of "Sign in"

### First Daily Puzzle Completion
1. User completes the puzzle (matches all tiles correctly)
2. Score is automatically submitted to the backend
3. A streak popup appears with:
   - 🔥 Fire emoji (animated scale-in)
   - "Streak Started!" message
   - "1 Day" in purple text
   - "Keep it up! Come back tomorrow to maintain your streak."
4. User clicks anywhere to dismiss the popup
5. Can then share results as before

### Subsequent Daily Completions

#### Consecutive Days (Yesterday was completed)
1. User completes today's puzzle
2. Streak popup shows:
   - "Streak Updated!" message
   - Current streak count (e.g., "3 Days")
   - Encouragement message

#### After Missing a Day
1. User completes a puzzle after missing one or more days
2. Streak resets to 1
3. Longest streak is preserved in the database
4. Popup shows "Streak Started!" with "1 Day"

#### Failed Puzzle (3 Strikes)
1. User gets 3 strikes and fails the puzzle
2. Current streak resets to 0
3. No popup is shown (game failed)
4. Score is recorded as null in the database

### Streak Persistence
- Streaks are tracked per user in the database
- Current streak length is shown after each completion
- Longest streak ever achieved is preserved
- Last completion date is tracked to determine continuity

## UI Components

### Streak Popup
- **Style**: Clean dialog with purple border, centered content
- **Animation**: Scale-in effect for engagement
- **Dismissal**: Click anywhere outside or on the popup
- **Timing**: Appears 500ms after score submission completes

### Login Prompt Modal
- **Style**: Full-width dialog with purple border
- **Features**: 
  - Clear benefit explanations
  - Highlighted feature list in purple box
  - Two clear action buttons
- **Timing**: Appears 1000ms after puzzle completion (for anonymous users)

### User Menu
- **Location**: Top-right corner of header
- **Always visible**: Available on all pages
- **States**:
  - Not signed in: Shows user icon, menu has "Sign in" option
  - Signed in: Shows user name + icon, menu has "Sign Out" option

## Technical Details

### Score Submission
- Automatically triggered when game is finished
- One submission per day (duplicates prevented)
- Includes completion time for successful attempts
- Includes null for failed attempts (3 strikes)

### Streak Calculation
- Checked against yesterday's date
- Yesterday's completion → Increment streak
- Same day completion → No change (duplicate)
- Older than yesterday → Reset to 1
- Failed game → Reset to 0

### Privacy & Security
- Only authenticated users can track streaks
- Scores tied to user account via session
- No sensitive data exposed in frontend
- API validates authentication on every request

## Error Handling

### Network Errors
- Failed submissions log errors to console
- User can still share results
- Score can be manually submitted later if needed

### Database Errors
- Handled gracefully with error responses
- User sees normal game completion flow
- Errors logged on backend for monitoring

## Future Enhancements (Not in this PR)

Potential additions that could build on this feature:
- Display longest streak in user profile
- Streak recovery (grace period for missed days)
- Streak milestones and achievements
- Social sharing of streak achievements
- Streak leaderboard alongside time leaderboard
