import { useState } from 'react'
import { loadUser } from '../lib/user'

/**
 * "Visitor check": a few quick questions about the person at the booth, then a priority
 * (hot / warm / cold, or competitor / partner / official / general) with the concrete next
 * step to agree, and a lead note to paste into VisitConnect. Nothing is stored.
 */

type StepId = 'who' | 'need' | 'role' | 'when'
type Choice = { id: string; label: string; hint?: string }
type Step = { id: StepId; q: string; choices: Choice[] }

const STEPS: Record<StepId, Step> = {
  who: {
    id: 'who',
    q: 'Who is the visitor?',
    choices: [
      { id: 'adnoc', label: 'ADNOC group company', hint: 'ADNOC Onshore, Offshore, Gas, Drilling, Refining, Borouge, …' },
      { id: 'operator', label: 'Other oil & gas operator or asset owner', hint: 'IOC, NOC, utility, port, petrochemical plant' },
      { id: 'epc', label: 'EPC, contractor or service company', hint: 'They could subcontract inspection or survey to us' },
      { id: 'partner', label: 'Possible partner, supplier or distributor', hint: 'Drone / sensor / software maker, reseller' },
      { id: 'gov', label: 'Government, regulator or authority', hint: 'DoE, GCAA, CICPA, police, civil defence, ministry' },
      { id: 'competitor', label: 'Competitor', hint: 'Drone, inspection or NDT service company' },
      { id: 'general', label: 'Student, job seeker or general visitor' },
    ],
  },
  need: {
    id: 'need',
    q: 'What do they need?',
    choices: [
      { id: 'specific', label: 'A specific problem or project', hint: 'e.g. flare inspection due, tank shutdown, methane reporting, pipeline survey' },
      { id: 'exploring', label: 'Interested, exploring what drones can do' },
      { id: 'looking', label: 'Just looking or collecting brochures' },
    ],
  },
  role: {
    id: 'role',
    q: 'What is their role?',
    choices: [
      { id: 'decision', label: 'Decision maker or budget holder', hint: 'Manager, head of department, director, VP' },
      { id: 'technical', label: 'Technical person or end user', hint: 'Engineer, inspector, integrity, HSE, pilot' },
      { id: 'other', label: 'Procurement, admin or not sure' },
    ],
  },
  when: {
    id: 'when',
    q: 'When could it happen?',
    choices: [
      { id: 'soon', label: 'Within 6 months', hint: 'Upcoming shutdown, tender, or budget already there' },
      { id: 'nextyear', label: 'Next year', hint: 'Budget planning' },
      { id: 'none', label: 'No timeline yet' },
    ],
  },
}

const BUYERS = ['adnoc', 'operator', 'epc']

/** The questions for this visitor type (the first one is always "who"). */
function stepsFor(who: string | undefined): StepId[] {
  if (!who) return ['who', 'need', 'role', 'when']
  if (BUYERS.includes(who)) return ['who', 'need', 'role', 'when']
  if (who === 'partner' || who === 'gov') return ['who', 'role']
  return ['who']
}

type Level = 'hot' | 'warm' | 'cold' | 'partner' | 'gov' | 'competitor' | 'general'
type Result = { level: Level; title: string; summary: string; why: string[]; actions: string[]; next: string }

const LEVEL_LABEL: Record<Level, string> = {
  hot: 'Hot lead',
  warm: 'Warm lead',
  cold: 'Cold lead',
  partner: 'Partner',
  gov: 'Official',
  competitor: 'Competitor',
  general: 'General visitor',
}

function score(a: Record<string, string>) {
  const need = { specific: 3, exploring: 1, looking: 0 }[a.need] ?? 0
  const role = { decision: 2, technical: 1, other: 0 }[a.role] ?? 0
  const when = { soon: 2, nextyear: 1, none: 0 }[a.when] ?? 0
  const who = a.who === 'adnoc' || a.who === 'operator' ? 1 : 0
  return need + role + when + who
}

