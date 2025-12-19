import { submitDailyScore, updateStreak } from 'app/lib/db/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { milliseconds, date } = await request.json();
    console.log('Received score submission in POST:', milliseconds);
    // Submit the daily score
    await submitDailyScore(milliseconds, date);
    
    // Update the streak (completed if milliseconds is not null)
    const completed = milliseconds !== null;
    const streakData = await updateStreak(completed, date);
    
    return NextResponse.json({ 
      success: true, 
      streak: streakData 
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'User not authenticated' ? 401 : 500 }
    );
  }
}
