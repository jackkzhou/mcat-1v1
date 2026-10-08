import Countdown from '../Countdown';

export default function Match({ match, onSelect, onSubmit }) {
  const { opponent, passages, selections, submitted, opponentSubmitted,
          deadlineAt, opponentConnected } = match;

  const questions = passages.flatMap((p) => p.questions);
  const answered = questions.filter((q) => selections[q.id] !== undefined).length;

  return (
    <div>
      {/* Header: opponent + status */}
      <p>
        vs <strong>{opponent.username}</strong>
        {!opponentConnected && <span style={{ color: 'orange' }}> (disconnected)</span>}
        {opponentSubmitted && <span> — submitted</span>}
      </p>
      {deadlineAt && <Countdown deadlineAt={deadlineAt} />}

      {passages.map((p) => (
        <div key={p.id}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{p.passage_text}</p>

          {p.questions.map((q, i) => (
            <fieldset key={q.id} disabled={submitted}>
              <legend>{i + 1}. {q.question_text}</legend>
              {q.choices.map((c) => (
                <label key={c.id} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    checked={selections[q.id] === c.id}
                    onChange={() => onSelect(q.id, c.id)}
                  />
                  {c.choice_text}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      ))}

      <p>{answered}/{questions.length} answered</p>
      <button onClick={onSubmit} disabled={submitted}>
        {submitted ? 'Submitted — waiting for opponent' : 'Submit'}
      </button>
    </div>
  );
}