import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Reveal } from '../components/motion/Reveal'
import { MODULES, type ModuleSlug } from '../content/types'

/*
  Field names match the booking-crm-kit submission contract, so wiring this to
  the real backend is a fetch call rather than a rewrite.

  Until that backend exists the form does not pretend to submit. Showing a
  fake success message on a site that argues for honest measurement would be
  an odd way to open a relationship.
*/

const BACKEND_READY = false

const moduleKeys = Object.keys(MODULES) as ModuleSlug[]

const field =
  'w-full border-b border-rule bg-transparent px-0 py-3 text-ink placeholder:text-ink-4 ' +
  'transition-colors focus:border-accent focus:outline-none'

export default function Contact() {
  const [interests, setInterests] = useState<ModuleSlug[]>([])

  const toggle = (m: ModuleSlug) =>
    setInterests((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))

  return (
    <>
      <PageHeader
        label="Correspondence"
        title="Book a strategy call."
        lead="A working conversation, not a pitch. Tell us how the work moves through your business today and we will tell you where it is leaking."
      />

      <div className="sheet mt-[var(--spacing-section)] grid gap-x-14 gap-y-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Reveal>
          <form className="grid gap-9" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-9 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="type-label text-ink-3">Your name</span>
                <input name="name" required className={field} placeholder="Full name" />
              </label>
              <label className="grid gap-1">
                <span className="type-label text-ink-3">Business</span>
                <input name="company" className={field} placeholder="Company" />
              </label>
            </div>

            <div className="grid gap-9 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="type-label text-ink-3">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  className={field}
                  placeholder="you@business.com"
                />
              </label>
              <label className="grid gap-1">
                <span className="type-label text-ink-3">WhatsApp or phone</span>
                <input name="phone" className={field} placeholder="+880" />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="type-label text-ink-3">
                What is slowing you down right now?
              </span>
              <textarea
                name="message"
                rows={4}
                className={`${field} resize-y`}
                placeholder="The more specific, the more useful the first call will be."
              />
            </label>

            <fieldset>
              <legend className="type-label text-ink-3">
                What are you thinking about? (optional)
              </legend>
              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                {moduleKeys.map((m) => {
                  const on = interests.includes(m)
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(m)}
                      className={[
                        'type-label pb-1 transition-colors duration-300',
                        on
                          ? 'border-b-2 border-accent text-ink'
                          : 'border-b border-rule text-ink-3 hover:text-ink',
                      ].join(' ')}
                    >
                      {MODULES[m]}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div>
              <button
                type="submit"
                disabled={!BACKEND_READY}
                className="type-label border-b-2 border-accent pb-1 text-ink transition-opacity disabled:cursor-not-allowed disabled:border-rule disabled:text-ink-4"
              >
                Request a strategy call
              </button>

              {!BACKEND_READY && (
                <p className="type-note mt-5">
                  Booking goes live with the backend. Until then, email{' '}
                  <a href="mailto:hello@experius.xyz" className="link-underline text-ink">
                    hello@experius.xyz
                  </a>{' '}
                  and it reaches the same place.
                </p>
              )}
            </div>
          </form>
        </Reveal>

        <Reveal delay={0.08}>
          <aside className="rule-top pt-6">
            <p className="type-label text-ink-3">A note on this form</p>
            <div className="type-note mt-5 space-y-4">
              <p>
                When this is wired up it will run on exactly the stack we build for
                clients — real availability with slot locking, the request landing as a
                record in a real CRM, and a notification reaching a human without anyone
                refreshing a page.
              </p>
              <p>
                That is deliberate. The shortest honest demo we can give you is letting
                you use the thing we sell, on our own site, before you have paid us
                anything.
              </p>
              <p className="text-ink-2">
                It is not connected yet, so it says so rather than showing you a success
                message that means nothing.
              </p>
            </div>

            <dl className="mt-9 space-y-4 border-t border-rule-soft pt-6">
              <div>
                <dt className="type-label text-ink-3">Email</dt>
                <dd className="mt-1 text-small">
                  <a href="mailto:hello@experius.xyz" className="link-underline text-ink">
                    hello@experius.xyz
                  </a>
                </dd>
              </div>
              <div>
                <dt className="type-label text-ink-3">Based in</dt>
                <dd className="mt-1 text-small text-ink-2">Dhaka, Bangladesh</dd>
              </div>
            </dl>
          </aside>
        </Reveal>
      </div>
    </>
  )
}
