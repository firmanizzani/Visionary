# Visionary AI design

The workspace answers: what objects are in this frame, and how confident is the model?
Its primary object is the analyzed image, paired with predictions from that exact frame.
The workbench leads; threshold, visualization, categories and privacy sit beside it.
Objects are class ID, label, confidence, original-pixel box and aspect-correct 160px RLE mask.
The counting scope is one analyzed frame. There is no tracking or session-wide unique count.
Dashboard quantities come from saved rows. New accounts show honest zeros and next actions.
History shows the user's photographs, source, date and real categories.
Analytics uses UTC day bins, category counts, source counts and weighted mean confidence.
Phone navigation folds into a drawer; image aspect ratio and overlay coordinate space stay shared.

Direction: Framed sheet, seed 1525734396. Pale blue-grey frame from the product palette,
white inset sheet, quiet rules, teal on AI data, navy on the primary action. DM Sans is bundled.
Brand colours are kept from the user brief. No palette redraws. The product's unique device
is the paired camera-frame canvas and box/mask controls, not an invented dashboard statistic.
Landing: everyday objects become a clearly labelled illustrated segmentation scene.
Claims: identify objects locally; understand shape/count; retain only chosen discoveries;
the pipeline and privacy copy explain the evidence. Actions open the real detector.
The illustration is drawn in CSS and contains no real model results, stock photos or claims of accuracy.

## Final visual review

ROUND 3
Seen in one second: an image-analysis workspace, with a central local-inference canvas.
Idea: the same analyzed frame anchors both prediction overlays and explicitly saved history.
Live thing: real ONNX inference, threshold filtering, class counts and box/mask switching.
Layout: workbench with controls/results rail; responsive single-column phone view.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6.
No photographic or motion floor applies to app screens. The landing scene is explicitly an illustration.
Final production inspector: 0 FAIL at 1440, 768, 390. Remaining WARNs concern 12px secondary
metadata density and a few secondary text samples close to the 4.5:1 contrast boundary.
All final fold and page-contact screenshots were opened. Desktop and phone keep clear titles,
source controls and image aspect ratios. Real saved image/mask alignment and activity bars were
also visually reviewed after the production browser suite.
The tablet's long range-end descriptions are a remaining small spacing weakness; the slider
value and control are readable and functional. Product metadata is deliberately smaller than primary labels.
No fake statistical data or customer proof appears in the product. Test images are fixtures only.

Questions by screen: overview = what have I saved? detection = what is in this frame?
history = which discovery should I revisit? detail = what did this snapshot contain?
analytics = which objects and sources occur in my saved detections? settings = what defaults should I use?

Dependency note: bits-ui's runed helper still declares an optional SvelteKit 2 peer.
The project uses patched SvelteKit 3 and tests the used dialog APIs. `.npmrc` accommodates
that optional peer until upstream expands its declaration.
