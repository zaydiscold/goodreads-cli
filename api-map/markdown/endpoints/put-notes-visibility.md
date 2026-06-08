# Notes 07 — PUT /notes/{book_id}/{annotation_pair_id}/visibility

Mutation: yes
Risk: write-mutate
Confidence: inferred-unverified

Summary: Toggle individual note visibility (ON/OFF switch per note).

Inferred from the per-note "Visible: ON/OFF" toggle on the notes detail page.
Exact endpoint and body parameters NOT confirmed — needs live CDP capture.

Likely: PUT with form body visible=true/false, or POST to /notes/{book_id}/{annotation_pair_id}/note
with note[visible]=true/false.

Safety: Disabled by default. Requires approved write capture before CLI support.
