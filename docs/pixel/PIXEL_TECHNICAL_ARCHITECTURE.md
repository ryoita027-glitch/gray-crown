# PIXEL_TECHNICAL_ARCHITECTURE.md

## Gray Crown — Pixel-Native Technical Architecture Proposal

**Status:** DESIGN ONLY — NO CODE CHANGE YET

---

# 1. 原則

v23の既存 data / systems / render / core 分離を活かす。

Pixel-nativeのためにArchitectureを全面再設計しない。

中心追加は:

> **Animation metadata + minimal SceneRunner + Camera override**

---

# 2. 現在の実装事実

## Sprite / World
`js/render/world.js`
- HERO_SPRITESは32×32 fixed
- 3 columns / 4 directions
- walkは[0,1,2,1]
- drawImage時はCanvas側image smoothing off
- player / followerはVISUALで補間
- cameraForMap + camX/camY smooth followがある

## Movement
`js/systems/movement.js`
- logical movement/collisionは32px tile coordinate
- sprite drawing boxとcollisionを分離可能

## Dialogue
`js/systems/dialogue.js`
- `say()`がspeaker portraitを常時生成
- typewriterにpunctuation delay / explicit pauseがある

## Event
`js/systems/events.js`
- 現状は `lines -> effects`
- actor action / camera / audio beatを途中へ差し込めない

## Audio
`js/systems/audio.js`
- theme + limited SFX
- scene-level stop/duck/resume cue APIはない

## Save
`js/core/save.js`
- transient dialogue / battle / locked中はSave/Load block
- battle transient stateをserializeしない
- Sceneをtransientにすればschema 23を維持しやすい

---

# 3. 推奨Asset構造

巨大hero sheetへ無限追加しない。

```text
assets/sprites/
  heroes/
    karen/
      idle.png
      walk.png
      run.png
      turn.png
      talk.png
      surprise.png
      approach.png
      laugh.png
    triton/
    sophie/
    margaret/
```

方式:

> **character × animation file + metadata**

Atlasは必要になった時だけbuild assetとして検討。

---

# 4. Animation Metadata

新規候補:

`js/data/animations.js`

概念:

```js
karen: {
  walk: {
    src: 'assets/sprites/heroes/karen/walk.png',
    frameW: 48,
    frameH: 48,
    frames: [0,1,2,3,4,5],
    fps: 8,
    loop: true,
    directions: 4,
    anchor: [24,44],
    offset: [0,0]
  }
}
```

初期field:
- src
- frameW / frameH
- frames
- fps
- loop
- directions
- anchor
- offset

必要になってから:
- soundCue
- eventCue

---

# 5. Animation Runtime

新規候補:

`js/systems/animation.js`

責務:
- actor animation state
- frame timing
- direction
- loop
- one-shot completion callback

Game Saveへ常時保存しない。

---

# 6. Actor Runtime

Scene用の軽量transient state:

```text
ActorRuntime
  id
  visualX / visualY
  facing
  animation
  visible
  layer
  sceneOverride
```

通常Gameplayはstate.x/yを参照。

Scene中のみoverrideする。

---

# 7. Event Integration

既存EVENT_DEFSを維持。

Enhanced Eventだけoptionalに:

```text
scene: [ ...beats ]
```

を持てる案。

通常Eventは今まで通りlinesで動く。

Beat候補:
- wait
- actorTurn
- actorMove
- actorAnim
- lookAt
- dialogue
- cameraFocus
- cameraZoom
- cameraReturn
- sound
- music
- fade

Prototypeでは全部実装しない。

Minimum:
- wait
- actorTurn
- actorMove
- actorAnim
- dialogue
- cameraFocus
- cameraReturn
- sound

---

# 8. Minimal SceneRunner

新規候補:

`js/systems/cinematic.js`

責務:
1. scene start
2. input lock
3. beats sequential execution
4. finish
5. actor/camera override解除
6. event effects実行
7. input unlock

GUI editor / timeline editorは作らない。

---

# 9. Event completion order

**Scene完了前にevent completeしない。**

```text
runTriggeredEvent
  -> play scene
  -> scene completes
  -> applyEventEffects
```

Prototype途中でpage reloadした場合はsceneを最初から再演する方が安全。

---

# 10. Camera

大規模Camera class不要。

既存VISUALにconceptually:

```text
cameraOverride:
  active
  focusX / focusY
  scale
  offsetX / offsetY
```

を追加し、cameraForMap()がoverride targetを返す。

Prototype:
- focus
- small offset
- hold
- return

のみ。

---

# 11. Dialogue

既存say()を壊さない。

presentation option候補:

```text
portraitMode:
  full
  pixel
  none
```

Prototype Sceneからnoneを指定できるようにしてA/B比較する。

Speaker name / typewriter / choiceは維持。

---

# 12. Audio

現行GC.Audioへの追加候補:

- pauseMusic()
- resumeMusic()
- stopMusic()
- playCue(name)
- setAmbient(name) later

Prototypeはfootstep + optional reaction cue程度。

---

# 13. Lighting / Effects

Prototypeではparticle systemを作らない。

最小:
- simple overlay
- fade
- focus vignette

---

# 14. Battle

最初のPrototypeでは変更しない。

正式採用後、
`js/render/battle.js`とCSSのhard-coded 32px sheet参照をanimation metadataへ移す。

Battle CORE:
- Ready
- Attack
- Hit
- Guard

は後段。

---

# 15. Save compatibility

Sceneはtransient。

Scene中:
- input lock
- save disabled

Scene終了:
- actor/camera transient state破棄
- event effectsのみ永続化

PrototypeではSave schema 23を維持する方針。

---

# 16. Tests

Node:
- animation metadata validation
- one-shot completion
- actor turn / move beat
- scene ordering
- input lock
- event effects after scene
- camera reset
- save blocked during scene
- no transient state serialized
- animation reference validation

Browser:
- Karen scene starts/ends
- portrait-none path
- no input leak
- camera returns
- normal movement resumes

Asset invariant:
- 48px cell dimension
- expected directions / frames
- no missing refs

---

# 17. Script order

classic scriptsを維持。

追加候補:

```text
js/data/animations.js
js/systems/animation.js
js/systems/cinematic.js
```

`tests/harness.js` SCRIPT_ORDERも同期する。

ES Modules化は不要。

---

# 18. 承認後の変更候補

- `index.html` — script include
- `js/data/animations.js` — new
- `js/systems/animation.js` — new
- `js/systems/cinematic.js` — new
- `js/render/world.js` — metadata actor render / camera override
- `js/systems/dialogue.js` — portrait mode
- `js/systems/events.js` — optional scene path
- `js/systems/audio.js` — cues
- `tests/harness.js`
- new tests

Prototypeでは極力触らない:
- `js/data/maps.js`
- `js/systems/movement.js`
- `js/core/save.js`
- `js/systems/battle.js`

---

# 19. 判定

現在のv23 ArchitectureはPixel-native Prototypeに**適合可能**。

全面改修は不要。
