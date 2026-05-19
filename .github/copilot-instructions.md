# Copilot instructions

## Build and local preview

- Ruby version: `3.3.6` (`.ruby-version`)
- Jekyll stack: `jekyll 4.4.1` with `jekyll-theme-clean-blog`, `jekyll-feed`, and `jekyll-paginate`
- Install dependencies: `bundle install`
- Run the site locally: `bundle exec jekyll serve`
- Build the site: `bundle exec jekyll build`
- Match the GitHub Pages production build more closely: `JEKYLL_ENV=production bundle exec jekyll build`
- GitHub Actions builds with `bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"` from `.github/workflows/jekyll.yml`
- There is no automated test suite or lint command configured in this repository, so there is no single-test command to run.

## High-level architecture

- The main site is a Jekyll site configured in `_config.yml`. It uses the `jekyll-theme-clean-blog` gem for most of the shared HTML, CSS, and includes, while this repository overrides only a small set of layouts/includes.
- `_layouts/default.html` is the shared shell. It pulls in `head.html`, `footer.html`, `scripts.html`, and `google-analytics.html` from the theme gem, while `_includes/navbar.html` is the local navigation override.
- `index.html` uses `layout: home`, which renders the latest 5 posts directly in `_layouts/home.html`. `blog/index.html` is the paginated archive view backed by `jekyll-paginate`.
- Top-level content pages such as `about.html`, `work.html`, `coaching.md`, `engineering-resources.md`, and `404.html` are simple Jekyll pages with front matter and content in the same file.
- Blog posts live in `_posts/` and are rendered through `_layouts/post.html`.
- The financial tools (`retirement-simulator.html`, `net-worth-simulator.html`, and `fire-calculator.html`) are separate standalone pages at the repo root. They do not use the Jekyll layouts; each page ships its own HTML structure and inline page-specific CSS, while sharing `assets/css/calculators.css` plus a dedicated script in `assets/js/`.
- `assets/js/retirement-simulator.js` is the most stateful part of the repo: it owns Monte Carlo simulation, recommendation generation, scenario persistence in `localStorage`, URL-based scenario sharing, and CSV export.

## Key conventions

- Do not edit `_site/`; it is generated output and is gitignored.
- Standard site pages usually use front matter with `layout: page`, a trailing-slash `permalink`, and `background: "/assets/images/hero.jpg"`. Posts use `layout: post` and the same background image.
- Use `new-post.sh "Post Title"` to scaffold new blog posts. It creates `_posts/YYYY-MM-DD-slug.md` with the expected front matter.
- The homepage post list in `_layouts/home.html` and the archive list in `blog/index.html` intentionally duplicate their preview markup. If you change post preview fields or metadata, update both places.
- Navigation is hand-maintained in `_includes/navbar.html`. Add or rename top-level pages there as part of the same change.
- For calculator work, keep shared styles in `assets/css/calculators.css` and leave one-off layout/chart styling inline in the individual calculator page unless the same rule is reused elsewhere.
- Each calculator script is organized as a page-specific class instantiated on `DOMContentLoaded`, and the HTML/JS coupling is via hard-coded element IDs. Preserve those IDs when refactoring.
- The calculator scripts also end with `module.exports = ...`; keep that export pattern intact if you split or rename classes.
- In `assets/js/retirement-simulator.js`, preserve the existing `localStorage` keys (`retirement-scenarios` and `retirement-last-scenario`) and the base64 `?scenario=` URL format unless you intentionally add a migration path for saved scenarios and shared links.
