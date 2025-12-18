# Database Migration for Streaks Table

This document describes the database schema changes needed for the streak tracking feature.

## Streaks Table Schema

The following SQL should be executed to create the `streaks` table in the database:

```sql
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak_length INTEGER NOT NULL DEFAULT 0,
  longest_streak_length INTEGER NOT NULL DEFAULT 0,
  current_streak_last_date DATE NOT NULL
);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);
```

## Table Description

- `user_id`: Foreign key reference to the users table. Primary key for this table.
- `current_streak_length`: The user's current consecutive days streak.
- `longest_streak_length`: The longest streak the user has ever achieved.
- `current_streak_last_date`: The date of the user's last completed puzzle.

## Notes

- The streak is updated when a user completes a daily puzzle.
- If a user completes a puzzle the day after their last completion, the streak increments by 1.
- If a user misses a day, the current streak resets to 1 (or 0 if they fail).
- The longest streak is preserved across streak resets.
