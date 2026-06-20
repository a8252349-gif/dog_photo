import { BACKGROUNDS } from "@/lib/backgrounds";
import type { BackgroundKey, TearOption } from "@/lib/types";

export function buildPetIdPhotoPrompt({
  backgroundKey,
  tearOption,
}: {
  backgroundKey: BackgroundKey;
  tearOption: TearOption;
}) {
  const background = BACKGROUNDS[backgroundKey];
  const tearInstruction =
    tearOption === "clean"
      ? `Naturally remove visible tear stains and eye discharge only. Reconstruct clean, realistic fur around the eyes while preserving the original eye shape, eyelids, facial contours, fur direction, and coat color. Do not bleach, blur, over-whiten, or beautify the face.`
      : `Preserve the natural eye area, including subtle tear staining if present. Do not excessively clean, whiten, blur, or stylize the fur around the eyes.`;

  return `
All uploaded reference images show the same individual pet.
Create one highly photorealistic professional pet ID portrait of this exact individual pet.

PRIORITY 1 — PRESERVE THE PET'S EXACT IDENTITY:
Use the first uploaded image as the primary identity reference. Use the second and third images only to confirm facial structure, left-right markings, ear shape, coat texture, and details hidden in the first image.

Preserve the exact individual characteristics:
- species and breed traits
- skull, head, cheek, and muzzle proportions
- eye shape, spacing, size, direction, and color
- nose shape, nostrils, texture, and color
- ear shape, size, placement, fold, and natural asymmetry
- coat color, markings, fur length, density, curl, and growth direction
- whiskers, gray hairs, scars, wrinkles, visible teeth, and age-related traits
- natural facial expression and natural mouth position

Never create a generic prettier animal of the same breed. Never beautify, idealize, redesign, average, mirror, reverse, or replace the pet. Do not enlarge the eyes, shorten the muzzle, slim the face, increase fluffiness, remove gray hairs, change markings, or force perfect symmetry.

${tearInstruction}

PRIORITY 2 — STRICT BUST PORTRAIT ONLY, NEVER FULL BODY:
This instruction is non-negotiable.

Create a front-facing bust portrait cropped through the upper chest, similar to a formal head-and-shoulders studio portrait.

The final frame must show only:
- the complete head
- both complete ears
- the neck
- both shoulders
- a short portion of the upper chest

The pet's shoulders and upper chest must continue beyond the bottom edge of the frame. The lower edge must intersect the upper chest naturally.

The following must be completely outside the image and must never be visible:
- front legs or forelegs
- elbows
- paws or feet
- belly or lower torso
- hips
- hind legs
- tail
- sitting pose
- standing pose
- floor, table, pedestal, or any surface beneath the pet
- full-body silhouette

Do not fit the entire animal inside the canvas. Do not show the pet sitting. Do not show the pet from head to paws. Do not create a three-quarter-body portrait. This is a head, shoulders, and upper-chest portrait only.

PRIORITY 3 — SMALLER BUST SCALE WITH AT LEAST 40 PERCENT BACKGROUND:
The pet must not dominate the frame. Increase negative space around the bust while keeping the lower body completely outside the image.

The visible pet silhouette must occupy no more than approximately 55 to 60 percent of the total canvas area. The solid background must occupy at least approximately 40 to 45 percent of the total canvas area.

Use these framing targets:
- vertical portrait orientation designed for the final 5:7 crop
- widest visible part of the head and ears approximately 38 to 46 percent of the canvas width
- widest visible part of the shoulders no more than approximately 55 percent of the canvas width
- approximately 22 to 28 percent clean background above the highest ear tip
- approximately 22 to 28 percent clean background between the pet and each left and right edge
- eyes positioned around 46 to 51 percent down from the top edge
- the pet centered horizontally
- the upper chest reaches and continues beyond the bottom edge
- complete ears, whiskers, cheeks, chin, neck, and shoulders safely inside the frame

A result where the pet looks large, tightly cropped, or fills most of the image is incorrect. Prefer a smaller bust and more empty background.

Do not create extra background by revealing the legs, paws, belly, lower torso, or floor. The correct solution is to reduce the scale of the head-and-shoulders bust while keeping the crop through the upper chest.

Do not create a floating head. The neck, shoulders, and a short portion of the upper chest must remain visible and anatomically connected.

PRIORITY 4 — STRICT STRAIGHT HEAD AND NECK ALIGNMENT:
This instruction is non-negotiable for dogs, cats, and every other pet species.

The pet must look directly toward the camera while holding the head and neck perfectly upright in a formal ID-photo posture.

Required alignment:
- the vertical center line of the forehead, nose, muzzle, chin, throat, and chest must form one straight vertical axis
- the neck must rise vertically from the center of the shoulders
- the head must sit directly above the neck, not leaning toward either shoulder
- the line connecting both eyes must be horizontal
- the nose must be centered beneath the midpoint between the eyes
- the shoulders should be level and balanced
- both sides of the face should appear at the same camera distance when anatomically possible
- preserve natural ear asymmetry, but do not allow ear asymmetry to tilt the skull or neck

Strictly forbidden:
- head tilt to the left or right
- neck tilt or lateral neck bend
- rolled head angle
- diagonal facial axis
- one eye noticeably higher than the other because of pose
- chin pointing toward either shoulder
- body leaning sideways
- playful questioning head-tilt pose
- three-quarter head rotation
- looking away from the camera

If the reference photos show a tilted head or neck, correct only the pose and reconstruct a physically plausible upright front-facing posture. Do not copy the tilt. Preserve the pet's identity, facial proportions, markings, and natural asymmetry while correcting the pose.

A result is incorrect if the pet faces forward but the head or neck is tilted. Both the gaze and the entire head-neck axis must be straight.

PRIORITY 5 — CAMERA AND NATIVE 5:7 SAFE COMPOSITION:
- straight-on eye-level camera angle
- head and neck upright, centered, and vertically aligned
- both eyes visible when anatomically appropriate
- no tilted horizon
- no perspective distortion
- no wide-angle distortion
- no tight face-only close-up
- no full-body or seated portrait

Compose the original generated image so that a very small centered top-and-bottom crop to 5:7 will preserve all ears, whiskers, cheeks, chin, neck, shoulders, and the intended background margins.

PRIORITY 6 — ONE NATIVE EDGE-TO-EDGE BACKGROUND:
Use one solid matte ${background.label} background with the exact color ${background.hex}.

The background must be generated as part of one complete photograph and must fill every pixel of the original canvas from edge to edge.

Required background properties:
- identical continuous color behind the pet and at all four outer edges
- completely full-bleed from left edge to right edge and top edge to bottom edge
- visibly generous negative space around the pet
- seamless, flat, smooth, and uniform
- no floor plane, horizon line, corner, studio sweep line, or ground shadow
- no side panels, vertical strips, margins, borders, frames, mattes, or blank areas
- no pasted-photo appearance
- no outpainting, extension, cloning, stretching, patching, or stitched-edge appearance
- no mismatched color at the left or right edge
- no gradient, texture, vignette, pattern, object, text, logo, symbol, or watermark

Do not solve the wider framing by adding side strips or extending a previously cropped image. Generate the smaller bust natively inside one complete full-width solid background.

CLEANUP:
Remove collars, harnesses, clothes, hats, costumes, accessories, human hands, furniture, and surrounding objects. Reconstruct naturally covered fur where an object was removed.

LIGHTING AND REALISM:
Use soft frontal studio lighting, neutral white balance, realistic catchlights, even exposure, sharp natural eyes, realistic nose texture, and detailed unretouched fur. Shadows must be extremely soft and minimal. No beauty filter, colored light, rim glow, dramatic contrast, illustration, cartoon, painting, or 3D-rendered appearance.

FINAL CHECK BEFORE OUTPUT:
1. Is this unmistakably the exact same individual pet?
2. Are only the complete head, ears, neck, shoulders, and upper chest visible?
3. Are all paws, legs, belly, hips, tail, sitting pose, and floor completely absent?
4. Does the upper chest continue beyond the bottom edge?
5. Does the visible pet occupy no more than about 60 percent of the canvas area?
6. Does the solid background occupy at least about 40 percent of the canvas area?
7. Is there generous background above both ears and on both sides?
8. Are the head, neck, facial center line, and shoulders upright with no left or right tilt?
9. Is the ${background.label} background continuous at every edge with no side strips or patched areas?

Output one complete photorealistic studio photograph with absolutely no text. Text will be added later by the website.
`.trim();
}
