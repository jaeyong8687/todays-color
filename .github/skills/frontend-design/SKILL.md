---
name: frontend-design
description: Build polished charts, dashboards, and slide decks with visual hierarchy and accessibility. Applies SCAP principles (Size-Color-Alignment-Proximity) for executive-ready output. Use when designing visuals for stakeholders, polishing presentations, or ensuring accessibility compliance.
---

# Frontend Design

Transform data and content into polished, accessible visual communications that meet executive expectations and drive decision-making.

## When to Use This Skill

- Designing charts and graphs for executive presentations
- Creating dashboards for stakeholder monitoring
- Polishing slide decks for leadership reviews
- Building HTML reports or interactive visualizations
- Ensuring accessibility compliance in visual outputs
- Translating data insights into visual narratives
- Preparing "demo-ready" or "board-ready" materials

## Trigger Keywords

**Direct**: chart design, dashboard design, slide deck, visual polish, executive presentation, accessibility
**Inferred**: "make it look professional" → SCAP hierarchy, "board-ready" → executive polish, "polish this" → visual refinement
**Negative**: not for CSS layouts (use visual-ui-patterns), not for JS behaviors (use interactive-components)

## Design Principles

### 1. Visual Hierarchy (SCAP Framework)

**Purpose:** Guide the viewer's eye to the most important information first using the Size-Color-Alignment-Proximity framework.

#### Size

Establish a 4-level typographic scale based on importance:

| Level | Scale | Weight | Use Case |
|-------|-------|--------|----------|
| 1 (Hero) | 200-300% (2.5rem+) | 700 | Key metric, headline |
| 2 (Section) | 150-180% (1.75rem) | 600 | Section headers |
| 3 (Body) | 100-120% (1rem) | 400 | Primary content |
| 4 (Supporting) | 80-90% (0.875rem) | 400 | Captions, metadata |

#### Color

Limit palette to 3-5 colors maximum. Use saturation and brightness for emphasis, not hue proliferation.

