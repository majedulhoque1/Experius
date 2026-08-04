/* ══════════════════════════════════════════════════════════════════════
   Shared behaviours and rendering.

   Chrome (masthead, footer) and every repeated component is rendered
   from data rather than duplicated across seven HTML files — so a
   content change happens in one place.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var S = window.SITE
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  var SHOTS = '/shots/'

  /* Publishable anon key — safe in client code, RLS is the real boundary.
     Booking RPCs are SECURITY DEFINER and self-validate every input, so the
     browser talks to Supabase directly here (same pattern the kit's own
     reference site uses) rather than through our own /api layer. */
  var SUPABASE_URL = 'https://db.majedulhoqueshakil.com'
  var SUPABASE_ANON_KEY =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4NTU2NzM2MCwiZXhwIjo0OTQxMjQwOTYwLCJyb2xlIjoiYW5vbiJ9.hfzXBJxygzEP-m5ZmmJXhYtzJiByAzLorFGpj3alsA8'

  function supaRpc(fn, body) {
    return fetch(SUPABASE_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().then(function (b) {
        return { ok: r.ok, body: b }
      })
    })
  }

  var MARK =
    '<svg viewBox="0 0 507 366" fill="currentColor" aria-hidden="true">' +
    '<path d="M0 0 H144 L216 72 H0 Z"/><path d="M0 147 H291 L327 183 L291 219 H0 Z"/>' +
    '<path d="M0 293 H216 L144 365 H0 Z"/><path d="M257 0 H504 L380.5 129 Z"/>' +
    '<path d="M257 365 H504 L380.5 237 Z"/></svg>'

  /*
    Four destinations plus one standing CTA. Personal brand is a segment we
    serve, not a destination — it lives inside Projects, because a nav row is
    for places to go and not for things we would like you to know.
  */
  var NAV = [
    ['projects', 'Projects', '/projects'],
    ['products', 'Products', '/products'],
    ['case-studies', 'Case studies', '/case-studies'],
    ['about', 'About', '/about'],
  ]
  var NAV_ALL = NAV.concat([['contact', 'Contact', '/contact']])

  /* ── Module diagrams ─────────────────────────────────────────────
     One drawing language across the whole site: hairline boxes, dashed
     lines for anything carried by hand, the stamp colour for the record. */
  var DGM = {
    site:
      '<rect class="b" x="2" y="6" width="84" height="52"/><line class="l" x1="2" y1="18" x2="86" y2="18"/>' +
      '<rect class="fill" x="10" y="27" width="44" height="5"/><rect class="fill" x="10" y="37" width="62" height="5"/>' +
      '<rect class="kf" x="10" y="47" width="28" height="6"/>' +
      '<line class="l" x1="92" y1="32" x2="124" y2="32"/><polygon class="hd" points="126,32 118,28 118,36"/>' +
      '<rect class="b hot" x="132" y="18" width="86" height="28"/><text class="hot" x="175" y="36" text-anchor="middle">Record</text>',
    content:
      '<rect class="b" x="4" y="8" width="50" height="32"/><rect class="b" x="13" y="16" width="50" height="32"/>' +
      '<rect class="b fill" x="22" y="24" width="50" height="32"/>' +
      '<line class="l" x1="82" y1="36" x2="110" y2="36"/><polygon class="hd" points="112,36 104,32 104,40"/>' +
      '<rect class="fill" x="120" y="46" width="14" height="12"/><rect class="fill" x="140" y="36" width="14" height="22"/>' +
      '<rect class="fill" x="160" y="25" width="14" height="33"/><rect class="kf" x="180" y="12" width="14" height="46"/>',
    booking:
      '<g>' +
      [0, 1, 2, 3, 4]
        .map(function (c) {
          return [0, 1, 2]
            .map(function (r) {
              var x = 4 + c * 19,
                y = 10 + r * 16
              var hot = c === 2 && r === 1
              return (
                (hot ? '<rect class="k" x="' + x + '" y="' + y + '" width="16" height="12"/>' : '') +
                '<rect class="b' + (hot ? ' hot' : '') + '" x="' + x + '" y="' + y + '" width="16" height="12"/>'
              )
            })
            .join('')
        })
        .join('') +
      '</g>' +
      '<line class="l" x1="104" y1="32" x2="132" y2="32"/><polygon class="hd" points="134,32 126,28 126,36"/>' +
      '<rect class="b hot" x="140" y="18" width="78" height="28"/><text class="hot" x="179" y="36" text-anchor="middle">1 slot</text>',
    analytics:
      '<polyline class="l" points="6,50 34,40 62,44 90,26"/>' +
      '<circle class="hd" cx="6" cy="50" r="2.5"/><circle class="hd" cx="34" cy="40" r="2.5"/>' +
      '<circle class="hd" cx="62" cy="44" r="2.5"/><circle class="hd" cx="90" cy="26" r="2.5"/>' +
      '<line class="l dash hot" x1="90" y1="26" x2="118" y2="54"/><circle class="hd hot" cx="118" cy="54" r="3.5"/>' +
      '<line class="l" x1="6" y1="58" x2="126" y2="58"/>' +
      '<text class="hot tiny" x="134" y="50">Where</text><text class="hot tiny" x="134" y="60">it stalls</text>',
    automation:
      '<rect class="b hot" x="4" y="22" width="52" height="22"/><text class="hot" x="30" y="37" text-anchor="middle">Event</text>' +
      '<polyline class="l" points="60,33 78,33 78,12 106,12"/><polygon class="hd" points="108,12 100,8 100,16"/>' +
      '<line class="l" x1="60" y1="33" x2="106" y2="33"/><polygon class="hd" points="108,33 100,29 100,37"/>' +
      '<polyline class="l" points="60,33 78,33 78,54 106,54"/><polygon class="hd" points="108,54 100,50 100,58"/>' +
      '<rect class="b" x="114" y="3" width="52" height="18"/><rect class="b" x="114" y="24" width="52" height="18"/>' +
      '<rect class="b" x="114" y="45" width="52" height="18"/>',
    chatbot:
      '<path class="b" d="M4 10 H96 V40 H30 L18 52 V40 H4 Z"/>' +
      '<rect class="fill" x="14" y="19" width="52" height="5"/><rect class="fill" x="14" y="29" width="34" height="5"/>' +
      '<path class="b hot" d="M216 14 H124 V44 H190 L202 56 V44 H216 Z"/>' +
      '<text class="hot" x="170" y="33" text-anchor="middle">বাংলা</text>',
  }

  function svg(name) {
    return '<svg class="dgm" viewBox="0 0 220 64" aria-hidden="true">' + (DGM[name] || '') + '</svg>'
  }

  /* ── Chrome ──────────────────────────────────────────────────────── */

  /* Counted rather than typed, so the standing claim in the masthead can
     never drift away from the cabinet underneath it. "Ready" means built
     and deployable with nobody on it — it is not running, and the strip
     does not say it is. */
  function systemCount() {
    var ids = S.order.project.concat(S.order.product)
    var ready = ids.filter(function (id) { return S.cases[id].status === 'Ready' }).length
    return {
      running: ids.length - ready,
      ready: ready,
      total: ids.length,
    }
  }

  function chrome() {
    var page = document.body.dataset.page || ''
    var tabs = document.querySelector('[data-tabs]')
    if (tabs) {
      var n = systemCount()
      tabs.className = 'tabs'
      tabs.innerHTML =
        // The standing line: who this is for, and what is actually running.
        // One centred sentence, not a left/right split — it collapses on
        // scroll, a fact worth stating once and quietly, not a banner.
        '<div class="whofor"><div class="wrap">' +
        '<span class="who-line">Operating systems for <b>clinics</b>, <b>charities</b> and the people who run them.' +
        '<span class="who-stats"><i class="beat"></i>' + n.running + ' systems running &middot; ' +
        n.ready + ' deploy-ready &middot; Dhaka, working globally</span>' +
        '</span>' +
        '</div></div>' +

        '<div class="wrap bar">' +
        '<a class="filemark" href="/">' + MARK + '<b>EXPERIUS</b></a>' +
        '<div class="tabrow">' +
        NAV.map(function (t) {
          return '<a class="tab' + (t[0] === page ? ' on' : '') + '" href="' + t[2] + '">' + t[1] + '</a>'
        }).join('') +
        '</div>' +
        '<a class="headcta" href="/contact">Book a call<i>&rarr;</i></a>' +
        '</div>' +

        // Below 1000px the row becomes a scrollable strip rather than vanishing
        // behind a hamburger — every destination stays one tap away.
        '<div class="navstrip">' +
        NAV_ALL.map(function (t) {
          return '<a class="' + (t[0] === page ? 'on' : '') + '" href="' + t[2] + '">' + t[1] + '</a>'
        }).join('') +
        '</div>' +
        '<span class="prog"></span>'
    }

    var foot = document.querySelector('[data-footer]')
    if (foot) {
      foot.innerHTML =
        '<div class="wrap"><div class="foot">' +
        '<div>' + '<span style="display:block;width:30px;margin-bottom:.9rem">' + MARK + '</span>' +
        '<p>EXPERIUS builds the operating systems clinics, charities and service businesses run on — then stays on to keep improving them. Strategize, systemize, automate.</p></div>' +
        '<div><h4>Work</h4><ul>' +
        '<li><a href="/projects">Projects</a></li><li><a href="/products">Products</a></li>' +
        '<li><a href="/projects#founder-led">Founder-led brands</a></li></ul></div>' +
        '<div><h4>Evidence</h4><ul>' +
        '<li><a href="/case-studies">Case studies</a></li><li><a href="/#exam">The examination</a></li>' +
        '<li><a href="/about">How we work</a></li></ul></div>' +
        '<div><h4>Contact</h4><ul>' +
        '<li><a href="mailto:' + S.contact.email + '">' + S.contact.email + '</a></li>' +
        '<li>' + S.contact.city + '</li><li>Working globally</li></ul></div>' +
        '</div><div class="pagefoot">' +
        '<span>© 2026 Experius</span>' +
        '<span>Set in Spectral &amp; Archivo</span>' +
        '<span>Figures read 30 Jul 2026</span>' +
        '<a href="/admin">Admin</a>' +
        '</div></div>'
    }
  }

  /* ── Components ──────────────────────────────────────────────────── */

  /*
    A footnote. The honesty layer of this site — provenance definitions,
    withheld figures, "this is a worked example" — used to run as body copy
    in the main reading flow, where it cost about a tenth of every page and
    read like a company arguing with itself.

    It is all still here, one tap away. `<details>` so it works with no JS,
    keeps keyboard and screen-reader semantics for free, and the print
    stylesheet forces every one of them open — a printed page has no tap.
  */
  function fnote(label, html) {
    return (
      '<details class="fnote"><summary>' + (label || 'Note') + '</summary>' +
      '<div class="fnote-b">' + html + '</div></details>'
    )
  }

  function shotFrame(shot, cls) {
    return (
      '<div class="shot ' + (cls || '') + '"><div class="bar"><i></i><i></i><span>' + shot.label + '</span></div>' +
      '<img src="' + SHOTS + shot.src + '" alt="' + (shot.cap || shot.label).replace(/"/g, '') + '" loading="lazy"></div>'
    )
  }

  /*
    A plate is a rail card, not a case study. It used to carry the summary and
    the headline figure as well — both of which appear again within one screen
    of it, in the figure grid and on /case-studies. A rail's job is to be
    scanned; the file behind it is where the words live.
  */
  function plate(c) {
    var art = c.shots.length
      ? shotFrame({ src: c.shots[0].src, label: c.shots[0].label }, 'tall')
      : '<div class="shot"><div class="bar"><i></i><i></i><span>internal system — not published</span></div>' +
        '<div style="padding:2.2rem 1.2rem;background:var(--surface-2)">' + svg('analytics') + '</div></div>'
    return (
      '<a class="plate" href="/case?id=' + c.slug + '">' +
      '<span class="no"><span>No. ' + c.letter + '</span><span class="tag">' + c.status + '</span></span>' +
      art +
      '<h3>' + c.name + '</h3><span class="kind">' + c.clientKind + '</span>' +
      '<span class="fig"><span class="go">Open file &rarr;</span></span></a>'
    )
  }

  function renderCabinet(host, ids) {
    host.innerHTML = ids
      .map(function (id) {
        return plate(S.cases[id])
      })
      .join('')
  }

  function renderModules(host) {
    host.innerHTML = S.modules
      .map(function (m) {
        return (
          '<article class="mod"><span class="n">' + m.n + '</span>' + svg(m.dgm) +
          '<h3>' + m.name + '</h3><p>' + m.desc + '</p><span class="ph">' + m.phase + '</span></article>'
        )
      })
      .join('')
  }

  /*
    The seam diagram. Rendered as HTML rather than SVG so the type is real text
    at real sizes — the previous node-and-arrow drawing was unreadable because
    every label was 9px inside a viewBox.

    Every `gap` is six words or fewer. The clock and the hand-off count are the
    argument; a sentence under each row was commentary on a picture that
    already speaks. `clock` is the cell the scroll-scrub counts up (see
    seamClock in motion()) — it renders at its final value so no-JS and
    reduced-motion both land somewhere true.
  */
  function fmtClock(n, unit, suffix) {
    if (unit === 'min') {
      return n < 60 ? n + 'm' : Math.floor(n / 60) + 'h ' + (n % 60) + 'm'
    }
    return n + (suffix || '')
  }

  function seamPanel(d, good) {
    var rows = d.rows
      .map(function (r, i) {
        return (
          '<li data-i="' + i + '"><span class="at">' + r.at + '</span>' +
          '<span class="spine"><i class="dot"></i></span>' +
          '<span class="body"><span class="step">' + r.step + '</span>' +
          '<span class="gap"><i class="mk">' + (good ? '✓' : '✕') + '</i><span>' + r.gap + '</span></span>' +
          '</span></li>'
        )
      })
      .join('')
    var c = d.clock
    var clock = c
      ? '<div class="tl-clock"><span>' + c.label + '</span>' +
        '<b data-clock="' + c.to + '" data-unit="' + c.unit + '" data-suffix="' + (c.suffix || '') + '">' +
        fmtClock(c.to, c.unit, c.suffix) + '</b></div>'
      : ''
    var meta = d.meta
      .map(function (m) {
        return '<div><span>' + m[0] + '</span><b>' + m[1] + '</b></div>'
      })
      .join('')
    return (
      '<div class="seam' + (good ? ' good' : '') + '">' +
      '<div class="cap"><h4>' + d.title + '</h4><span>' + d.note + '</span></div>' +
      '<ol class="tl">' + rows + '</ol>' +
      clock +
      '<div class="tl-meta">' + meta + '</div>' +
      '<p class="out">' + d.out + '</p>' +
      '</div>'
    )
  }

  function renderSeams(host, data) {
    host.innerHTML =
      seamPanel(data.today, false) +
      seamPanel(data.after, true) +
      '<div class="seam-note">' +
      fnote(
        'Where these times come from',
        'A worked example, not a measured client figure. Every other number on this ' +
          'site carries its provenance, so this one says what it is.',
      ) +
      '</div>'
  }

  var STATUS_CLASS = { Live: 'live', Ready: 'ready', 'In use': 'inuse' }

  /* Compact evidence rail: the running systems, with real thumbnails. */
  function renderLive(host, ids) {
    host.innerHTML =
      '<div class="lp-head"><span>Live right now</span><span class="lp-count">' + ids.length + ' systems</span></div>' +
      '<div class="lp-body">' +
      ids
        .map(function (id) {
          var c = S.cases[id]
          var thumb = c.shots.length
            ? '<img src="' + SHOTS + c.shots[0].src + '" alt="' + c.name + '" loading="lazy">'
            : '<span class="noimg">Internal</span>'
          /* Name and status only. The rail sits in the hero, where every extra
             word competes with the headline; the kind is on the plate below. */
          return (
            '<a class="lp-row" href="/case?id=' + c.slug + '">' + thumb +
            '<span class="nm">' + c.name + '</span>' +
            '<span class="st ' + (STATUS_CLASS[c.status] || '') + '">' + c.status + '</span></a>'
          )
        })
        .join('') +
      '</div>'
  }

  var SRC_LABEL = { measured: 'Measured', construction: 'By construction', pending: 'Pending' }

  /* What the three provenance words mean. This was 65 words of body copy under
     a headline that had already made the point; it is a footnote now. The
     chip on every figure is the part that has to be visible. */
  var PROVENANCE_NOTE =
    '<b>Measured</b> — read from a live database on the stated date. ' +
    '<b>By construction</b> — true because of how the system is built. ' +
    '<b>Pending</b> — instrumented, not yet meaningful. We print it rather than round it up.'

  function renderFigures(host, metrics, legend) {
    host.innerHTML =
      metrics
        .map(function (m) {
          /* A figure that is itself a percentage gets a proportional bar
             under the number — free once, applies everywhere a % appears. */
          var pct = /^(\d{1,3})%$/.exec(m.v)
          var bar = pct ? '<span class="fig-bar"><i style="width:' + pct[1] + '%"></i></span>' : ''
          return (
            '<div class="fig-cell' + (m.s === 'pending' ? ' pending' : '') + '">' +
            '<span class="v fignum">' + m.v + '</span>' + bar + '<p>' + m.l + '</p>' +
            '<span class="src' + (m.s === 'measured' ? ' m' : '') + '">' + SRC_LABEL[m.s] + ' · ' + m.src + '</span></div>'
          )
        })
        .join('') +
      (legend ? '<div class="fig-legend">' + fnote('What these three words mean', PROVENANCE_NOTE) + '</div>' : '')
  }

  function renderExhibits(host, ids) {
    host.innerHTML = ids
      .map(function (id) {
        var c = S.cases[id]
        var art = c.shots.length
          ? '<a class="shotlink" href="/case?id=' + c.slug + '">' + shotFrame(c.shots[0]) + '</a>'
          : '<div class="shot"><div class="bar"><i></i><i></i><span>internal system — not published</span></div>' +
            '<div style="padding:1.8rem 1.2rem;background:var(--surface-2)">' + svg('analytics') + '</div></div>'
        return (
          '<article class="exhibit" data-r><div class="letter">' + c.letter + '</div>' +
          '<div>' + art + '</div>' +
          '<div><h3><a href="/case?id=' + c.slug + '">' + c.name + '</a>' +
          '<span class="kind">' + c.clientKind + ' · ' + c.status + '</span></h3>' +
          '<p style="margin-top:.9rem">' + c.summary + '</p>' +
          '<p class="rec"><b>' + c.headlineFig.v + '</b> ' + c.headlineFig.l + '</p>' +
          '<p style="margin-top:1rem"><a class="act" href="/case?id=' + c.slug + '">Open the file &rarr;</a></p>' +
          '</div></article>'
        )
      })
      .join('')
  }

  /* ── The examination ─────────────────────────────────────────────── */
  function examination(host) {
    var E = S.exam
    host.innerHTML =
      // These sit on the dark bar, so they need their own light-on-dark styles —
      // the generic .typed label is dark ink and would vanish here.
      '<div class="exam-head"><span class="lbl">Examine your business — 8 questions</span>' +
      '<span class="count" id="counter">0 of 8 marked</span></div>' +
      '<p class="exam-teaser">Tick what is true. We draw you a free one-page map.</p>' +
      '<div class="exam-body"><div id="qs">' +
      E.questions
        .map(function (q) {
          return (
            '<label class="q"><input type="checkbox" data-qid="' + q.id + '" data-mod="' + q.mod + '">' +
            '<span class="box"></span><span class="t">' + q.t + '</span></label>'
          )
        })
        .join('') +
      '<div class="examother"><label for="examOther">Something else?</label>' +
      '<textarea id="examOther" rows="2" placeholder="In your own words &mdash; e.g. we&#8217;re ' +
      'drowning in WhatsApp and nobody owns it."></textarea></div>' +
      '</div><aside class="finding"><span class="typed">Preliminary finding</span>' +
      '<div class="gauge"><i id="gauge"></i></div>' +
      '<p class="verdict" id="verdict"></p><p class="detail" id="detail"></p>' +
      '<div class="indicated" id="indicated" hidden><span class="typed">Indicated modules</span>' +
      '<div class="chips" id="chips"></div></div></aside></div>' +
      '<div class="exam-foot"><span class="typed">Runs in your browser. Nothing stored.</span></div>'

    var boxes = [].slice.call(host.querySelectorAll('#qs input'))
    var otherEl = host.querySelector('#examOther')
    var verdict = host.querySelector('#verdict')
    var detail = host.querySelector('#detail')
    var gauge = host.querySelector('#gauge')
    var counter = host.querySelector('#counter')
    var chips = host.querySelector('#chips')
    var indicated = host.querySelector('#indicated')

    function otherText() {
      return (otherEl.value || '').trim()
    }

    function update() {
      var marked = boxes.filter(function (b) { return b.checked })
      var n = marked.length
      var mods = []
      marked.forEach(function (b) { if (mods.indexOf(b.dataset.mod) === -1) mods.push(b.dataset.mod) })

      if (!n && otherText()) {
        verdict.textContent = 'Got it.'
        detail.textContent = 'The map works from that alone. Ticking anything true above gives it more to go on.'
      } else {
        verdict.textContent = E.verdicts[n].v
        detail.textContent = E.verdicts[n].d
      }
      gauge.style.width = (n / 8) * 100 + '%'
      counter.textContent = n + ' of 8 marked'

      if (!n) { indicated.hidden = true; chips.innerHTML = ''; return }
      indicated.hidden = false
      chips.innerHTML = mods
        .map(function (m, i) {
          return '<span class="chip" style="animation-delay:' + i * 45 + 'ms">' + m + '</span>'
        })
        .join('')
    }
    boxes.forEach(function (b) { b.addEventListener('change', update) })
    otherEl.addEventListener('input', update)
    update()

    leakMap(host, boxes, otherEl)
  }

  /* ── The Leak Map ────────────────────────────────────────────────
     The site promises "a one-page map of where the work leaks" as the
     outcome of the first meeting. This makes that promise redeemable on the
     spot: generated follow-ups, then the map itself.

     Every failure path — no key, rate limited, over budget, model error —
     leaves the examination exactly as it was. The verdict above is the
     conversion device and never depends on this working. */
  function leakMap(host, boxes, otherEl) {
    var stage = document.createElement('div')
    stage.className = 'mapstage'
    host.parentNode.insertBefore(stage, host.nextSibling)

    var marked = function () {
      return boxes.filter(function (b) { return b.checked }).map(function (b) { return b.dataset.qid })
    }
    var otherPain = function () {
      return (otherEl.value || '').trim()
    }

    /* Preview mode: ?demo=1 renders a worked sample instead of calling the API,
       so the map UI can be reviewed before any key exists and without spending
       anything. Clearly labelled — it is never shown to a real visitor. */
    var DEMO = /[?&]demo=1/.test(location.search)
    var DEMO_FOLLOWUPS = [
      { question: 'Roughly how many enquiries reach you in a week?',
        placeholder: 'About fifteen' },
      { question: 'Who currently retypes a booking into the calendar?',
        placeholder: 'The front desk, usually in the evening' },
    ]
    /* Shapes must match lib/examination/schema.ts exactly — one arithmetic,
       two unknowns, single-sentence summary and `why`. */
    var DEMO_MAP = {
      headline: 'Your enquiries survive the first hour and lose the next fourteen.',
      summary: 'You marked three joins that a person carries by hand, each one a place ' +
        'where information moves between two tools that could read from the same record.',
      trace: [
        { step: 'An enquiry arrives in the evening', seam: 'Nobody sees it until morning.' },
        { step: 'You reply by message the next day', seam: 'Details retyped into the calendar.' },
        { step: 'The booking is written down', seam: 'Nothing records where it came from.' },
        { step: 'The appointment happens', seam: null },
      ],
      costliest: {
        step: 'The overnight gap between arrival and reply',
        why: 'On these answers it is the only step where you lose people before ever speaking to them.',
      },
      arithmetic: [
        { label: 'What the overnight gap is worth',
          formula: '(enquiries arriving after 9pm last month) x (your close rate) x (average job value)',
          note: 'Your messaging app will show the timestamps.' },
      ],
      indicated: [
        { module: 'AI Chatbots', because: 'You marked that after-hours enquiries wait until morning.' },
        { module: 'Smart Booking & CRM', because: 'You marked that the same detail gets typed in more than one place.' },
        { module: 'Workflow Automation', because: 'You marked that follow-ups depend on somebody remembering.' },
      ],
      unknowns: [
        'Whether the after-hours enquiries are price shoppers or serious buyers',
        'Whether the retyping is five minutes or twenty-five',
      ],
    }

    function post(payload) {
      if (DEMO) {
        return new Promise(function (r) {
          setTimeout(function () {
            r(payload.stage === 'followups'
              ? { deterministic: {}, followUps: DEMO_FOLLOWUPS }
              : { deterministic: {}, map: DEMO_MAP })
          }, 700)
        })
      }
      return fetch('/api/examine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(function (r) { return r.json() })
    }

    function offer() {
      stage.innerHTML =
        '<div class="mapcta"><div><h4>Want the map now?</h4>' +
        '<p>Two more questions and we draw where your work leaks. Yours either way.</p></div>' +
        '<button class="act red" type="button">Draw my map &rarr;</button></div>'
      stage.querySelector('button').addEventListener('click', askFollowUps)
    }

    function busy(msg) {
      stage.innerHTML = '<div class="mapbusy"><span class="spin"></span>' + msg + '</div>'
    }

    /* Degrading is not an error state — the visitor already has a complete
       result. Say what is true and point at the meeting. */
    function degrade(reason) {
      var why = reason === 'rate'
        ? 'You have run this a few times. The map is still yours — just ask.'
        : 'The map is drawn by hand at the moment.'
      stage.innerHTML =
        '<div class="mapcta"><div><h4>Come and get the full map</h4>' +
        '<p>' + why + ' 90 minutes, no slides, and you keep it either way.</p></div>' +
        '<a class="act red" href="/contact">Book the first meeting &rarr;</a></div>'
    }

    function askFollowUps() {
      var ids = marked()
      if (!ids.length && !otherPain()) return
      busy('Reading your answers&hellip;')
      post({ stage: 'followups', markedIds: ids, otherPain: otherPain() }).then(function (res) {
        if (!res.followUps || !res.followUps.length) return degrade(res.degraded)
        // Identity sits on the same form as the follow-ups rather than in a
        // step of its own — one wall between them and the map, not two.
        stage.innerHTML =
          '<div class="mapform"><h4>A few more, then the map.</h4>' +
          '<p class="mapform-note">Rough answers are fine. Skip any — the map says what it could not know.</p>' +
          res.followUps.map(function (q, i) {
            return '<label class="mapq"><span>' + q.question + '</span>' +
              '<input type="text" data-fq="' + i + '" placeholder="' +
              String(q.placeholder).replace(/"/g, '&quot;') + '"></label>'
          }).join('') +
          '<div class="mapid">' +
          '<label class="mapq"><span>Your name</span>' +
          '<input type="text" data-id="name" autocomplete="name" placeholder="Rafiq Hasan"></label>' +
          '<label class="mapq"><span>Where should we send it?</span>' +
          '<input type="email" data-id="email" autocomplete="email" placeholder="you@yourbusiness.com"></label>' +
          '</div>' +
          '<p class="maperr" hidden></p>' +
          '<button class="act red" type="button">Draw the map &rarr;</button>' +
          '<p class="mapform-note" style="margin-top:.9rem">We email it and keep a copy. ' +
          'No list, no sequence, no sharing.</p></div>'

        var inputs = [].slice.call(stage.querySelectorAll('[data-fq]'))
        var nameEl = stage.querySelector('[data-id="name"]')
        var mailEl = stage.querySelector('[data-id="email"]')
        var err = stage.querySelector('.maperr')

        function submit() {
          var name = nameEl.value.trim()
          var email = mailEl.value.trim()
          // Mirror the server's rule so the visitor is corrected here rather
          // than by a round trip that looks like a failure.
          if (name.length < 2) return show('We need a name to put on it.', nameEl)
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return show('That email does not look right.', mailEl)
          err.hidden = true
          drawMap(ids, res.followUps.map(function (q, i) {
            return { question: q.question, answer: inputs[i].value }
          }), name, email)
        }
        function show(msg, el) {
          err.textContent = msg
          err.hidden = false
          el.focus()
        }

        stage.querySelector('button').addEventListener('click', submit)
        stage.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); submit() }
        })
        inputs[0] && inputs[0].focus()
      }).catch(function () { degrade('error') })
    }

    function drawMap(ids, answers, name, email) {
      busy('Drawing your map&hellip;')
      post({ stage: 'map', markedIds: ids, followUps: answers, name: name, email: email, otherPain: otherPain() })
        .then(function (res) {
        if (!res.map) return degrade(res.degraded)
        render(res.map)
      }).catch(function () { degrade('error') })
    }

    function esc(s) {
      return String(s).replace(/[&<>]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]
      })
    }

    /*
      The site promises a ONE-PAGE map. This used to render at ~350 words and
      four phone screens, most of it framing: five sentence-length headings
      and two notes explaining things the content already shows. A formula
      made of variables does not need a paragraph saying we cannot know your
      numbers — that is visible in the formula.

      Headings are labels now. The prose that survives is the model's.
    */
    function render(m) {
      stage.innerHTML =
        '<article class="leakmap">' +
        '<div class="lm-head"><span class="typed">' + (DEMO ? 'Sample map' : 'Your map') + '</span>' +
        '<span class="typed">' + (DEMO ? 'Worked example' : 'From your answers') + ' &middot; ' +
        new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        '</span></div>' +
        '<h3 class="lm-headline">' + esc(m.headline) + '</h3>' +
        '<p class="lm-summary">' + esc(m.summary) + '</p>' +

        '<div class="lm-section"><h4>Today</h4>' +
        '<ol class="tl">' + m.trace.map(function (t) {
          return '<li><span class="at"></span><span class="spine"><i class="dot"></i></span>' +
            '<span class="body"><span class="step">' + esc(t.step) + '</span>' +
            (t.seam ? '<span class="gap"><i class="mk">&#10005;</i><span>' + esc(t.seam) + '</span></span>' : '') +
            '</span></li>'
        }).join('') + '</ol></div>' +

        '<div class="lm-section lm-costliest"><h4>Costliest step</h4>' +
        '<p class="lm-step">' + esc(m.costliest.step) + '</p>' +
        '<p>' + esc(m.costliest.why) + '</p></div>' +

        /* One calculation, even when the model sends two — same reason as
           `unknowns` below: the schema stays tolerant so an extra item cannot
           discard a map the visitor has already paid for with their details. */
        '<div class="lm-section"><h4>Worth knowing</h4>' +
        m.arithmetic.slice(0, 1).map(function (a) {
          return '<div class="lm-sum"><b>' + esc(a.label) + '</b>' +
            '<code>' + esc(a.formula) + '</code><span>' + esc(a.note) + '</span></div>'
        }).join('') + '</div>' +

        '<div class="lm-section"><h4>Build order</h4>' +
        '<ol class="lm-modules">' + m.indicated.map(function (i) {
          return '<li><b>' + esc(i.module) + '</b><span>' + esc(i.because) + '</span></li>'
        }).join('') + '</ol></div>' +

        /* Two, even when the model sends three — the schema stays tolerant on
           the way back so a third line cannot discard a paid-for map. */
        '<div class="lm-section lm-unknowns"><h4>Not known</h4>' +
        '<ul>' + m.unknowns.slice(0, 2).map(function (u) { return '<li>' + esc(u) + '</li>' }).join('') + '</ul></div>' +

        '<div class="lm-foot"><a class="act red" href="/contact">Take this into a working session &rarr;</a>' +
        '<button class="act" type="button" onclick="window.print()">Print or save as PDF</button></div>' +
        '</article>'
      stage.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    function sync() { stage.hidden = marked().length === 0 && !otherPain() }
    boxes.forEach(function (b) { b.addEventListener('change', sync) })
    otherEl.addEventListener('input', sync)
    offer()
    sync()
  }

  /* ── Booking widget ──────────────────────────────────────────────── */
  var WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  function isoDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }
  function fmtTime12(t) {
    var parts = t.split(':')
    var h = Number(parts[0])
    var m = parts[1]
    var ap = h >= 12 ? 'pm' : 'am'
    var h12 = h % 12 || 12
    return h12 + (m === '00' ? '' : ':' + m) + ap
  }
  function fmtFullDate(iso) {
    var d = new Date(iso + 'T00:00:00')
    return WEEKDAY_SHORT[d.getDay()] + ', ' + MONTH_SHORT[d.getMonth()] + ' ' + d.getDate()
  }

  function bookingWidget(host) {
    var state = { step: 'loading', byDate: {}, days: [], selDay: null, selTime: null }

    function render() {
      if (state.step === 'loading') {
        host.innerHTML = '<div class="book"><p class="book-msg">Loading the calendar…</p></div>'
        return
      }
      if (state.step === 'load-error') {
        host.innerHTML = '<div class="book"><p class="book-msg">Could not load the calendar. ' +
          '<a href="mailto:' + S.contact.email + '">Email us instead</a> and we will find a time.</p></div>'
        return
      }
      if (state.step === 'no-slots') {
        host.innerHTML = '<div class="book"><p class="book-msg">No open times right now. ' +
          '<a href="mailto:' + S.contact.email + '">Email us</a> and we will make one.</p></div>'
        return
      }
      if (state.step === 'select') {
        var times = state.selDay ? state.byDate[state.selDay] || [] : []
        host.innerHTML =
          '<div class="book">' +
          '<div class="book-days">' +
          state.days.map(function (d) {
            var dt = new Date(d + 'T00:00:00')
            return '<button type="button" class="book-day' + (d === state.selDay ? ' on' : '') + '" data-day="' + d + '">' +
              WEEKDAY_SHORT[dt.getDay()] + '<b>' + dt.getDate() + '</b>' + MONTH_SHORT[dt.getMonth()] + '</button>'
          }).join('') +
          '</div>' +
          (!state.selDay
            ? '<p class="book-msg">Pick a date to see open times. All times are local to you.</p>'
            : times.length === 0
              ? '<p class="book-msg">No open times that day.</p>'
              : '<div class="book-times">' +
                times.map(function (t) { return '<button type="button" class="book-time" data-time="' + t + '">' + fmtTime12(t) + '</button>' }).join('') +
                '</div>') +
          '</div>'

        host.querySelectorAll('[data-day]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.selDay = btn.getAttribute('data-day')
            state.selTime = null
            render()
          })
        })
        host.querySelectorAll('[data-time]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.selTime = btn.getAttribute('data-time')
            state.step = 'details'
            render()
          })
        })
        return
      }
      if (state.step === 'details') {
        host.innerHTML =
          '<div class="book">' +
          '<button type="button" class="book-back" data-back>&larr; Choose a different time</button>' +
          '<div class="book-summary"><b>' + fmtFullDate(state.selDay) + '</b> at <b>' + fmtTime12(state.selTime) + '</b></div>' +
          '<form data-book-form>' +
          '<label class="enq-field"><span>Your name</span><input type="text" name="name" autocomplete="name" required></label>' +
          '<label class="enq-field"><span>Phone</span><input type="tel" name="phone" autocomplete="tel" required></label>' +
          '<label class="enq-field"><span>Clinic, charity or business <i>optional</i></span><input type="text" name="business" autocomplete="organization"></label>' +
          '<label class="enq-field"><span>What is going wrong? <i>optional</i></span>' +
          '<textarea name="concern" rows="3" placeholder="A sentence or two is plenty — we will ask more in the meeting."></textarea></label>' +
          '<div class="enq-foot"><button class="act red" type="submit">Request this time &rarr;</button>' +
          '<span class="enq-note">We confirm by phone. Nothing is final until we do.</span></div>' +
          '<div class="enq-status" data-status hidden></div>' +
          '</form></div>'

        host.querySelector('[data-back]').addEventListener('click', function () {
          state.step = 'select'
          state.selTime = null
          render()
        })

        var form = host.querySelector('[data-book-form]')
        var status = form.querySelector('[data-status]')
        var btn = form.querySelector('button[type="submit"]')

        function show(kind, html) {
          status.className = 'enq-status ' + kind
          status.innerHTML = html
          status.hidden = false
        }

        function field(n) { return form.querySelector('[name="' + n + '"]') }

        form.addEventListener('submit', function (e) {
          e.preventDefault()
          var name = field('name').value.trim()
          var phone = field('phone').value.trim()
          if (name.length < 2 || phone.length < 6) {
            show('bad', 'A name and a real phone number get this confirmed — both are missing something.')
            return
          }
          btn.disabled = true
          var label = btn.textContent
          btn.textContent = 'Sending…'

          supaRpc('request_booking', {
            p_name: name,
            p_phone: phone,
            p_child_age: null,
            p_branch: 'EXPERIUS',
            p_concern: field('concern').value.trim() || null,
            p_slot_date: state.selDay,
            p_slot_time: state.selTime,
            p_language: 'en',
          })
            .then(function (res) {
              var result = res.body
              if (res.ok && result && result.status === 'ok') {
                host.innerHTML = '<div class="book"><div class="enq-status good" style="margin-top:0">' +
                  '<b>That time is requested.</b>We confirm by phone, usually the same day. ' +
                  'Nothing is final until we do.</div></div>'
                return
              }
              if (result && (result.status === 'slot_taken' || result.status === 'invalid_slot')) {
                show('bad', 'That time just went. Pick another below.')
                state.step = 'select'
                state.selTime = null
                loadSlots()
                return
              }
              show('bad', 'That did not go through. <a href="mailto:' + S.contact.email +
                '">Email us instead</a> and we will find a time.')
            })
            .catch(function () {
              show('bad', 'That did not reach us — most likely your connection. ' +
                '<a href="mailto:' + S.contact.email + '">Email it instead</a>.')
            })
            .finally(function () {
              btn.disabled = false
              btn.textContent = label
            })
        })
      }
    }

    function loadSlots() {
      state.step = 'loading'
      render()
      var from = new Date()
      var to = new Date()
      to.setDate(to.getDate() + 45)
      supaRpc('get_available_slots', { p_from: isoDate(from), p_to: isoDate(to) })
        .then(function (res) {
          if (!res.ok || !Array.isArray(res.body)) throw new Error('bad response')
          var byDate = {}
          res.body.forEach(function (s) {
            var t = s.slot_time.slice(0, 5)
            if (!byDate[s.slot_date]) byDate[s.slot_date] = []
            byDate[s.slot_date].push(t)
          })
          var days = Object.keys(byDate).sort()
          state.byDate = byDate
          state.days = days
          state.step = days.length ? 'select' : 'no-slots'
          render()
        })
        .catch(function () {
          state.step = 'load-error'
          render()
        })
    }

    loadSlots()
  }

  /* ── Inquiry form ────────────────────────────────────────────────
     Mirrors the server's validation so the visitor is corrected here rather
     than by a round trip. On any backend failure it hands back a mailto that
     already contains everything they typed — a form that silently loses an
     enquiry is the exact failure this company argues against, so it must never
     report success it did not achieve. */
  function inquiryForm(form) {
    var status = form.querySelector('[data-status]')
    var btn = form.querySelector('button[type="submit"]')

    function field(name) { return form.querySelector('[name="' + name + '"]') }
    function mark(name, msg) {
      var el = field(name)
      if (!el) return
      var wrap = el.closest('.enq-field')
      wrap.classList.toggle('bad', !!msg)
      var em = wrap.querySelector('[data-err="' + name + '"]')
      if (em) em.textContent = msg || ''
    }
    function clear() { ['name', 'email', 'message'].forEach(function (n) { mark(n, '') }) }

    function localErrors(v) {
      var e = {}
      if (v.name.length < 2) e.name = 'Tell us who you are.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = 'That email does not look right.'
      if (v.message.length < 10) e.message = 'A sentence or two about what is going wrong.'
      return e
    }

    function show(kind, html) {
      status.className = 'enq-status ' + kind
      status.innerHTML = html
      status.hidden = false
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      clear()
      status.hidden = true

      var v = {
        name: (field('name').value || '').trim(),
        email: (field('email').value || '').trim(),
        business: (field('business').value || '').trim(),
        message: (field('message').value || '').trim(),
        website: (field('website').value || '').trim(),
      }

      var errs = localErrors(v)
      var names = Object.keys(errs)
      if (names.length) {
        names.forEach(function (n) { mark(n, errs[n]) })
        field(names[0]).focus()
        return
      }

      btn.disabled = true
      var label = btn.textContent
      btn.textContent = 'Sending…'

      fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      })
        .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b } }) })
        .then(function (res) {
          if (res.b && res.b.ok) {
            show('good', '<b>That is with us.</b>You will hear back from a co-founder, usually the ' +
              'same day. If it is urgent, reply to the confirmation and say so.')
            form.reset()
            return
          }
          if (res.b && res.b.error === 'invalid' && res.b.fields) {
            Object.keys(res.b.fields).forEach(function (n) { mark(n, res.b.fields[n]) })
            return
          }
          // Never claim success we did not get.
          show('bad', 'We could not save that just now, and we would rather tell you than ' +
            'pretend otherwise. <a href="' + (res.b && res.b.mailto ? res.b.mailto : 'mailto:hello@experius.xyz') +
            '">Send it by email instead</a> — everything you typed is already in there.')
        })
        .catch(function () {
          show('bad', 'That did not reach us — most likely your connection. ' +
            '<a href="mailto:hello@experius.xyz">Email it instead</a> and nothing is lost.')
        })
        .finally(function () {
          btn.disabled = false
          btn.textContent = label
        })
    })
  }

  /* ── Masthead behaviour ──────────────────────────────────────────
     Two jobs on one scroll listener, both write-only against style, and
     both read scroll position once — no layout is measured per frame.

     1. Past the fold the standing ICP line collapses and the bar
        condenses, so the chrome gets out of the way of the reading.
     2. A hairline in the accent tracks position through the document.
        This is the one moving thing in the header and it is the reason
        the bar reads as an instrument rather than a navbar. */
  function masthead() {
    var tabs = document.querySelector('.tabs')
    if (!tabs) return
    var prog = tabs.querySelector('.prog')
    var ticking = false

    function paint() {
      ticking = false
      var y = window.scrollY || document.documentElement.scrollTop
      tabs.classList.toggle('tight', y > 48)
      if (!prog) return
      var max = document.documentElement.scrollHeight - window.innerHeight
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')'
    }
    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(paint)
    }

    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    paint()
  }

  /* ── Motion ──────────────────────────────────────────────────────── */
  /*
    The signature moment. As a seam panel scrolls through the viewport its rows
    arrive one at a time and the clock cell counts up with them — 0 to 13h 21m
    on the left, 0 to 2m on the right. The collapse between those two numbers
    is the entire argument of this company, and it now makes it without a
    paragraph underneath.

    Scroll-driven rather than a one-shot animation, so the visitor controls it
    and can run it back. Same passive-listener shape as the .cab-rail tracker
    below; this is a zero-dependency static build and stays that way.
  */
  function seamClock() {
    var panels = [].slice.call(document.querySelectorAll('.seam'))
    if (!panels.length) return

    var live = panels.map(function (p) {
      return {
        el: p,
        rows: [].slice.call(p.querySelectorAll('.tl > li')),
        clock: p.querySelector('[data-clock]'),
        peak: -1,
      }
    })

    // Reduced motion: everything at its final value, no scroll handler at all.
    if (reduce) {
      live.forEach(function (p) { p.rows.forEach(function (r) { r.classList.add('lit') }) })
      return
    }

    /*
      Monotonic on purpose. The scrub runs as you come down the page, but the
      clock never counts back down — scrolling up to re-read the headline must
      not leave "0m" sitting where the payoff was, and a full-page screenshot
      or a print taken after a read has to show the real figure. It only ever
      rises to its true value and stays there.
    */
    function paint() {
      live.forEach(function (p) {
        var b = p.el.getBoundingClientRect()
        // 0 when the panel's top reaches the lower third, 1 once it has risen
        // by its own height. Clamped, so a short panel still completes.
        var span = Math.max(b.height, 1)
        var t = Math.min(1, Math.max(0, (innerHeight * 0.72 - b.top) / span))
        if (t <= p.peak) return
        p.peak = t

        var n = p.rows.length
        p.rows.forEach(function (r, i) {
          if (t >= (i + 0.35) / n) r.classList.add('lit')
        })
        if (!p.clock) return
        var to = +p.clock.dataset.clock
        p.clock.textContent = fmtClock(
          Math.round(to * t),
          p.clock.dataset.unit,
          p.clock.dataset.suffix,
        )
      })
    }

    var queued = false
    function onScroll() {
      if (queued) return
      queued = true
      requestAnimationFrame(function () { queued = false; paint() })
    }
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    paint()
  }

  function motion() {
    if (reduce) { document.body.classList.add('ready') }
    else {
      document.querySelectorAll('.rise > span').forEach(function (l, i) {
        l.style.transitionDelay = 0.15 + i * 0.09 + 's'
      })
      setTimeout(function () { document.body.classList.add('ready') }, 60)
    }

    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )
    document.querySelectorAll('[data-r]').forEach(function (n) { io.observe(n) })

    seamClock()

    var cab = document.querySelector('.cabinet')
    if (!cab) return
    var plates = cab.querySelectorAll('.plate')
    var cio = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return
          plates.forEach(function (p, i) { setTimeout(function () { p.classList.add('in') }, i * 110) })
          cio.disconnect()
        })
      },
      { threshold: 0.12 },
    )
    cio.observe(cab)

    var bar = document.querySelector('.cab-rail i')
    function track() {
      if (!bar) return
      var max = cab.scrollWidth - cab.clientWidth
      var visible = Math.min(1, cab.clientWidth / cab.scrollWidth)
      var p = max > 0 ? cab.scrollLeft / max : 0
      bar.style.width = visible * 100 + '%'
      bar.style.left = p * (100 - visible * 100) + '%'
    }
    cab.addEventListener('scroll', track, { passive: true })
    addEventListener('resize', track)
    track()

    // Drag to pan, but never swallow a click on a plate.
    var down = false, sx = 0, sl = 0, moved = 0
    cab.addEventListener('pointerdown', function (e) {
      down = true; sx = e.clientX; sl = cab.scrollLeft; moved = 0
      cab.classList.add('grabbing')
    })
    cab.addEventListener('pointermove', function (e) {
      if (!down) return
      var dx = e.clientX - sx
      moved = Math.max(moved, Math.abs(dx))
      if (moved > 6) { cab.scrollLeft = sl - dx; cab.setPointerCapture(e.pointerId) }
    })
    ;['pointerup', 'pointercancel'].forEach(function (ev) {
      cab.addEventListener(ev, function () { down = false; cab.classList.remove('grabbing') })
    })
    cab.addEventListener('click', function (e) { if (moved > 6) e.preventDefault() }, true)
  }

  /* ── Lightbox ────────────────────────────────────────────────────────
     A .shot/.phone image already inside a case-file link (.plate on
     Products/Projects, .shotlink on the exhibit rail) keeps navigating
     to that file — this only opens standalone shots, which today means
     the gallery on the case page itself, where clicking used to do
     nothing. Delegated so it keeps working if a shot renders later. */
  function lightbox() {
    document.querySelectorAll('.shot img, .phone img').forEach(function (img) {
      if (!img.closest('a')) img.classList.add('zoomable')
    })

    document.addEventListener('click', function (e) {
      var img = e.target.closest('.zoomable')
      if (!img) return
      e.preventDefault()
      var box = document.createElement('div')
      box.className = 'lightbox'
      box.setAttribute('role', 'dialog')
      box.setAttribute('aria-label', img.alt || 'Screenshot, enlarged')
      box.innerHTML =
        '<button class="lb-close" aria-label="Close">&times;</button>' +
        '<img src="' + img.currentSrc + '" alt="' + (img.alt || '').replace(/"/g, '') + '">'
      document.body.appendChild(box)
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(function () { box.classList.add('in') })

      function close() {
        document.removeEventListener('keydown', onKey)
        document.body.style.overflow = ''
        if (reduce) { box.remove(); return }
        box.classList.remove('in')
        setTimeout(function () { box.remove() }, 260)
      }
      function onKey(e) { if (e.key === 'Escape') close() }
      box.addEventListener('click', close)
      document.addEventListener('keydown', onKey)
    })
  }

  window.EX = { chrome: chrome, renderCabinet: renderCabinet, renderModules: renderModules,
    renderFigures: renderFigures, renderExhibits: renderExhibits, examination: examination,
    renderSeams: renderSeams, renderLive: renderLive,
    inquiryForm: inquiryForm, bookingWidget: bookingWidget,
    shotFrame: shotFrame, svg: svg, motion: motion, fnote: fnote, SHOTS: SHOTS }

  document.addEventListener('DOMContentLoaded', function () {
    chrome()
    masthead()
    var enq = document.querySelector('[data-inquiry]')
    if (enq) inquiryForm(enq)
    if (window.PAGE) window.PAGE()
    motion()
    lightbox()
  })
})()
