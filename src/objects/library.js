import * as THREE from "three";

// Deterministic RNG so the shelves look the same on every reload.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Grand walnut library bookcase.
 * Origin = floor centre, front faces +Z, ~6.25 wide x 7.1 tall.
 *
 * options:
 *  seed       - change for a different book arrangement
 *  ladder     - rolling ladder + brass rail
 *  warmLights - warm point lights in front of each shelf
 *  door       - ajar door beside the bookcase, warm light spilling from the next room
 *  doorSide   - "left" | "right" (which side of the bookcase the door is on)
 *  doorOpen   - how far the door is open, in radians (0 = closed, no light spill)
 *  doorGap    - space between the bookcase and the door frame
 */
export function createLibrary({
  seed = 7,
  ladder = true,
  warmLights = true,
  door = true,
  doorSide = "left",
  doorOpen = 0,
  doorGap = 1.3,
} = {}) {
  const rand = mulberry32(seed);
  const range = (a, b) => a + rand() * (b - a);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const library = new THREE.Group();
  library.name = "Library";

  // =====================
  // Materials
  // =====================
  const mat = (color, o = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });

  const M = {
    walnut: mat(0x3a1e10, { roughness: 0.5 }),
    walnutLight: mat(0x6b4226, { roughness: 0.6 }),
    back: mat(0x1e0f09, { roughness: 0.95 }),
    brass: mat(0xc9a24a, { metalness: 0.85, roughness: 0.32 }),
    paper: mat(0xe9dfc4, { roughness: 0.9 }),
    ceramic: mat(0x1d3a5f, { roughness: 0.22, metalness: 0.1 }),
    ocean: mat(0x1c3f5e, { roughness: 0.35, metalness: 0.15 }),
    glow: new THREE.MeshStandardMaterial({
      color: 0xffd9a0,
      emissive: 0xffb45a,
      emissiveIntensity: 2.2,
    }),
  };

  const bookColors = [
    0x5a1a1f, // oxblood
    0x1f3a2c, // forest
    0x1b2a49, // navy
    0x8a5a2b, // tan leather
    0x3b2a22, // umber
    0x2d2f36, // charcoal
    0x6b2f3a, // burgundy
    0x23463f, // teal green
    0x7a6a3a, // olive gold
    0x40284f, // plum
  ];

  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const add = (geo, material, x, y, z, parent = library) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  // =====================
  // Carcass
  // =====================
  const shelfY = [1.9, 3.4, 4.9, 6.4]; // shelf board centres (top one is the ceiling of the last bay)

  // back panel
  add(box(5.04, 6.5, 0.12), M.back, 0, 3.65, -0.39);

  // sides
  add(box(0.3, 7.0, 0.9), M.walnut, -2.65, 3.5, 0);
  add(box(0.3, 7.0, 0.9), M.walnut, 2.65, 3.5, 0);

  // plinth + moulding
  add(box(6.0, 0.4, 1.05), M.walnut, 0, 0.2, 0.03);
  add(box(5.85, 0.06, 0.98), M.walnutLight, 0, 0.43, 0.0);

  // frieze
  add(box(5.6, 0.4, 0.9), M.walnut, 0, 6.65, 0);

  // stepped cornice
  add(box(5.9, 0.1, 1.0), M.walnut, 0, 6.9, 0);
  add(box(6.1, 0.09, 1.1), M.walnutLight, 0, 6.995, 0);
  add(box(6.25, 0.07, 1.16), M.walnut, 0, 7.075, 0);

  // dentils under the cornice
  for (let x = -2.6; x <= 2.61; x += 0.2) {
    add(box(0.1, 0.1, 0.08), M.walnutLight, x, 6.77, 0.49);
  }

  // brass medallion on the frieze
  const medal = add(
    new THREE.CylinderGeometry(0.16, 0.16, 0.03, 40),
    M.brass,
    0,
    6.65,
    0.46,
  );
  medal.rotation.x = Math.PI / 2;
  const medalRing = add(
    new THREE.TorusGeometry(0.11, 0.012, 8, 40),
    M.walnut,
    0,
    6.65,
    0.48,
  );
  medalRing.castShadow = false;

  // pilasters with base, capital and brass inlay
  [-2.65, 2.65].forEach((x) => {
    add(box(0.22, 6.0, 0.12), M.walnutLight, x, 3.45, 0.51);
    add(box(0.32, 0.12, 0.18), M.walnut, x, 0.5, 0.52);
    add(box(0.32, 0.12, 0.18), M.walnut, x, 6.42, 0.52);
    add(box(0.03, 5.8, 0.02), M.brass, x, 3.45, 0.575);
  });

  // =====================
  // Shelves
  // =====================
  shelfY.forEach((y) => {
    add(box(5.0, 0.1, 0.82), M.walnutLight, 0, y, 0.03);
    add(box(5.0, 0.025, 0.02), M.brass, 0, y, 0.445); // brass front inlay

    const strip = add(box(4.8, 0.025, 0.03), M.glow, 0, y - 0.065, 0.38);
    strip.castShadow = false;
  });

  if (warmLights) {
    shelfY.forEach((y) => {
      const l = new THREE.PointLight(0xffb870, 2.5, 3.2, 2);
      l.position.set(0, y - 0.25, 0.42);
      library.add(l);
    });
  }

  // =====================
  // Books
  // =====================
  const BACK_Z = -0.2; // where every book's back sits

  function makeBook(w, h, d, color) {
    const g = new THREE.Group();

    const cover = new THREE.Mesh(
      box(w, h, d),
      mat(color, { roughness: range(0.5, 0.85) }),
    );
    cover.castShadow = true;
    cover.receiveShadow = true;
    g.add(cover);

    // raised gold bands on the spine
    const bands = rand() < 0.5 ? [0.3, 0.36, -0.32] : [0.34, -0.34];
    bands.forEach((f) => {
      const b = new THREE.Mesh(box(w + 0.012, 0.028, 0.012), M.brass);
      b.position.set(0, h * f, d / 2);
      g.add(b);
    });

    // title plate
    if (rand() < 0.75) {
      const plate = new THREE.Mesh(
        box(w * 0.62, h * 0.2, 0.012),
        rand() < 0.6 ? M.brass : M.paper,
      );
      plate.position.set(0, h * 0.0, d / 2);
      g.add(plate);
    }
    return g;
  }

  function placeBook(x, base, w, h, d, pull = 0) {
    const color = pick(bookColors);
    const g = makeBook(w, h, d, color);
    g.position.set(x + w / 2, base + h / 2, BACK_Z + d / 2 + pull);
    library.add(g);
  }

  function placeStack(x, base) {
    const n = 3 + Math.floor(rand() * 2);
    const baseLen = range(0.75, 0.95);
    let y = base;
    for (let i = 0; i < n; i++) {
      const t = range(0.11, 0.17);
      const len = baseLen * range(0.85, 1.0);
      const cover = add(
        box(len, t, 0.5),
        mat(pick(bookColors), { roughness: 0.6 }),
        x + baseLen / 2 + range(-0.04, 0.04),
        y + t / 2,
        0.05,
      );
      cover.receiveShadow = true;
      add(box(len - 0.03, t - 0.03, 0.52), M.paper, cover.position.x, cover.position.y, 0.05);
      y += t;
    }
    return x + baseLen + 0.06;
  }

  function placeLeaningBook(edgeX, base, lastH) {
    const theta = 0.26;
    const w = range(0.26, 0.34);
    const d = 0.46;
    const h = (lastH - 0.05 + w * Math.sin(theta)) / Math.cos(theta);

    const pivot = new THREE.Group();
    pivot.position.set(
      edgeX + w * Math.cos(theta) + h * Math.sin(theta),
      base,
      BACK_Z + d / 2,
    );
    const book = makeBook(w, h, d, pick(bookColors));
    book.position.set(-w / 2, h / 2, 0);
    pivot.add(book);
    pivot.rotation.z = theta;
    library.add(pivot);
    return pivot.position.x;
  }

  // =====================
  // Decor
  // =====================
  function makeGlobe() {
    const g = new THREE.Group();
    add(new THREE.CylinderGeometry(0.22, 0.25, 0.05, 32), M.brass, 0, 0.025, 0, g);
    add(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 16), M.brass, 0, 0.2, 0, g);

    const ball = new THREE.Group();
    ball.position.set(0, 0.62, 0);
    ball.rotation.z = 0.4;
    add(new THREE.SphereGeometry(0.33, 40, 28), M.ocean, 0, 0, 0, ball);

    const grid = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(0.336, 12, 8)),
      new THREE.LineBasicMaterial({
        color: 0xc9a24a,
        transparent: true,
        opacity: 0.55,
      }),
    );
    ball.add(grid);

    const meridian = add(new THREE.TorusGeometry(0.37, 0.014, 10, 64), M.brass, 0, 0, 0, ball);
    meridian.castShadow = false;
    g.add(ball);
    return g;
  }

  function makeVase() {
    const pts = [
      [0.0, 0.0],
      [0.12, 0.0],
      [0.14, 0.05],
      [0.2, 0.2],
      [0.22, 0.35],
      [0.16, 0.52],
      [0.09, 0.62],
      [0.11, 0.7],
      [0.14, 0.76],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const g = new THREE.Group();
    add(new THREE.LatheGeometry(pts, 36), M.ceramic, 0, 0, 0, g);
    const rim = add(new THREE.TorusGeometry(0.14, 0.012, 8, 36), M.brass, 0, 0.76, 0, g);
    rim.rotation.x = Math.PI / 2;
    const belt = add(new THREE.TorusGeometry(0.218, 0.01, 8, 36), M.brass, 0, 0.34, 0, g);
    belt.rotation.x = Math.PI / 2;
    return g;
  }

  // =====================
  // Fill each bay
  // =====================
  const plans = [
    { end: 0.75, deco: "globe" },
    { end: 2.45, stack: true },
    { end: 0.6, deco: "vase" },
    { end: 2.45, stack: true },
  ];

  plans.forEach((plan, k) => {
    const base = k === 0 ? 0.4 : shelfY[k - 1] + 0.05;
    let x = -2.42;
    let lastH = 1.0;
    let stackDone = false;

    while (x < plan.end - 0.25) {
      if (plan.stack && !stackDone && x > -1.2 && rand() < 0.25 && plan.end - x > 1.2) {
        x = placeStack(x, base);
        stackDone = true;
        continue;
      }

      const folio = rand() < 0.08;
      const w = folio ? range(0.42, 0.5) : range(0.22, 0.4);
      const h = folio ? 1.26 : range(0.85, 1.2);
      const d = range(0.42, 0.56);
      const pull = rand() < 0.1 ? 0.05 : 0;

      placeBook(x, base, w, h, d, pull);
      lastH = h;
      x += w + 0.02;
    }

    if (plan.end < 2.4) placeLeaningBook(x - 0.02, base, lastH);

    if (plan.deco === "globe") {
      const globe = makeGlobe();
      globe.position.set(1.9, base, 0.05);
      library.add(globe);
    }
    if (plan.deco === "vase") {
      const vase = makeVase();
      vase.scale.setScalar(0.85);
      vase.position.set(1.85, base, 0.05);
      library.add(vase);
    }
  });

  // vases on top of the cornice
  [-2.2, 2.2].forEach((x) => {
    const v = makeVase();
    v.position.set(x, 7.11, 0);
    library.add(v);
  });

  // =====================
  // Brass rail + rolling ladder
  // =====================
  if (ladder) {
    const rail = add(
      new THREE.CylinderGeometry(0.022, 0.022, 5.4, 16),
      M.brass,
      0,
      6.63,
      0.62,
    );
    rail.rotation.z = Math.PI / 2;

    [-2.4, 0, 2.4].forEach((x) => add(box(0.05, 0.05, 0.18), M.brass, x, 6.63, 0.54));

    const H = 6.7;
    const lad = new THREE.Group();
    [-0.26, 0.26].forEach((x) => add(box(0.06, H, 0.05), M.walnutLight, x, H / 2, 0, lad));

    for (let i = 0; i < 10; i++) {
      const r = add(
        new THREE.CylinderGeometry(0.022, 0.022, 0.52, 12),
        M.walnutLight,
        0,
        0.55 + i * 0.62,
        0,
        lad,
      );
      r.rotation.z = Math.PI / 2;
    }
    [-0.26, 0.26].forEach((x) => add(box(0.07, 0.05, 0.14), M.brass, x, H - 0.02, -0.06, lad));

    lad.rotation.x = -0.14; // lean the top onto the rail
    lad.position.set(-1.1, 0, 1.54);
    library.add(lad);
  }

  // =====================
  // Door to the next room
  // =====================
  if (door) {
    const s = doorSide === "right" ? 1 : -1; // +1 = right of the bookcase
    const W = 2.6; // clear opening width
    const H = 6.0; // clear opening height
    const J = 0.24; // jamb width
    const cx = s * (3.125 + doorGap + W / 2 + J);
    const isOpen = doorOpen > 0.01;

    const doorGroup = new THREE.Group();
    doorGroup.position.set(cx, 0, 0);
    library.add(doorGroup);

    // --- gradient textures (browser only) ---
    const makeTex = (draw, w, h) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      draw(c.getContext("2d"), w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };

    // glowing room beyond the door
    const roomTex = makeTex((ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#7a4a22");
      g.addColorStop(0.55, "#e0a25a");
      g.addColorStop(1, "#ffd69a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }, 8, 128);

    if (isOpen) {
      const opening = new THREE.Mesh(
        new THREE.PlaneGeometry(W, H),
        new THREE.MeshBasicMaterial({ map: roomTex, toneMapped: false }),
      );
      opening.position.set(0, 0.04 + H / 2, -0.43);
      doorGroup.add(opening);
    }

    // --- frame (architrave) ---
    [-1, 1].forEach((k) => {
      add(box(J, H + 0.3, 0.2), M.walnut, k * (W / 2 + J / 2), (H + 0.3) / 2, -0.35, doorGroup);
    });
    add(box(W + 2 * J + 0.04, 0.26, 0.22), M.walnut, 0, H + 0.17, -0.34, doorGroup);
    add(box(W + 2 * J + 0.3, 0.08, 0.26), M.walnutLight, 0, H + 0.34, -0.33, doorGroup);
    add(box(W + 2 * J + 0.14, 0.06, 0.24), M.walnutLight, 0, H + 0.25, -0.33, doorGroup);
    // brass threshold
    add(box(W + 0.1, 0.04, 0.3), M.brass, 0, 0.02, -0.3, doorGroup);

    // --- door leaf, hinged on the side away from the bookcase ---
    const Wl = W - 0.04;
    const Hl = H - 0.04;
    const leaf = new THREE.Group();
    leaf.position.set(s * (W / 2 - 0.01), 0.04, -0.32);
    leaf.rotation.y = s * doorOpen;
    doorGroup.add(leaf);

    const cxLeaf = -s * (Wl / 2);
    add(box(Wl, Hl, 0.1), M.walnut, cxLeaf, Hl / 2, 0, leaf);

    // raised panels on both faces
    const pw = Wl * 0.36;
    const panels = [
      { y: Hl * 0.74, h: Hl * 0.3 },
      { y: Hl * 0.27, h: Hl * 0.38 },
    ];
    [-1, 1].forEach((face) => {
      panels.forEach((p) => {
        [-1, 1].forEach((col) => {
          add(
            box(pw, p.h, 0.03),
            M.walnutLight,
            cxLeaf + col * Wl * 0.225,
            p.y,
            face * 0.06,
            leaf,
          );
        });
      });
    });

    // knob, plate and hinges
    const knobX = -s * (Wl - 0.22);
    [-1, 1].forEach((face) => {
      add(box(0.09, 0.3, 0.015), M.brass, knobX, 3.1, face * 0.058, leaf);
      add(new THREE.SphereGeometry(0.07, 20, 16), M.brass, knobX, 3.1, face * 0.11, leaf);
    });
    [0.7, 3.0, 5.3].forEach((y) => {
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 12), M.brass, s * 0.01, y, 0.0, leaf);
    });

    // --- light spilling into this room ---
    if (isOpen && warmLights) {
      const spill = new THREE.PointLight(0xffc27a, 6, 9, 2);
      spill.position.set(cx - s * 0.2, 3.2, 0.3);
      doorGroup.parent.add(spill);
    }

    const beamTex = makeTex((ctx, w, h) => {
      const v = ctx.createLinearGradient(0, 0, 0, h);
      v.addColorStop(0, "rgba(255,205,130,0.75)");
      v.addColorStop(1, "rgba(255,205,130,0)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "destination-in";
      const hg = ctx.createLinearGradient(0, 0, w, 0);
      hg.addColorStop(0, "rgba(0,0,0,0)");
      hg.addColorStop(0.3, "rgba(0,0,0,1)");
      hg.addColorStop(0.7, "rgba(0,0,0,1)");
      hg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, w, h);
    }, 64, 128);

    const a = W * 0.45;
    const b = W * 0.95;
    const L = 3.8;
    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-a, 0, -0.25, a, 0, -0.25, b, 0, L, -b, 0, L],
        3,
      ),
    );
    beamGeo.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2),
    );
    beamGeo.setIndex([0, 2, 1, 0, 3, 2]);

    if (isOpen) {
    const beam = new THREE.Mesh(
      beamGeo,
      new THREE.MeshBasicMaterial({
        map: beamTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    );
    beam.position.set(-s * 0.15, 0.012, 0);
    beam.renderOrder = 2;
    doorGroup.add(beam);
    }
  }

  return library;
}