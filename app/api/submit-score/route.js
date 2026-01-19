import { submitDailyScore, updateStreak } from 'app/lib/db/db';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    console.log(request);
    const { milliseconds, date } = await request.json();
    console.log('Received score submission in POST:', milliseconds);
    const submissionResult = await submitDailyScore(milliseconds, date);
    console.log('Submission result:', submissionResult);
    // if no new row is returned then a conflict occurred
    const dailyAlreadyHasSubmission = submissionResult === null;
    // submission is made only if one new row is inserted
    const submissionSuccess = submissionResult !== null;
    // Update the streak (completed if milliseconds is not null)
    const completed = milliseconds !== null;
    console.log('Submission success:', submissionSuccess);
    const newStreak = submissionSuccess ? await updateStreak(completed, date) : null;
    
    const streakUpdateSuccess = newStreak !== null;

    if (streakUpdateSuccess) {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({ 
      success: submissionSuccess && streakUpdateSuccess,
      submission: submissionResult,
      newStreak: streakUpdateSuccess ? newStreak : null,
      dailyAlreadyHasSubmission: dailyAlreadyHasSubmission
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'User not authenticated' ? 401 : 500 }
    );
  }
}
