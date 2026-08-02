import type { CaseStudy } from '../types'

/*
  Deploy-ready, not live with a paying clinic — stated plainly rather than
  dressed up. Facts come from physio.md and DEVELOPER_HANDOFF.md in the
  Physio OS repository. Stripe is scaffolded but not wired, and that is said
  out loud rather than implied away.
*/

export const physioOs: CaseStudy = {
  slug: 'physio-os',
  kind: 'product',
  clientName: 'Physio OS',
  clientKind: 'Multi-tenant clinic management for physiotherapy practices',
  status: 'deploy-ready',
  year: '2026',
  summary:
    'A clinic operating system built for Bangladeshi physiotherapy practices — patients, appointments, treatment plans, invoices and WhatsApp follow-up, with each clinic sealed off at the database level.',

  intro:
    'Physiotherapy clinics run on repeat visits, and repeat visits run on people remembering to come back. Physio OS was built around that single fact: the treatment plan is the centre of the system, and everything else — scheduling, reminders, billing — hangs off it.',

  problem: {
    narrative:
      'Small clinics keep patients in a register, appointments in a diary and treatment history in the therapist\'s memory. Missed appointments are noticed late or not at all, follow-up depends on somebody being conscientious on a busy day, and billing is reconstructed at month end. Nothing scales past one location, and none of it survives a staff change.',
    painPoints: [
      'Patient history held informally, lost when staff move on',
      'Missed appointments noticed too late to rebook',
      'Follow-up dependent on someone remembering',
      'Receptionists able to see clinical notes they had no business seeing',
    ],
  },

  solution: {
    narrative:
      'Every clinic is a tenant, and separation is enforced in the database rather than in the interface — a query written wrongly in the front end still cannot return another clinic\'s patients. Treatment plans drive the automation: moving a plan to active, paused or completed fires the reminder and follow-up messages, so patient contact is a property of the clinical record instead of a task on somebody\'s list.',
    modulesUsed: ['smart-booking-crm', 'workflow-automation', 'analytics-dashboards', 'ai-chatbots'],
    moduleDetails: {
      'smart-booking-crm':
        'Patients, appointments, therapists and invoices, with role boundaries for receptionist, therapist and clinic admin enforced both in routing and at the database.',
      'workflow-automation':
        'Treatment-plan status changes trigger WhatsApp reminders and follow-ups through n8n — appointment reminders, plan activation, missed visits.',
      'analytics-dashboards':
        'Clinic-level reporting plus a super-admin view across tenants for platform operations.',
      'ai-chatbots':
        'A booking assistant available to patients outside clinic hours.',
    },
    architecture: [
      { id: 'intake', label: 'Patient intake', module: 'smart-booking-crm', feeds: ['plans'] },
      { id: 'plans', label: 'Treatment plans', module: 'smart-booking-crm', feeds: ['automation', 'billing'] },
      { id: 'automation', label: 'WhatsApp follow-up', module: 'workflow-automation' },
      { id: 'billing', label: 'Invoicing', module: 'smart-booking-crm', feeds: ['reports'] },
      { id: 'reports', label: 'Clinic reporting', module: 'analytics-dashboards' },
      { id: 'bot', label: 'Booking assistant', module: 'ai-chatbots', feeds: ['intake'] },
    ],
  },

  results: {
    narrative:
      'Physio OS is finished enough to stand up for a clinic and is not yet running one, so there are no patient or revenue figures to report and we are not going to imply otherwise. What exists is the architecture: tenant isolation enforced in the database, three role boundaries, a patient portal, and a subscription model scaffolded but not yet connected to a payment provider.',
    metrics: [
      {
        status: 'architectural',
        value: 'Row-level',
        label: 'Where one clinic is separated from another',
        provenance: 'RLS policies keyed to a clinic_id claim carried in the auth token',
      },
      {
        status: 'architectural',
        value: '3',
        label: 'Enforced roles — receptionist, therapist, clinic admin',
        provenance: 'Route guards plus database policy, not interface visibility alone',
      },
      {
        status: 'architectural',
        value: '4',
        label: 'Automated patient touchpoints driven by treatment-plan state',
        provenance: 'Appointment reminder, plan activation, session completion, missed appointment',
      },
      {
        status: 'pending',
        label: 'Clinic outcomes — attendance, rebooking, revenue per patient',
        note: 'Nothing to report until a first clinic is live. These will be measured, not modelled.',
      },
    ],
  },

  conclusion:
    'The system is ready for its first clinic. The honest summary is that it has been built and not yet proven, and the numbers that would prove it will be published here when they exist.',

  pullQuotes: [
    {
      text: 'Tenant separation is a database policy, not a filter in the front end. A mistake in the interface still cannot leak another clinic\'s patients.',
      attribution: 'EXPERIUS build notes',
      source: 'internal-build-note',
    },
  ],
}
