---
title: "noizzz - A white noise app I created with AI"
layout: post
background: "/assets/images/hero.jpg"
---

I've tried and failed several times at building mobile apps and I've been wanting to test some AI tools. So I set myself a challenge: Use AI tools to build and publish a mobile app. Because I frequently use a white noise (technically brown noise) to fall asleep, I wanted to build a noise generator app to help me sleep.

I intentionally picked a simple idea.

I didn't want my first serious AI-assisted mobile app experiment to depend on logins, backend infrastructure, subscriptions, push notifications, or a complicated design system. I wanted a small utility with a clear job: open the app, pick a sound, and let it play. If I could get something like that all the way into the Google Play store, I figured I'd learn a lot about both AI-assisted development and the mobile app process itself.

So that's what I did. The app is called [noizzz](https://play.google.com/store/apps/details?id=com.noizzz.android), it's an Android app written in Kotlin, and it plays a handful of relaxing sounds with a minimalist interface.

## The workflow was not elegant

My actual workflow was a little clunky.

I used Copilot in VSCode as a product/spec interface and then used Android Studio mostly for building, running simulators, and dealing with the parts of Android development that really want you inside the Android ecosystem. In theory that's fine. In practice, getting Android Studio setup correctly and getting comfortable moving between the two tools was the most frustrating part of the whole project.

That frustration is worth calling out because I think a lot of the AI discourse skips over the boring bottlenecks. The hard part wasn't coming up with the app idea. It wasn't even getting code generated. The hard part was getting the environment, emulator, signing, build process, and publishing flow working smoothly enough that I could keep momentum.

I also want to be explicit about how I worked: I really tried to act like a Product Manager. I didn't review code. I don't think I opened a single source file. I didn't read a single line of code. I focused on defining the product behavior, testing builds, and giving AI feedback in plain English until the app behaved the way I wanted.

## What I asked AI to help with

I used Copilot for the kinds of tasks I think AI is genuinely good at right now:

* turning plain-language product requests into working app behavior
* iterating quickly on UI and interaction details
* troubleshooting Android-specific errors when builds failed
* answering "how do I do X in Android?" questions quickly
* helping refine app store listing copy
* prepping and building a bundle for submission to the Google Play store

This was less like hiring a senior mobile engineer and more like managing a very fast implementation partner who never got tired. Most of the time it gave me exactly what I needed on the first try, which is pretty consistent with my experience using AI for software projects in general.

The biggest value was speed. Instead of spending 30 minutes reading forum posts and documentation to get pointed in the right direction, I could usually get a plausible starting point in a few seconds and then refine from there.

## What the app actually does

The app itself is intentionally minimalist. No accounts. No ads. No clutter. Just a small set of continuous ambient sounds meant to help with sleep, focus, or relaxation.

Right now it includes:

* white noise
* brown noise
* pink noise
* green noise
* background playback so it can keep running when the app is minimized or the screen is off

One thing I liked about this project is that it forced me to keep asking: what is the smallest version of this that is still useful?

It's very easy, especially when you're building with AI, to keep piling on features because generating code feels cheap. But every feature adds complexity, more edge cases, more testing, and more opportunities for a small app to become bloated. For this project I tried to resist that instinct.

## Publishing was the real milestone

The most meaningful part of this project wasn't writing the code. It was publishing the app.

I've started side projects before. I've even gotten some pretty far. But shipping something through an actual mobile app store is different. There are a bunch of steps that have nothing to do with the core product itself: app bundles, signing keys, store listings, icons, screenshots, content policies, release management, and all the miscellaneous details you only learn by doing.

That's one of the reasons I wanted this challenge to end with "published" rather than just "working on my machine." AI can make prototyping feel deceptively complete. You can get to a demo very quickly. But a demo is not the same thing as a shipped product. The publishing process forced me to clean up the rough edges and actually finish.

And now when I open the Play store and see it there, I get the satisfying feeling of having closed the loop on something I've wanted to do for a while.

## A few things I learned

First, picking a small project was absolutely the right call. If I had tried to build something with a backend, payments, user accounts, and a more ambitious feature set, I probably would have bogged down and abandoned it.

Second, the tooling matters more than people admit. A clunky development setup creates just enough friction to kill momentum, especially on side projects. If I do another Android app, I'll invest earlier in getting the environment and workflow really clean.

Third, AI makes it much easier to get over the psychological hump of starting. That alone is a big deal. A lot of projects die because the blank page is intimidating. AI is very good at reducing that activation energy.

Fourth, the old rules still apply. You still need to simplify aggressively, test what matters, and finish the boring parts.

## Final thoughts

Overall, I consider this experiment a success.

Not because AI built an app for me with no effort, but because it helped me finally do something I'd been putting off for years: build and publish a mobile app. The win here wasn't automation. The win was leverage.


