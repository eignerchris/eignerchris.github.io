---
title: "Our AI-powered Wealth Manager"
layout: post
background: "/assets/images/hero.jpg"
---

I recently watched [a YouTube video](https://www.youtube.com/watch?v=96Vl8s3EQhk) from the ["How I AI" Podcast](https://www.youtube.com/@howiaipodcast) interviewing a woman who is using AI to run her home and finances, among other things. Inspired by this I thought I would walk you through a creative way that we're using Copilot/Claude Code to manage our wealth.

While I'm fairly financially literate, I'm definitely no expert and I definitely have gaps in my knowledge. I wanted something simple. No software, API's, external connections, API keys, etc. My ideal user experience would be to sit down with my wife once per quarter and go through a series of questions with our "wealth manager".

I fired up Claude Code and using the `/plan` mode to issue the following prompt:

> 
We're going to use this current directory to track and manage the personal wealth of my wife and I. You will act as our wealth strategist, making recommendations based on a standard set of questions we can answer (via prompt) periodically. So, ideally my wife and I would sit down together in front of a laptop, initiate a conversation with an AI agent, the agent would prompt us with a set of questions regarding account statuses, any new goals, etc. and then make an informed set of recommendations. I'd also expect the agent to ask us questions that would lead to strategies or changes that we might not be aware of. Setup this directory with the necessary information, directories, and any other documentation (skills.md, agents.md, etc.) needed. e.g. should we have a statements directory where we upload a recent set of statements as a prereq to getting started?

Claude prompted me with a set of useful clarifying questions around frequency of use, the best way to track account balances and we were off to the races. It generated the entire directory structure and filled in some necessary agent.md and readme.md files automatically. Upon completing this step, I exited plan mode and prompted claude with the following: 

>
So with the core structure in place, please kick off a set of inquiries to get us started for our first wealth management/strategy session...feel free to ask for recent statements, known account names, etc.".

```
◐ The user wants to start their first wealth management session. 
I need to act as the wealth strategist and begin gathering their profile information. 
Let me start by asking questions to fill in their
profile templates. 
I'll go one question at a time as the agent is designed to do.

● Great — let's get your profile built out so we're ready for 
a proper first quarterly review. I'll walk you through this 
section by section, starting with the basics.
```

What followed was honestly impressive, and very similar to previous convo's I've had with other advisors/managers. The first set of inquiries from the agent centered around establishing a clearer picture of our current lifestyle and financial situation. Number of children, income, where we live (presumably for tax purposes), an audit of all accounts, real estate, etc. All documented plainly in simple markdown files.

Once it was done asking questions, it spit out a series of items that needed addressing including some much needed estate-planning, an optimized plan for some IRA rollovers, and since we're planning a long stint of travel, how to navigate health insurance and allocate the proceeds from the sale of our home. The agent facilitated all of this in my terminal in a simple Q/A style. The output from my first review sessionw with my AI Wealth Managers was the following...

```
🔴 Do Now — High Priority

  1. Estate Planning — Your Biggest Gap 
  You have significant assets and zero legal documents. 
  If something happened to either of you while traveling 
  internationally, the surviving partner could face probate
  nightmares, especially with the LLC brokerage. Get wills, 
  financial/healthcare POAs, and HIPAA authorizations drafted 
  before you leave the country. Since you're establishing WA residency, use a Washington
  estate attorney. This is a $2-5K investment that protects everything.

  2. Establish WA Residency Before Any Roth Conversions 
  Your Roth conversion plan is excellent — but timing matters.
  Oregon taxes conversions at ~9%. Washington taxes them at 0%. 
  Make sure WA residency is fully established 
  (driver's license, voter registration, address change with Fidelity) 
  before you convert a single dollar. The difference on a $30K conversion 
  is ~$2,700 in state tax saved.

  3. Beneficiary Designation Audit 
  Log into every brokerage account and verify beneficiary 
  designations. These override wills. 
  Make sure each spouse is primary beneficiary on the other's
  IRAs, and decide on contingent beneficiaries.

  🟡 This Quarter — Important

  4. Roth Conversion Math for 2026 
  With [REDACTED] in estimated dividend income and a 
  ~$30K standard deduction (2026 MFJ), you have roughly 
  [REDACTED] of "free" conversion space at 0% federal tax.

  5. Asset Allocation Review 
  Your current allocation is ~95% equities, which is 
  aggressive for a portfolio you're drawing from. 
  The classic early retiree risk is sequence of returns — a bad market in
  the first few years can permanently damage your portfolio. Consider:

   - Building a 2-3 year cash/bond buffer (~$150-200K in BND/SPAXX/HYSA) 
   so you never sell equities in a downturn
   - The inheritance backstop softens this risk, but you don't control the timing

  6. Post-House-Sale Deployment 
  With the proceeds from your house sale, don't lump-sum into VTI at 95% equities. 
  Consider dollar-cost averaging over 6-12 months, and use it as an 
  opportunity to build that bond/cash
  buffer.

  🟢 Consider This Quarter

  7. Umbrella Insurance 
  With [REDACTED] in assets, you're a target for lawsuits. 
  An umbrella policy is typically $200-400/year for $1M in coverage. 
  Worth getting before you no longer have auto/homeowners
  policies to attach it to.

  8. Travel Insurance Deep Dive 
  Before committing to Cigna, verify: emergency medical 
  evacuation coverage (critical in Mexico), prescription 
  drug coverage abroad, mental health coverage, and what
  "catastrophic U.S. coverage" actually means — does it 
  cover a $200K cancer diagnosis, or just ER visits?

  9. HYSA for Operating Cash 
  Your Chase checking is earning near-zero. Consider moving [REDACTED] 
  to a high-yield savings account (currently ~4.5-5% APY)
  as your operating cash buffer.
```

While I was aware of some of these shortfalls, it gives my wife and I a clearer picture with it all in one spot. Now we just work through the TODO's and report back in 3 months. 

And so what we now have is a very easy way consult with an Agentic AI on our finances. Because the AI diligently documented all our our financial details in this directory, all future sessions with the agent will have all the necessary context.

Hope that was interesting and inspiring! Ping me if you are interested in setting up a similar system for yourself!