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
