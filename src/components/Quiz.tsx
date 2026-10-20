import { quizKey, type QuizItem } from '../lib/briefing'
import { Field, RemarksField } from './fields'

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Choice indexes in a fixed, mixed-up order (the same every time for the same question). */
const order = (q: QuizItem) =>
  q.choices.map((_, k) => k).sort((a, b) => hash(q.q + '\u0000' + q.choices[a]) - hash(q.q + '\u0000' + q.choices[b]))

export const usableQuiz = (quiz: QuizItem[]) => quiz.filter((q) => q.q.trim() && q.choices.filter((c) => c.trim()).length >= 2)

type Props = {
  sectionId: string
  quiz: QuizItem[]
  /** This browser's answers: question key -> chosen choice index. */
  answers: Record<string, number>
  onAnswer: (key: string, choice: number | null) => void
}

/** "Test yourself" questions under a section; answers stay private in this browser. */
export function Quiz({ sectionId, quiz, answers, onAnswer }: Props) {
  const items = usableQuiz(quiz)
  if (!items.length) return null
  const right = items.filter((q) => answers[quizKey(sectionId, q)] === q.answer).length
  const answered = items.filter((q) => answers[quizKey(sectionId, q)] !== undefined).length

  return (
    <details className="quiz">
      <summary>
        Test yourself · {items.length} question{items.length === 1 ? '' : 's'}
        {answered > 0 && (
          <span className={`quiz-score ${right === items.length ? 'done' : ''}`}>
            {right}/{items.length} right
          </span>
        )}
      </summary>
      <ol>
        {items.map((q) => {
          const key = quizKey(sectionId, q)
          const chosen = answers[key]
          const done = chosen !== undefined
          return (
            <li key={key} className="quiz-q">
              <p>{q.q}</p>
              <div className="quiz-choices">
                {order(q).map((k) =>
                  q.choices[k].trim() ? (
                    <button
                      key={k}
                      disabled={done}
                      className={done ? (k === q.answer ? 'right' : k === chosen ? 'wrong' : '') : ''}
                      onClick={() => onAnswer(key, k)}
                    >
                      {q.choices[k]}
                    </button>
                  ) : null,
                )}
              </div>
              {done && (
                <p className={`quiz-result ${chosen === q.answer ? 'right' : 'wrong'}`}>
                  {chosen === q.answer ? 'Right!' : 'Not quite.'} {q.explain}{' '}
                  <button className="link" onClick={() => onAnswer(key, null)}>
                    Try again
                  </button>
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </details>
  )
}

/** Add, edit, reorder and remove the quiz questions of a section. */
export function QuizEditor({ quiz, onChange }: { quiz: QuizItem[]; onChange: (fn: (quiz: QuizItem[]) => QuizItem[]) => void }) {
  const setAt = (k: number, patch: Partial<QuizItem>) => onChange((list) => list.map((q, j) => (j === k ? { ...q, ...patch } : q)))
  const move = (k: number, dir: -1 | 1) =>
    onChange((list) => {
      const next = [...list]
      const [it] = next.splice(k, 1)
      next.splice(k + dir, 0, it)
      return next
    })

  return (
    <div className="field">
      <span>Quiz questions{quiz.length ? ` (${quiz.length})` : ''}</span>
      {quiz.map((q, k) => (
        <div key={k} className="faq-edit">
          <div className="faq-edit-head">
            <b>{k + 1}.</b>
            <button className="link" disabled={k === 0} onClick={() => move(k, -1)} title="Move up" aria-label="Move question up">
              ↑
            </button>
            <button className="link" disabled={k === quiz.length - 1} onClick={() => move(k, 1)} title="Move down" aria-label="Move question down">
              ↓
            </button>
            <button className="link" onClick={() => onChange((list) => list.filter((_, j) => j !== k))} title="Remove question" aria-label="Remove question">
              ✕
            </button>
          </div>
          <Field label="Question" value={q.q} onCommit={(text) => setAt(k, { q: text })} />
          <RemarksField
            label="Choices (one per line; they are shown mixed up)"
            rows={4}
            value={q.choices.join('\n')}
            placeholder={'Right answer\nWrong answer\nWrong answer'}
            onCommit={(text) => {
              const choices = text.split('\n').map((c) => c.trim()).filter(Boolean)
              setAt(k, { choices, answer: Math.min(q.answer, Math.max(0, choices.length - 1)) })
            }}
          />
          <label className="field">
            <span>Right answer</span>
            <select className="dialog-input" value={q.answer} onChange={(e) => setAt(k, { answer: Number(e.target.value) })}>
              {q.choices.map((c, j) => (
                <option key={j} value={j}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Field label="Explanation (optional)" value={q.explain ?? ''} onCommit={(explain) => setAt(k, { explain })} />
        </div>
      ))}
      <div className="actions tight">
        <button onClick={() => onChange((list) => [...list, { q: 'New question', choices: ['Right answer', 'Wrong answer'], answer: 0 }])}>
          Add question
        </button>
      </div>
    </div>
  )
}
