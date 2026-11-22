# Bulk supply shopping and paid-rest safety — 2026-11-17

Base: 23825d1af02efc90b89db17b1a4c83aa3f9340ad, existing draft PR #106.

Kingdom and imperial markets now open a persistent purchase panel with authored item effects, owned stock, unit prices, quantities 1/3/5, total cost, post-purchase stock and remaining gold. Selecting items/quantities never spends money. A purchase requires the explicit priced button; successful purchases keep the panel open for additional supplies. Escape/close restores field focus. Prices remain 18/30/22 in the capital and 20/27/18 in the imperial city.

Quotes are bound to the open shop, party, location and UI revision. Closing, changing selection, moving/loading, inventory or gold changes invalidate old quotes. Retained/double-clicked purchase buttons cannot purchase twice; insufficient funds and the existing 999-item save cap block purchases. Existing modal movement/focus handling applies. The legacy buyItem helper rejects unknown items and nonpositive/invalid costs/quantities.

Paid rest now shows funds and fee, does not offer paid healing when already full, and rechecks resources/party/location before spending. A retained rest action can succeed at most once. This does not change rest prices or recovery amounts.

Verification: all 417 Node tests passed, zero failures/skips; six new regression cases cover price previews, regional bulk costs, saves, invalid quantities, shortages/caps, stale quotes, inaccessible shops and paid-rest waste/repetition. Source and standalone DOM integration passed actual item/quantity selection, old detached button, total, purchase, repeat prevention, shortage, movement lock and Escape/focus, alongside all prior UI checks. Hygiene, authority and JS syntax passed; six Python release integrity/rights checks and both builds passed (43 assets, 42 game scripts).

Actual browser screenshots/layout, audio, full playthrough and browser Save/Continue remain unverified because of the already-observed Chromium socket permission restriction. DOM uses a stubbed canvas and does not establish visual quality. Art, story, rewards, prices and save schema 23 remain unchanged. Draft development candidate only.
