# VISUAL_STATUS_MATRIX.md

## Gray Crown v23 — Visual / Implementation Status Matrix

**Baseline:** `gray-crown-frontier-v23-character-visual-patch`  
**Status vocabulary:** LOCKED / PROVISIONAL / DRAFT / UNRESOLVED / OBSOLETE / NON-CANON

| 項目 | 状態 | 根拠 | 次の処理 |
|---|---|---|---|
| Game story 00→19 | LOCKED | `js/systems/story.js:2-30`; v23 tests | 変更しない。Visual作業中もRegression維持。 |
| Title / New Game / Continue | LOCKED | `js/game.js`; Browser Gate PASS | 触らない。 |
| Save / Load schema 23 | LOCKED | `js/core/save.js`; 41/41 tests | 触らない。 |
| Developer Mode | LOCKED | `js/dev/developer.js`; tests | Visual作業の確認用途のみ。機能拡張しない。 |
| Battle / Map transition | LOCKED | systems + tests | Visual作業のために再設計しない。 |
| Ash Road | LOCKED | Story 09-11 / E2E | Visual audit外。 |
| Serad Frontier Section 1 | LOCKED | Story 12-15 / E2E PASS | Visual audit外。 |
| Serad Frontier Section 2 | LOCKED | Story 16-19 / E2E PASS evidence | Visual audit外。 |
| borderland以降のStory | NON-CANON | `KNOWN_ISSUES_v23.txt:4-11`; skeleton code | Visual/Canon根拠に使わない。 |
| `hero_party_walk.png` asset規格 | LOCKED | 96×512, 32×32, 3 frames, 4 dirs; `world.js:3-6` | 規格のみ維持。 |
| `hero_party_walk.png`デザイン内容 | PROVISIONAL | patch asset; current Visual instructions | 正式Character Reference完成後に再制作判断。 |
| Karen sprite row 0 | PROVISIONAL | active PNG + patch note | Character Designの根拠にしない。 |
| Triton sprite row 1 | PROVISIONAL | active PNG + patch note | Character Designの根拠にしない。 |
| Sophie sprite row 2 | PROVISIONAL | active PNG + patch note | Character Designの根拠にしない。 |
| Margaret sprite row 3 | PROVISIONAL | active PNG + patch note | 白髪patchは維持するが正式髪型は逆算しない。 |
| Hero dialogue portraits | PROVISIONAL | `js/data/npcs.js:102-124`; shared face geometry | Character Reference完成後に置換。 |
| Margaret dialogue portrait | OBSOLETE | purple hair while patch says white | NOW修正対象。 |
| Margaret fallback PARTY_STYLE | OBSOLETE | `js/data/npcs.js:6` purple hair | NOW修正対象。 |
| Stage A / Stage B visual switch | UNRESOLVED | ceremony dialogue exists, runtime visual asset switchなし | Four Heroes/Costume lock後に設計。今は実装しない。 |
| `GRAY_CROWN_CANON_v1.md` | UNRESOLVED / MISSING | ZIP内不存在 | authoritative fileを回収してprojectに格納。 |
| `CHARACTER_BIBLE_v1.md` | UNRESOLVED / MISSING | ZIP内不存在 | 同上。 |
| `KINGDOM_CULTURE_v1.md` | UNRESOLVED / MISSING | ZIP内不存在 | 同上。 |
| `EMPIRE_CULTURE_v1.md` | UNRESOLVED / MISSING | ZIP内不存在 | 同上。 |
| `GRAY_CROWN_CULTURE_LOCK_v1.md` | UNRESOLVED / MISSING | ZIP内不存在 | 同上。 |
| `CHARACTER_SHAPE_LANGUAGE.md` | UNRESOLVED / MISSING | ZIP内不存在 | 同上。 |
| `COSTUME_RULES.md` | UNRESOLVED / MISSING | ZIP内不存在 | 同上。 |
| `CHARACTER_VISUAL_IDENTITY.md` in ZIP | UNRESOLVED / MISSING | ZIP内不存在 | external artifactとの同期が必要。 |
| External `CHARACTER_VISUAL_IDENTITY.md` | DRAFT | Status=`PROPOSAL ONLY — 方向性未選択` | B selectionのprovenanceと同期後にstatus更新。 |
| External `KAREN_COSTUME_DESIGN_v1.md` | PROVISIONAL | Status=`DESIGN LOCK`, Direction B | project内へ入れる前にVisual Identityとのstatus矛盾を解消。 |
| Karen fixed identity facts | PROVISIONAL in package / externally specified | external Visual Identity: 23/F/165/etc; ZIPにはなし | Canon/Character Bibleをprojectへ戻してLOCKED化。 |
| Karen Visual Direction B | UNRESOLVED in package | external Costume says B Lock, Visual Identity says unselected | user decision/provenanceをsource-of-truthへ同期。再設計しない。 |
| Triton Visual Identity | UNRESOLVED | formal visual fileなし | Karen lock/sync後に3案工程。 |
| Sophie Visual Identity | UNRESOLVED | formal visual fileなし | Triton後。 |
| Margaret Visual Identity | UNRESOLVED | formal visual fileなし | Sophie後。白髪決定はruntime patchと一致させる。 |
| `GRAY_CROWN_ART_BIBLE.md` | UNRESOLVED / MISSING | ZIP内不存在 | 旧版が見つかればREFERENCE ONLYで監査。 |
| `GRAY_CROWN_ART_BIBLE_v2.md` | UNRESOLVED / MISSING | ZIP内不存在 | Four Heroes lock後にPROVISIONAL作成。 |
| Style Anchor | UNRESOLVED | Character Reference未作成 | まだ作らない。 |
| Character Reference | UNRESOLVED | 正式image未生成 | Four Heroes + Art Bible v2後。 |
| Formal Pixel Sprite | UNRESOLVED | current PNG is provisional | Character Reference後。 |
| 王国紋章 | UNRESOLVED | project内formal visual sourceなし | DO NOT INVENT。 |
| 帝国紋章 | UNRESOLVED | project内formal visual sourceなし | DO NOT INVENT。 |
| 勇者認定標章 | UNRESOLVED | project内formal visual sourceなし | DO NOT INVENT。 |
| 宗教紋章 / 正式色 | UNRESOLVED | formal sourceなし | DO NOT INVENT。 |
| 主人公4人の具体的目色 | UNRESOLVED | formal sourceなし | DO NOT INVENT。 |
| 主人公4人の姓 | UNRESOLVED | formal sourceなし | DO NOT INVENT。 |
| 正式武器デザイン | UNRESOLVED | formal referenceなし | DO NOT INVENT。 |
| 最終勇者装束 | UNRESOLVED | runtime switchなし | NOT YET。 |
| シオン王冠 | UNRESOLVED | future skeleton is NON-CANON | DO NOT INVENT。 |
| 王国/帝国軍階級章 | UNRESOLVED | formal visual sourceなし | DO NOT INVENT。 |
| `CHARACTER_VISUAL_PATCH_v23_1.txt` | LOCKED as patch record | current active sprite change log | KEEP。正式Character Designではないことを追記候補。 |
| `hero_party_walk_v23_original.png` | OBSOLETE / rollback ref | patch note | ARCHIVE。 |
| `hero_party_walk_replacement.png` | OBSOLETE | Margaret dark-hair intermediate | ARCHIVE / removal candidate after backup policy. |
| `hero_party_walk_whitehair.png` | OBSOLETE duplicate | active PNGとSHA同一 | REMOVE CANDIDATE。 |
| v23 unversioned duplicate reports | OBSOLETE duplicates | `_v23`とSHA同一 | REMOVE CANDIDATE。 |
| `ARCHITECTURE_v19.txt` | OBSOLETE as current spec | mentions removed legacy file | ARCHIVE。 |
| `V20_STABLE_BASELINE.txt` | LOCKED | stable baseline record | KEEP。 |
| v3-v22 historical CHANGES/TEST docs | OBSOLETE for current instructions / REFERENCE history | old versions | ARCHIVE。 |
| `QUALITY_BENCHMARK_v15.txt` | PROVISIONAL / REFERENCE | current sprite規格を記述するがVisual Canonではない | 品質履歴としてKEEP。 |
| BGM/SE | PROVISIONAL | `KNOWN_ISSUES_v23.txt:9` | Visual Identity優先。今は制作しない。 |
| frontierfield final art | PROVISIONAL | `KNOWN_ISSUES_v23.txt:8` | 今は触らない。 |

---

# Character package status summary

| Character | Package内で確実にLOCKできるもの | Package内で未固定なVisual |
|---|---|---|
| Karen | name/id/job, row 0, active red-hair provisional sprite | age/height/face/eyes/handedness/formal hair/costume/weapon referenceは正式資料欠落 |
| Triton | name/id/job, row 1 | formal body/face/age/height/handedness/costume等 |
| Sophie | name/id/job, row 2, healer/cleric role | formal body/face/age/height/handedness/religious costume等 |
| Margaret | name/id/job, row 3, patch says white hair | active portrait contradicts white hair; formal body/face/costume等 |

**Rule:** 32×32Sprite、現在のSVG portrait、future skeletonからformal Character Canonを推測しない。