function resultFor(a: Record<string, string>): Result {
  const adnoc = a.who === 'adnoc'
  if (a.who === 'competitor')
    return {
      level: 'competitor',
      title: 'Be polite, keep it general',
      summary: 'Competitors are welcome, but the booth is for customers. Keep it short and friendly.',
      why: ['They offer drone, inspection or NDT services like we do.'],
      actions: [
        'Be professional and friendly; exchange business cards if they offer.',
        'Talk about what is public: our services, the products on the booth, the ADIPEC demo.',
        'Do not share prices, customer project details, team size or availability, or ongoing tenders.',
        'Note what they asked about and what they showed interest in, and tell the team lead.',
      ],
      next: 'No follow-up needed. Note what they asked and tell the team lead.',
    }
  if (a.who === 'general')
    return {
      level: 'general',
      title: 'Be friendly, keep it short',
      summary: 'Give a short, friendly introduction and point them to our website and social media.',
      why: ['Not a buyer or partner, but everyone who visits is a future ambassador.'],
      actions: [
        'Explain in one or two sentences who we are and what is on the booth.',
        'Point to the website and social media (job seekers: the careers page).',
        'No souvenirs: they are for important visitors only.',
        'If a customer is waiting, politely wrap up.',
      ],
      next: 'No follow-up needed.',
    }
  if (a.who === 'partner') {
    const dm = a.role === 'decision'
    return {
      level: 'partner',
      title: dm ? 'Possible partner: book a meeting' : 'Possible partner: get the right contact',
      summary: 'Find out what they offer and whether it fits our services in the UAE.',
      why: [
        'They could supply technology or open a channel for us.',
        dm ? 'They can decide on a partnership.' : 'They are not the decision maker: get the name of the person who is.',
      ],
      actions: [
        'Ask what they offer (product, region, references) and why they came to us.',
        'Take their brochure and business card; note the product and the person.',
        dm
          ? 'Propose a meeting with our business development lead after ADIPEC; agree a date.'
          : 'Ask for the business development or partnership contact and their email.',
        'Do not commit to exclusivity, pricing or volumes at the booth.',
      ],
      next: dm ? 'Partnership meeting after ADIPEC with our BD lead (agree a date).' : 'Email their BD contact next week.',
    }
  }
  if (a.who === 'gov') {
    const dm = a.role === 'decision'
    return {
      level: 'gov',
      title: dm ? 'Official: involve a director' : 'Official: leave a strong impression',
      summary: 'Authorities shape drone rules and are often buyers too (security, emergency response).',
      why: ['Government, regulator or authority.', dm ? 'Senior official.' : 'Technical or working-level staff.'],
      actions: [
        dm ? 'Invite them to the meeting table and bring in a director.' : 'Show the booth and the most relevant demo.',
        'Key message: all pilots licensed, all drones registered with GCAA and CICPA, ADNOC blanket permit: we have all the required compliance.',
        'Ask about their priorities (security, emergency response, methane reporting, drone policy).',
        'Invite them to the demo day in Abu Dhabi at the end of the month.',
        dm ? 'Tumbler from the director.' : 'Exchange business cards.',
      ],
      next: 'Demo day invitation; director follows up after ADIPEC.',
    }
  }

  // Buyers: operators, ADNOC, EPCs
  const s = score(a)
  const level: Level = s >= 6 ? 'hot' : s >= 3 ? 'warm' : 'cold'
  const why: string[] = []
  if (adnoc) why.push('ADNOC group: we already have the drone center contract with ADNOC Onshore.')
  else if (a.who === 'operator') why.push('Oil & gas operator: a direct buyer of inspection and drone services.')
  else why.push('EPC or contractor: can subcontract inspection, survey or progress monitoring to us.')
  if (a.need === 'specific') why.push('They have a specific problem or project.')
  if (a.need === 'exploring') why.push('They are interested but have no concrete project yet.')
  if (a.need === 'looking') why.push('They are only looking around.')
  if (a.role === 'decision') why.push('They are a decision maker or budget holder.')
  if (a.role === 'technical') why.push('They are a technical person: they influence the decision.')
  if (a.when === 'soon') why.push('It could happen within 6 months.')
  if (a.when === 'nextyear') why.push('It could happen next year.')

  const adnocLine = 'Mention our ADNOC Onshore drone center contract and the upcoming ADNOC Group framework agreement.'
  if (level === 'hot')
    return {
      level,
      title: 'Hot lead: agree a concrete next step now',
      summary: 'This is why we are at ADIPEC. Give them time, and do not let them leave without a date.',
      why,
      actions: [
        'Invite them to the meeting table and bring in a director or senior team member.',
        'Write down the exact asset, location, problem, timeline and who else is involved.',
        ...(adnoc ? [adnocLine] : []),
        'Show our experience with the same problem (see Drone work experience) and the matching product.',
        'Agree the next step on the spot: a follow-up meeting within 2 weeks (put a date), or an on-site trial / POC.',
        'Tumbler from the director. Tell the team lead today.',
      ],
      next: 'Follow-up meeting within 2 weeks or on-site POC: agree the date now.',
    }
  if (level === 'warm')
    return {
      level,
      title: 'Warm lead: show, then book a follow-up',
      summary: 'They are interested. Make it concrete with a demo and a clear follow-up.',
      why,
      actions: [
        'Show the most relevant demo, video or case study (Voliro on the calibration block, Dock 4, a matching service video).',
        'Ask: which assets? which problem? who decides? is there a budget or shutdown coming?',
        ...(adnoc ? [adnocLine] : []),
        'Exchange business cards or scan their badge; write their interest on the back of the card.',
        a.role === 'decision' || a.need === 'specific'
          ? 'Offer a follow-up meeting 2 weeks after ADIPEC; agree a date if you can.'
          : 'Invite them to the demo day in Abu Dhabi at the end of the month.',
        'Promise to send the brochure or case study next week, and do it.',
      ],
      next:
        a.role === 'decision' || a.need === 'specific'
          ? 'Follow-up meeting 2 weeks after ADIPEC.'
          : 'Demo day invitation and brochure by email next week.',
    }
  return {
    level,
    title: 'Cold lead: be friendly, keep the door open',
    summary: 'No concrete need yet. Leave a good impression in a few minutes.',
    why,
    actions: [
      'Give a short introduction and our business card.',
      'Scan their badge so we can send our newsletter and the demo day invitation.',
      'Point them to the website and our social media.',
      'Keep it to a few minutes if others are waiting.',
    ],
    next: 'Demo day invitation by email.',
  }
}

