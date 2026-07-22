# Clinical Practice Platform

A booking, notes, and billing platform for a live UK clinic. Handling
special-category health data under UK GDPR Article 9, which sets the bar for
everything else in the build.

This is a capability write-up. The source stays private. There is enough here
to judge the engineering and nothing you could lift.

---

## The job

The clinic runs the whole business by hand and across three or four disconnected
tools: bookings in one place, notes in another, invoices in a spreadsheet, and
the accounting typed in twice. The brief was to join that into one system that
runs the critical path with no manual hand-offs:

    book -> note -> invoice -> payment -> accounting

The part that makes it hard is not the CRUD. It is that a clinic deals in health
records and money at the same time, so two kinds of mistake are unacceptable: a
record that leaks, and a number that is silently wrong. Most of the engineering
went into making both of those impossible rather than merely unlikely.

## What shaped it

- **Article 9 data.** Clinical notes are special-category personal data. That
  ruled out anything casual about storage, logging, access, or deletion from day
  one. It is a constraint you design from, not one you bolt on later.
- **One backend, many faces.** Admin web, practitioner web, a client portal, a
  public booking page, and a mobile app with three separate roles. They all had
  to share one source of truth, so the API is the product and the clients are
  thin.
- **A real clinic on the other end.** Session packages, dual funding (part
  funder, part self-pay), room and practitioner availability, recurring
  appointments. Real rules, not a demo.

## What I built

A TypeScript monorepo: a NestJS API, a Next.js web app, an Expo mobile app, and
shared packages for the types, the SDK, and the UI so the same contract drives
every client. The API is described by a single OpenAPI contract, and the typed
client the web and mobile apps use is generated from it, so the three can never
drift apart quietly.

The money critical path is built and was verified end to end by driving it over
HTTP, not just by unit tests: a client is created, an appointment booked, an
encrypted note written, a dual-funding invoice raised, and a payment taken, with
the accounting export sitting behind it.

## The parts I am actually proud of

**Safety invariants live in the database, not in a hopeful `if` statement.**
The rules that must never break are enforced where they cannot be bypassed by a
future bug in application code:

- No double-booking a room or a practitioner, enforced by the database itself
  rather than by a check that a race condition can slip past.
- Money is stored as whole pence, never floats, so the classic rounding cent
  never appears.
- An invoice cannot be overpaid, a session cannot be billed twice, and an issued
  invoice cannot be edited. Each of those is a hard constraint, not a convention.
- A session-package cap that genuinely cannot be exceeded, checked at the data
  layer and again in the UI.

**Security that assumes the worst.** Passwords hashed with Argon2id. Short-lived
access tokens with rotating refresh tokens, and reuse detection that kills a
session the moment a stolen token is replayed. Mandatory app-based two-factor for
staff, verified end to end. Role-based access checked globally, plus per-record
ownership checks so a valid login still cannot read a record outside its
caseload. Clinical notes encrypted per record. Logs run through a redaction
allowlist so patient data never lands in a log line.

**The dependency supply chain is a gate, not an afterthought.** CI fails the
build on any new high-severity dependency advisory. The few accepted exceptions
are each written down with the reason they are safe in this codebase and the
exact condition that will clear them. This is the boring discipline that stops
the overnight breach nobody saw coming, and it is the thing a lot of fast-built
apps skip entirely.

**Honesty about what "done" means.** The system is built and demoed on seeded
fake data. It is deliberately held back from real patient data until a short list
of deploy-time items is signed off, transport encryption first. Shipping health
data before that list is closed would be the exact kind of mistake this whole
project exists to avoid, so it waits. Knowing where that line is, and refusing to
cross it early, is part of the job.

## Outcome

One system that runs the clinic's core workflow with no manual re-keying, built
to a compliance bar from the first commit, with the safety and money rules
enforced where they cannot quietly fail. The architecture is modular on purpose,
so the same hardened core has already seeded a second client build without
carrying any of the clinic's data or specifics across.

## What stays private

The source, the data model, the encryption and authentication implementation,
and anything that would let someone rebuild it. This page describes what it does
and the decisions behind it. If you want a deeper walkthrough, that happens
under an NDA.
