# PIXEL_RESOLUTION_STUDY.md

## Gray Crown — 32 / 48 / 64 / Hybrid Resolution Study

**Status:** STUDY / RECOMMENDATION

---

# 1. 現在の条件

- Canvas: 768×480
- Tile: 32px
- Grid: 24×15
- Current Hero: 32×32
- Current Camera scale: mapごとに約1.16〜1.25
- Collision: logical tile coordinate
- Movement: tile step + visual interpolation

重要:

> **Sprite sizeとcollision tileは同じである必要がない。**

48px Actorでも足元を32px tileへanchorできる。

---

# 2. 32×32

長所:
- renderer変更最小
- map比率安定
- art cost最小
- NPC展開しやすい
- battle再利用済み

短所:
- 手演技が苦しい
- 顔差が小さい
- SophieのHandsを読みづらい
- Margaretの微細演技が厳しい
- adult body差を出す余裕が少ない

判定:
**baselineとして保持。Pixel-native本命には情報量が少ない。**

---

# 3. 48×48

長所:
- 手・髪・肩・姿勢の差が読みやすい
- 4人の体格差を維持しやすい
- KarenのLaugh / Surpriseが身体で読める
- 32px mapを作り直さなくても足元anchorで運用可能
- 64よりproduction costが抑えられる

短所:
- tileよりspriteが大きくなるためoverlap/layering調整が必要
- narrow interiorで圧迫感が出る可能性
- 既存battle CSSをそのまま使えない

判定:
**最有力。Prototype推奨。**

---

# 4. 64×64

長所:
- 顔・手・装備が明確
- acting自由度が高い
- close-up不要なSceneも増える

短所:
- 32px map上で大きすぎる可能性
- 4人partyが画面を占有
- NPC全体移行costが大きい
- animation frame制作量が急増
- interior / battle / UIとの再調整範囲が広い

判定:
**Gameplay標準としては現段階で非推奨。**

---

# 5. Hybrid候補比較

## A — Gameplay 32 / Event larger
低riskだが、通常会話でactingが弱い。Event時だけ別人物感が出る可能性。

## B — Gameplay 48 / Event larger
通常Gameplayから演技が成立し、Level 2も同Actorを使える。

**推奨。**

## C — Gameplay 64
cost / map比率 / migration riskが高い。

## D — Gameplay 32のままAnimation + Camera強化
最も安全なfallback案。ただしSophie/Margaretの演技幅に限界。

## E — Gameplay / Cinematic完全分離
表現力は高いがVisual languageの分断がIllustration-firstの問題を再現する可能性。

---

# 6. 推奨構成

> **Gameplay: 48×48 source actor / 32px logical tile Hybrid**

Actor anchor:
- foot pointをtile bottom-center付近へ固定
- collision / pathfindingは32 tileのまま
- sprite draw boxだけ48へ拡張

Level 1:
- 48px

Level 2:
- 同じ48px + camera/timing

Level 3:
- 必要Sceneのみ96px級 / variable dedicated actor

---

# 7. 重要イベント

重要Eventでも常に大型化しない。

まず48px Actorをcameraで見せる。

Level 3が必要な場合のみ:
- 96px級 actor
- silhouette
- close-up
- dedicated background

を使用。

---

# 8. Browser performance

48px化そのものはCanvas drawImageの面積差として小さい。

performance riskは解像度より、
- actor数
- animation sheet数
- effect layers
- particles
- scene camera redraw

の方が大きい。

Prototypeで実測する。

---

# 9. 現32pxの扱い

削除しない。

用途:
- rollback
- A/B comparison
- migration中の未対応actor
- technical baseline

正式採用後も一括48化しない。

---

# 10. Final Recommendation

**Gameplay: 48×48 Actor / 32px logical tile Hybrid**  
**Enhanced Event: same 48px Actor + Camera / Timing**  
**Pixel Cinematic: 96px級 dedicated actor only when needed**

Karen Prototypeで最終検証する。
