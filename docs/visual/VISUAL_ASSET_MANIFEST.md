# VISUAL_ASSET_MANIFEST.md

**Game baseline:** v23  
**Visual patch:** rev 23.1

| Asset / system | Runtime | Design status | Notes |
|---|---|---|---|
| assets/hero_party_walk.png | ACTIVE | **PROVISIONAL** | Stable technical format; not a Character Design source. |
| assets/hero_party_walk_whitehair.png | REMOVED | ARCHIVE CLEANED | Removed during repository hygiene; it was byte-identical to the active sprite and had no repository references. See `docs/audit/FILE_HYGIENE.md`. |
| assets/hero_party_walk_replacement.png | INACTIVE | ARCHIVE | Intermediate visual-patch asset. |
| assets/hero_party_walk_v23_original.png | INACTIVE | ROLLBACK | Pre-patch rollback sprite. |
| js/data/npcs.js hero dialogue portraits | ACTIVE | **PROVISIONAL** | Placeholder face geometry; Margaret hair synchronized to white. |

## Mandatory production order

**Character Design → Character Reference → Pixel Sprite**

Do not derive canonical anatomy, face, costume, weapon, or hairstyle from the current runtime sprite.
