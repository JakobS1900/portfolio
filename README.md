# Jakob S. - Portfolio

A portfolio site for a systems and AI engineer. Static, no build step, no
dependencies. Open `index.html` and it runs.

**Live site: [jakobs1900.github.io/portfolio](https://jakobs1900.github.io/portfolio/)**

## Pages

| Page | What it is |
|---|---|
| `index.html` | Home: the pitch, selected work, how I work |
| `security.html` | The security argument, seven failure classes and how I close them |
| `clinical-platform.html` | Case study: a live UK clinic platform (capability write-up, source private) |
| `counterpart.html` | An interactive demo of Counterpart, a conversation-training platform |
| `persona-engine.html` | Case study: a multi-agent AI simulation on consumer hardware |
| `resume.html` | Resume, and the print stylesheet that turns it into the CV |

## The Counterpart engine is in here, and you can read it

`counterpart.html` is not a mockup. The deterministic core that scores the
conversation runs client-side, and the source is in this repo:

| File | What to look for |
|---|---|
| `counterpart-engine.js` | The integrity argument. A turn can move a trait by at most 1.5 and resistance by at most 12, so no single input can swing the result however it is phrased. A hidden fact needs the right topic **and** enough earned rapport, so asking the perfect question too early is meant to fail. Every function is pure. |
| `counterpart-signals.js` | The narrow gate. Whatever a user types is reduced to a few booleans and a topic string before the engine sees it. That is why a prompt-injection line does nothing: there is no field for it to land in. |
| `counterpart-demo.js` | The scenarios as plain data. A new vertical is an object here, not an engine change. |

In production a local language model does the annotation and writes the
counterpart's replies, and the engine still receives nothing wider than that
same bounded signal. The Python core these mirror, and the personas, are
private.

## Design

One shared stylesheet (`styles.css`) drives every page. Light and dark themes,
the toggle persists across pages (`app.js`). No web fonts and no framework, so
the only third-party request on the page is GoatCounter, which is cookie-less
and counts page views. Everything else still works with the network off.

## Running it

There is nothing to install.

```
# any static server, or just open the file
python -m http.server 8000
# then visit http://localhost:8000
```

## A note on the work shown here

Client and private work is described at the capability level. The write-ups say
what a system does and the decisions behind it. They do not ship source, data
models, or anything that could be rebuilt from the page. Deeper walkthroughs
happen under an NDA.

## Contact

- Live site: [jakobs1900.github.io/portfolio](https://jakobs1900.github.io/portfolio/)
- GitHub: [github.com/JakobS1900](https://github.com/JakobS1900)
- Email: jakob.stanfield@ras-software.com
