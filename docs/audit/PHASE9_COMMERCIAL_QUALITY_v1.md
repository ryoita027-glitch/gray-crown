# Gray Crown — Phase 9 commercial quality candidate
**Provisional / Not a release approval.** Commit is based on Phase8 Draft PR #48; all Phase5–8 admission gates remain outstanding.

## Purpose
Increase the game value visible during real interactions across **four tracks**, without replacing accepted Karen/Triton/Sophie/Margaret art, overriding Story00–19, or guessing undecided heraldry.

### 1. Recognizable protagonists
Separate four identity bands and distinct activity descriptions in quest/party UI. Define Karen as a lead/guard/buff, Triton as an armor-break front line, Sophie as reactive triage, Margaret as analytical mage. Hero role labels derive only from existing character roles and skill IDs. Preserve all original PNG hashes; **new facial expressions, high-quality unique pixel acting drawings and Portrait art remain a major artistic backlog** and have not been deceptively counted as generated.

### 2. Explore/experience density
Area-specific navigation notes for village, woods, cave, Aldina, inns, Ash Road, Serad command and battlefield. These are optional contextual prompts **inside existing quest HUD**—no new compulsory NPC route, flags or scripted decisions. Revisit triggers still use the game's native rules. Next real QA must evaluate whether notes help or feel intrusive.

### 3. Background/UI/audio quality
Stronger character identity in party UI and mobile-safe, high-contrast context notes; battle commands now describe action semantics directly on hover/accessibility label. Original Pixel-native 32px terrain work from Phase8 is retained. Audio remains the original synthesized motifs; a custom composed soundtrack, animated NPC visual atlases and genuine authored 48px high-tier expression revisions are **not completed** by this code-only work.

### 4. Tactical battles
Display actionable role-specific suggestions based on real enemy defenses/attacks, party HP, and MP. Expose skill effects accessibly. Fix misleading guard description: it halves the guard user's damage and does not intercept hits targeting someone else. Put the existing '号令' buff under a limit of +4 so players cannot stack it indefinitely. This changes balancing—needs exact real gameplay regression before approval; no new save fields.

### Change boundaries
Only additive helper `js/render/commercial_quality.js`, battle renderer/UI, small battle balance/text bugfixes, CSS, script load order, and tests. No locked PNG, battle base definition, map, NPC definition, Story stage, save serialization or culture decisions modified.

## Gates
- Isolated V8 checks can validate module parse and tactical output only.
- Run `npm test`, `npm run check`, existing Phase5/7/8 normal browser E2E and original PNG hash verification from **this exact branch**, outside GitHub Actions.
- Compare same-state raw screenshots at 390/1024/1365 widths; test Japanese text line wrapping and icon focus.
- Confirm all original boss/wolf/patrol/Vark battles are still winnable by regular buttons with capped +4 rally; measure turn counts and party survival rather than making unsupported claims about 'fun'.
- Conduct human judgment of protagonist appeal and background quality separately.
- **No automatic Actions, no main merge, no commercial PASS without real evidence.**
