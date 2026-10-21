import { useState } from 'react'
import { SERVICE_TOPICS, type Answer, type FaqQuestion, type ServiceTopic } from '../data/serviceFaq'

/**
 * Visitor FAQ for one service (or all, with a topic step first): pick the visitor's question,
 * narrow it down if needed, and get what to say, facts, proof, what to show and the next step.
 */
export function ServiceFaq({ topic, topics = SERVICE_TOPICS }: { topic?: string; topics?: ServiceTopic[] }) {
  const fixed = topics.find((t) => t.id === topic)
  const [topicId, setTopicId] = useState<string | null>(fixed?.id ?? null)
  const [qId, setQId] = useState<string | null>(null)
  const [optId, setOptId] = useState<string | null>(null)

  const t = topics.find((x) => x.id === topicId) ?? null
  const q: FaqQuestion | null = t?.questions.find((x) => x.id === qId) ?? null
  const opt = q?.follow?.options.find((o) => o.id === optId) ?? null
  const answer: Answer | null = q?.answer ?? opt?.answer ?? null

  // Steps: [topic] → question → [follow-up] → answer
  const steps = [...(fixed ? [] : ['topic']), 'question', ...(q?.follow ? ['follow'] : []), 'answer']
  const current = !t ? 'topic' : !q ? 'question' : q.follow && !opt ? 'follow' : 'answer'
  const idx = steps.indexOf(current)
  const pct = Math.round(((idx + 1) / steps.length) * 100)

  const back = () => {
    if (current === 'answer' && q?.follow) setOptId(null)
    else if (current === 'answer' || current === 'follow') {
      setQId(null)
      setOptId(null)
    } else if (current === 'question' && !fixed) setTopicId(null)
  }
  const anotherQuestion = () => {
    setQId(null)
    setOptId(null)
  }

  return (
    <div className="vc sfaq no-print">
      <div className="vc-title">Visitor asks about {t ? (t.about ?? t.label.toLowerCase()) : 'our services'}: find the answer.</div>
      <div className="vc-progress">
        <span>
          Step {idx + 1} of {steps.length}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="vc-bar">
        <div style={{ width: `${pct}%` }} />
      </div>

      {current === 'topic' && (
        <>
          <div className="vc-q">Which topic?</div>
          <div className="vc-choices">
            {topics.map((x) => (
              <button key={x.id} onClick={() => setTopicId(x.id)}>
                <span>{x.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {current === 'question' && t && (
        <>
          <div className="vc-q">What does the visitor ask?</div>
          <div className="vc-choices">
            {t.questions.map((x) => (
              <button key={x.id} onClick={() => setQId(x.id)}>
                <span>{x.q}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {current === 'follow' && q?.follow && (
        <>
          <div className="vc-q">{q.follow.q}</div>
          <div className="vc-choices">
            {q.follow.options.map((o) => (
              <button key={o.id} onClick={() => setOptId(o.id)}>
                <span>{o.label}</span>
                {o.hint && <small>{o.hint}</small>}
              </button>
            ))}
          </div>
        </>
      )}

      {current === 'answer' && answer && q && (
        <div className="vc-result sfaq-answer">
          <div className="sfaq-asked">
            “{q.q}”{opt ? ` · ${opt.label}` : ''}
          </div>
          <div className="vc-do">Say this</div>
          <p className="sfaq-say">{answer.say}</p>
          {answer.facts && <Block title="Key facts" items={answer.facts} />}
          {answer.proof && <Block title="We have done it" items={answer.proof} className="sfaq-proof" />}
          {answer.show && <Block title="Show them" items={answer.show} />}
          {answer.ask && <Block title="Ask back" items={answer.ask} />}
          {answer.next && (
            <div className="vc-next">
              <span>Next step</span>
              {answer.next}
            </div>
          )}
        </div>
      )}

      {current !== (fixed ? 'question' : 'topic') && (
        <div className="vc-actions">
          {current === 'answer' && (
            <button className="vc-primary" onClick={anotherQuestion}>
              Another question
            </button>
          )}
          <button onClick={back}>Back</button>
        </div>
      )}
    </div>
  )
}

function Block({ title, items, className }: { title: string; items: string[]; className?: string }) {
  return (
    <>
      <div className="vc-do">{title}</div>
      <ul className={className}>
        {items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </>
  )
}
