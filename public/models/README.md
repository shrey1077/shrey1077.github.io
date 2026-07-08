# /public/models

3D model assets served statically.

## `brain.glb` — the anatomical brain (installed)

The homepage brain is a **real human-brain mesh** (detailed anatomical model,
decimated to ~130k triangles). It is loaded and **recoloured in code** by
[`src/components/brain/BrainModel.ts`](../../src/components/brain/BrainModel.ts):
the mesh's own normals give the gyri/sulci their photographic shading, while the
albedo is thrown away and repainted per-vertex — monochrome graphite on the left
hemisphere (x < 0), a front→back watercolour spectrum on the right (x > 0).

Pipeline used to produce it (from the source OBJ):

```
obj2gltf            OBJ (+ stripped mtl, no textures) → GLB
gltf-transform weld + simplify(0.5)                   → ~130k tris
```

Kept **uncompressed** (~3.5 MB, plain float attributes) on purpose: drei's
`useGLTF` did not decode a meshopt-compressed variant here, producing garbled
geometry, so no runtime decoder is relied upon. If shrinking this later, verify
the decoder is actually wired (meshopt/draco) before shipping.

### Swapping in a different mesh

`BrainModel.ts` is authored against the `BrainGeometrySet` interface and only
needs the model to load via `useGLTF`. Tunables at the top of that file:
`MODEL_ROTATION` (orient superior → +Y, front → +Z), `CREATIVE_SIGN` (which side
is the colour hemisphere), `SPECTRUM_FLIP` (pink at front vs back). Everything
downstream (interaction, responsive scaling, lighting) is unaffected.
