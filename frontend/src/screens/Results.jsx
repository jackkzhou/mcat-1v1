const REASONS = {
  both_submitted: 'Both players submitted',
  deadline: 'Time ran out',
  cap: 'Match time limit reached',
};

export default function Results({ result, match, onBack }) {
  const { yourScore, opponentScore, total, reason, correctAnswers } = result;
  const questions = match.passages.flatMap((p) => p.questions);

  const heading =
    result.result === 'win' ? 'You won!' :
    result.result === 'loss' ? 'You lost' : 'Draw';

  return (
    <div>
      <h1>{heading}</h1>
      <p>
        You {yourScore}/{total} — {match.opponent.username} {opponentScore}/{total}
      </p>
      <p style={{ color: 'gray' }}>{REASONS[reason] ?? reason}</p>

      {questions.map((q, i) => {
        const yourChoice = match.selections[q.id];
        const correctChoice = correctAnswers[q.id];
        return (
          <div key={q.id} style={{ marginBottom: 16 }}>
            <p><strong>{i + 1}. {q.question_text}</strong></p>
            {q.choices.map((c) => {
              const isCorrect = c.id === correctChoice;
              const isYours = c.id === yourChoice;
              let mark = '';
              if (isCorrect) mark = ' ✅';
              else if (isYours) mark = ' ❌';
              return (
                <p key={c.id} style={{ margin: '2px 0', fontWeight: isYours ? 'bold' : 'normal' }}>
                  {c.choice_text}{mark}{isYours && ' (your answer)'}
                </p>
              );
            })}
            {yourChoice === undefined && <p style={{ color: 'gray' }}>Not answered</p>}
          </div>
        );
      })}

      <button onClick={onBack}>Back to lobby</button>
    </div>
  );
}