| Role | Application | Example |
|------|-------------|---------|
| Primary | Brand anchor, key CTAs | Indigo (#4F46E5) |
| Success | Positive status, completion | Emerald (#10B981) |
| Warning | Attention needed, caution | Amber (#F59E0B) |
| Error | Problems, failures | Rose (#F43F5E) |
| Neutral | Backgrounds, borders, body text | Grayscale dominates |

**Rule:** Color accents highlight key data points only. Grayscale carries the structure.

#### Alignment

Grid-based layouts ensure visual coherence:

| Pattern | Use Case | Description |
|---------|----------|-------------|
| F-pattern | Text-heavy content | Users scan left-to-right, then down |
| Z-pattern | Landing pages | Users scan diagonally across the page |
| Center-gravity | Dashboards | Key metric centered, supporting data orbits |

**Grid System:** Use 8px base unit. All spacing, padding, and margins use multiples of 8 (8, 16, 24, 32, 48, 64px).

#### Proximity

Group related elements with consistent spacing:

| Relationship | Spacing |
|--------------|---------|
| Tightly related | 8px (1 unit) |
| Related | 16px (2 units) |
| Loosely related | 24-32px (3-4 units) |
| Separate sections | 48-64px (6-8 units) |

**Example Application:**
```
Dashboard Layout (SCAP Applied):
┌─────────────────────────────────────────┐
│ 🔴 KEY METRIC: 8.2 hours (Target: 5.0) │ ← Level 1 size, primary color
├─────────────────────────────────────────┤
│                                         │
│  [Primary Visualization - 60% width]   │ ← Center-gravity alignment
│                                         │
├─────────────────────────────────────────┤
│ Supporting Stats │ Supporting Stats     │ ← Level 4 size, 16px gap (proximity)
└─────────────────────────────────────────┘
```

### 2. Accessibility

**Purpose:** Ensure all audiences can consume the information, regardless of ability.

**Requirements:**
- **Color blindness:** Never use color alone to convey information
  - ✅ Use patterns, labels, and shapes in addition to color
  - ❌ Red vs green without additional indicators
- **Contrast ratios:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Alt text:** Describe charts for screen readers
- **Font size:** Minimum 12pt for body text, 18pt for presentations
- **Readability:** Avoid all-caps for long text, use sentence case

**Quick Test:**
- View in grayscale — Can you still distinguish elements?
- Zoom to 200% — Is text still readable?
- Read aloud the alt text — Does it convey the key insight?

### 3. Data-Ink Ratio

**Concept:** Maximize the proportion of ink (pixels) used to display actual data vs decorative elements.

**Simplification Checklist:**
- [ ] Remove chart borders unless functionally necessary
- [ ] Eliminate gridlines or make them very light gray
- [ ] Delete redundant legends (directly label instead)
- [ ] Avoid 3D effects, shadows, gradients on data elements
- [ ] Remove decimal places beyond meaningful precision
- [ ] Delete axes if values are directly labeled on bars/points

**Before → After:**
```
❌ Before: Heavy gridlines, 3D bars, border, legend, gradient fills
✅ After: Direct labels, minimal axis, single color, flat design
```

### 4. Chart Type Selection

**Match visualization to data relationship:**

| Data Relationship | Best Chart Type | When to Use |
|-------------------|-----------------|-------------|
| **Single key message** | Headline KPI + explicit takeaway sentence | Lead with the one decision-driving insight |
| **Comparison** | Bar chart (horizontal or vertical) | Comparing categories, rankings |
| **Trend over time** | Line chart | Showing change across continuous timeline |
| **Part-to-whole** | 100% stacked horizontal bar | Showing composition, percentages by segment |
| **Two-point change** | Slopegraph | Showing before/after movement across categories |
| **Distribution** | Histogram or box plot | Showing data spread, outliers, ranges |
| **Correlation** | Scatter plot | Showing relationship between two variables |
| **Flow/process** | Sankey or waterfall | Showing transitions, cascading effects |

**Anti-patterns to avoid:**
- ❌ Pie, doughnut, and polar charts as defaults (use bar/100% stacked horizontal/slopegraph)
- ❌ Dual-axis charts (confusing, use small multiples)
- ❌ 3D charts (distorts perception of values)
- ❌ Stacked area charts for volatile data (use line charts)

### 5. Executive Polish

**Characteristics of executive-ready materials:**

**Professional Typography:**
- Use system fonts or brand-approved typefaces
- Limit to 2 font families per document
- Consistent sizing hierarchy (H1: 24pt, H2: 18pt, Body: 12pt)

**Strategic Color Usage:**
- Brand colors for primary elements
- RAG (Red-Amber-Green) status indicators where appropriate
- Colorblind-safe palette (use ColorBrewer or similar)
- Maximum 5 distinct colors per visualization

**Finishing Touches:**
- Include date/timestamp on all reports
- Add source citations for data
- Spell-check and grammar review
- Consistent formatting (alignment, spacing, capitalization)
- High-resolution exports (300 DPI for print, optimized PNG for web)

**Layout Balance:**
- Follow grid system (align elements)
- Consistent margins and padding
- Logical reading flow (F-pattern or Z-pattern)

## Workflow Integration

### From data-evaluation Skill

When receiving data packages from [data-evaluation](../data-evaluation/):

1. **Identify the headline metric** → Make this the visual anchor
2. **Choose visualization for key insights** → Use chart selection guide above
3. **Create supporting visuals for context** → Smaller, muted style
4. **Add annotations for critical points** → Highlight thresholds, targets, anomalies

### From stakeholder-reporting Skill

When visualizing executive summaries from [stakeholder-reporting](../stakeholder-reporting/):

1. **Lead with the conclusion** → Visual should answer "so what?"
2. **Support the narrative** → Charts reinforce the written message
3. **Design for scanning** → Busy executives skim, not read
4. **Enable drill-down** → Link to detailed data for follow-up questions

## Verification

### Automated Check

Run the contrast and specificity checker against any HTML dashboard:

```bash
node .github/skills/frontend-design/scripts/check-contrast.js <path-to-html>
```

**Example:**
```bash
node .github/skills/frontend-design/scripts/check-contrast.js 04-Demonstrations/04-Data-Storytelling-Dashboard/M365-Noise-Reduction-Story/m365-noise-reduction-dashboard.html
```

**Exit codes:**
- `0` — All checks pass
- `1` — Contrast or specificity failures detected
- `2` — File not found or parse error

### Test Prompts

> "Create an executive-ready chart showing the resolution time by ticket category"

> "Design a dashboard layout for monitoring our Q1 OKR progress"

> "Make this slide deck polished and accessible for the board presentation"

> "Help me choose the right visualization for comparing team performance across 8 metrics"

> "Review this chart for accessibility issues and suggest improvements"

### Output Checks

| Check | Pass Condition |
|-------|----------------|
| Structure | Output follows the methodology template |
| Completeness | All required sections present |
| Grounding | Claims cite specific files, data, or sources |
| Actionability | Recommendations include concrete next steps |
| SCAP compliance | Size, Color, Alignment, Proximity principles applied |
| Accessibility | Contrast ratios meet WCAG AA (4.5:1 text, 3:1 large) |
| CSS specificity | Component-scoped styles not overridden by layout selectors |

### Known Failure Modes

| Failure Pattern | Prevention |
|-----------------|------------|
| **CSS specificity cascade override** — Generic layout selectors (`.header h1`) override component classes (`.hero-title`) because element selectors add specificity. Dark text appears on dark backgrounds. | Use direct child combinator (`.header > h1`) for layout rules. Component classes should not need `!important` or element qualifiers to win. |
| **Color-only status indicators** — Red/green status without icons or patterns fails colorblind users. | Always pair color with shape (✓/✗/●) or pattern. |
| **Inherited text color on gradient backgrounds** — Text inside gradient sections inherits parent color instead of explicit white. | Always set explicit `color: #ffffff` on text elements within gradient containers; do not rely on inheritance. |

## References

- For visual hierarchy best practices, see [visual-hierarchy-guide.md](references/visual-hierarchy-guide.md)
- For before/after examples, see [references/exec-ready-chart.md](references/exec-ready-chart.md)

## Extensibility

Create granular sub-skills or agents for specialized needs:

- **`chart-design`** — Focus solely on selecting and styling data visualizations
- **`slide-automation`** — Generate PowerPoint/Google Slides from templates programmatically
- **`dashboard-layout`** — Specialize in multi-panel dashboard composition and information architecture
- **`accessibility-audit`** — Deep accessibility testing (WCAG 2.1 compliance, screen reader testing)
- **`brand-compliance`** — Ensure visuals meet corporate brand guidelines
- **`data-storytelling-narrative`** — Craft the story arc that connects multiple visualizations

Each sub-skill can be created as a separate SKILL.md with narrower activation triggers and domain expertise.

---

## Tool Agnostic Approach

These principles apply regardless of your visualization tools:

- **Presentation software:** PowerPoint, Google Slides, Keynote
- **BI tools:** Power BI, Tableau, Looker
- **Spreadsheets:** Excel charts, Google Sheets
- **Web technologies:** D3.js, Chart.js, HTML/CSS
- **Design tools:** Figma, Adobe Illustrator, Canva

Focus on **design thinking** rather than tool-specific features. The principles of hierarchy, accessibility, and clarity transcend platforms.

---

## Quick Reference: Common Mistakes

| ❌ Mistake | ✅ Fix |
|-----------|--------|
| Rainbow color palette (7+ colors) | Limit to 3-5 colors, use shades for variation |
| Tiny font sizes (<10pt) | Minimum 12pt body, 18pt for presentations |
| No title or context | Clear title answering "what am I looking at?" |
| Truncated axis to exaggerate differences | Start axis at zero for bar charts |
| Pie/doughnut/polar chart in storytelling view | Use headline KPI + bar, 100% stacked horizontal bar, or slopegraph |
| Red/green only for status | Add icons or patterns (✓/✗/●) |
| Generic chart title ("Sales by Region") | Insight-driven title ("West Region leads sales growth 23%") |
| Overloaded dashboard (15+ visuals) | Focus on 3-5 key metrics, offer drill-down for details |

---

## Related Skills

- [visual-ui-patterns](../visual-ui-patterns/) — CSS layouts, design tokens, component styling
- [interactive-components](../interactive-components/) — JS-driven behaviors (tabs, accordions, toasts)
- [data-story](../data-story/) — Chart.js visualizations and narrative walkthroughs
- [accessibility-audit](../accessibility-audit/) — WCAG compliance validation

---

*This skill aligns with demonstrations: [04-Data-Storytelling-Dashboard](../../../04-Demonstrations/04-Data-Storytelling-Dashboard/)

*Last Updated: 2026-02-16*