const today = () => new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function leadNote(a: Record<string, string>, r: Result, name: string, notes: string) {
  const ids = stepsFor(a.who)
  const answers = ids.map((id) => STEPS[id].choices.find((c) => c.id === a[id])?.label).filter(Boolean)
  return [
    `[${LEVEL_LABEL[r.level].toUpperCase()}] ADIPEC 2026`,
    name.trim() && `Visitor: ${name.trim()}`,
    `Profile: ${answers.join(' · ')}`,
    notes.trim() && `Need: ${notes.trim()}`,
    `Next step: ${r.next}`,
    `Met by: ${loadUser()?.name ?? '…'}, ${today()}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function VisitorCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [stepIdx, setStepIdx] = useState(0)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)

  const ids = stepsFor(answers.who)
  const total = ids.length + 1
  const done = stepIdx >= ids.length
  const step = done ? null : STEPS[ids[stepIdx]]
  const pct = Math.round(((stepIdx + 1) / total) * 100)
  const result = done ? resultFor(answers) : null

  const choose = (id: StepId, value: string) => {
    // A different visitor type changes which questions follow: drop the old answers.
    setAnswers((a) => (id === 'who' && a.who !== value ? { who: value } : { ...a, [id]: value }))
    setStepIdx((k) => k + 1)
    setCopied(false)
  }
  const back = () => {
    setStepIdx((k) => Math.max(0, k - 1))
    setCopied(false)
  }
  const restart = () => {
    setAnswers({})
    setStepIdx(0)
    setName('')
    setNotes('')
    setCopied(false)
  }

  const copy = async () => {
    if (!result) return
    const text = leadNote(answers, result, name, notes)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard blocked (http, old browser): fall back to a hidden textarea.
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
  }

  return (
    <div className="vc no-print">
      <div className="vc-title">Visitor check: answer a few questions to get the next step.</div>
      <div className="vc-progress">
        <span>
          Step {Math.min(stepIdx + 1, total)} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="vc-bar">
        <div style={{ width: `${pct}%` }} />
      </div>

      {step && (
        <>
          <div className="vc-q">{step.q}</div>
          <div className="vc-choices">
            {step.choices.map((c) => (
              <button
                key={c.id}
                className={answers[step.id] === c.id ? 'selected' : ''}
                onClick={() => choose(step.id, c.id)}
              >
                <span>{c.label}</span>
                {c.hint && <small>{c.hint}</small>}
              </button>
            ))}
          </div>
          {stepIdx > 0 && (
            <div className="vc-actions">
              <button onClick={back}>Back</button>
            </div>
          )}
        </>
      )}

      {result && (
        <>
          <div className={`vc-result vc-${result.level}`}>
            <div className="vc-result-head">
              <span className="vc-badge">{LEVEL_LABEL[result.level]}</span>
              <b>{result.title}</b>
            </div>
            <p>{result.summary}</p>
            <ul className="vc-why">
              {result.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <div className="vc-do">What to do now</div>
            <ol>
              {result.actions.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
            <div className="vc-next">
              <span>Next step</span>
              {result.next}
            </div>
          </div>

          <div className="vc-note">
            <div className="vc-do">Lead note for VisitConnect</div>
            <div className="vc-note-fields">
              <input placeholder="Visitor name, company, title" value={name} onChange={(e) => setName(e.target.value)} />
              <input placeholder="Their need, asset, location…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <pre>{leadNote(answers, result, name, notes)}</pre>
          </div>

          <div className="vc-actions">
            <button className="vc-primary" onClick={copy}>
              {copied ? 'Copied ✓' : 'Copy lead note'}
            </button>
            <button onClick={back}>Back</button>
            <button onClick={restart}>Next visitor</button>
          </div>
        </>
      )}
    </div>
  )
}
