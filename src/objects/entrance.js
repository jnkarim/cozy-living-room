import * as THREE from "three";

/**
 * Grand hall entrance to the drawing room.
 * Deep green damask wall, cream classical portico, walnut double doors with
 * glowing frosted glass and a fanlight, marble floor, oxblood runner,
 * brass candle sconces and framed paintings.
 *
 * Faces +Z (camera starts outside, looking towards -Z).
 *
 * userData:
 *   leaves  - the two door leaf pivots (raycast targets)
 *   setOpen - setOpen(0..1) swings both leaves inward
 *   pulse   - pulse(timeSeconds) makes the glass glow breathe
 */
export function createEntrance({
  frontZ = 12.5,
  doorW = 3.6,
  doorH = 5.6,
  wallW = 46,
  wallH = 14,
} = {}) {
  const g = new THREE.Group();
  g.name = "Entrance";

  const T = 0.6; // wall thickness
  const R = doorW / 2; // fanlight radius
  const J = 0.4; // architrave width
  const OPEN_ANGLE = 1.75;

  // =====================
  // Helpers
  // =====================
  const mat = (color, o = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });

  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const add = (geo, m, x, y, z, parent = g) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const canvasTex = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };

  const cream = mat(0xe6d9bd, { roughness: 0.5 });
  const creamShade = mat(0x9c8f72, { roughness: 0.8 });
  const walnut = mat(0x3a1e10, { roughness: 0.45 });
  const walnutLight = mat(0x5e3820, { roughness: 0.4 });
  const brass = mat(0xc9a24a, { metalness: 0.85, roughness: 0.3 });
  const panelGreen = mat(0x2c463a, { roughness: 0.8 });

  // =====================
  // Textures
  // =====================
  const wallTex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#2c4a3e";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.09})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.strokeStyle = "rgba(214,178,100,0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(214,178,100,0.3)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
  wallTex.repeat.set(1 / 3, 1 / 3); // extruded UVs are in world units

  const floorTex = canvasTex(512, 512, (ctx, w, h) => {
    const s = w / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 ? "#17171a" : "#e8e0cc";
        ctx.fillRect(c * s, r * s, s, s);
      }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle =
        i % 2 ? "rgba(255,255,255,0.10)" : "rgba(90,80,70,0.12)";
      ctx.beginPath();
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(
        x0 + 60 * Math.random(),
        y0 + 80 * Math.random(),
        x0 - 60 * Math.random(),
        y0 + 120 * Math.random(),
        x0 + 40 * Math.random() - 20,
        y0 + 180 * Math.random(),
      );
      ctx.stroke();
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(wallW / 2.8, 16 / 2.8);

  const runnerTex = canvasTex(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = "#5a1a1f";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    ctx.strokeStyle = "#d6b264";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    ctx.lineWidth = 3;
    for (let y = 130; y < h - 100; y += 170) {
      ctx.beginPath();
      ctx.moveTo(w / 2, y - 55);
      ctx.lineTo(w / 2 + 45, y);
      ctx.lineTo(w / 2, y + 55);
      ctx.lineTo(w / 2 - 45, y);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#d6b264";
      ctx.fill();
    }
  });

  const glassTex = canvasTex(64, 256, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#ffe2a8");
    gr.addColorStop(1, "#eaa553");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 3);
    }
  });

  const fanTex = canvasTex(256, 256, (ctx, w, h) => {
    const gr = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "#fff0c8");
    gr.addColorStop(0.6, "#f2b865");
    gr.addColorStop(1, "#d98c3a");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: glassTex,
    emissiveIntensity: 1.3,
  });
  const fanMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: fanTex,
    emissiveIntensity: 1.3,
  });

  // =====================
  // Wall (shape with a door + arch opening)
  // =====================
  const shape = new THREE.Shape();
  shape.moveTo(-wallW / 2, 0);
  shape.lineTo(wallW / 2, 0);
  shape.lineTo(wallW / 2, wallH);
  shape.lineTo(-wallW / 2, wallH);
  shape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-R, 0);
  hole.lineTo(R, 0);
  hole.lineTo(R, doorH);
  hole.absarc(0, doorH, R, 0, Math.PI, false);
  hole.lineTo(-R, 0);
  shape.holes.push(hole);

  const wallGeo = new THREE.ExtrudeGeometry(shape, {
    depth: T,
    bevelEnabled: false,
    curveSegments: 48,
  });
  wallGeo.translate(0, 0, -T / 2);
  const wall = new THREE.Mesh(
    wallGeo,
    new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  wall.position.z = frontZ;
  wall.receiveShadow = true;
  g.add(wall);

  const wallFront = frontZ + T / 2;

  // =====================
  // Wainscot
  // =====================
  const wainStart = R + J;
  const wainW = wallW / 2 - wainStart;
  [-1, 1].forEach((s) => {
    const cx = s * (wainStart + wainW / 2);
    add(box(wainW, 3.3, 0.12), panelGreen, cx, 1.65, wallFront + 0.06);
    add(box(wainW, 0.55, 0.22), cream, cx, 0.275, wallFront + 0.11); // skirting
    add(box(wainW, 0.16, 0.3), cream, cx, 3.4, wallFront + 0.12); // chair rail

    for (let i = 0; i < 5; i++) {
      const px = s * (4.0 + i * 2.6);
      const pw = 1.9;
      const ph = 2.1;
      const py = 1.85;
      add(
        box(pw, ph, 0.04),
        mat(0x35564a, { roughness: 0.8 }),
        px,
        py,
        wallFront + 0.14,
      );
      const b = 0.06;
      add(box(pw + b, b, 0.07), cream, px, py + ph / 2, wallFront + 0.15);
      add(box(pw + b, b, 0.07), cream, px, py - ph / 2, wallFront + 0.15);
      add(box(b, ph, 0.07), cream, px - pw / 2, py, wallFront + 0.15);
      add(box(b, ph, 0.07), cream, px + pw / 2, py, wallFront + 0.15);
    }
  });

  // =====================
  // Portico: architrave, arch, pilasters, entablature, pediment
  // =====================
  [-1, 1].forEach((s) => {
    add(box(J, doorH, T + 0.3), cream, s * (R + J / 2), doorH / 2, frontZ);
  });

  const arch = add(
    new THREE.TorusGeometry(R + J / 2, J / 2, 14, 72, Math.PI),
    cream,
    0,
    doorH,
    frontZ + 0.2,
  );
  arch.scale.z = 1.3;

  add(box(0.42, 0.55, 0.36), cream, 0, doorH + R + J / 2 + 0.25, frontZ + 0.3); // keystone
  add(box(0.3, 0.3, 0.04), brass, 0, doorH + R + J / 2 + 0.25, frontZ + 0.5);

  const pH = 7.68;
  const pilasterX = R + J + 0.6;
  [-1, 1].forEach((s) => {
    const x = s * pilasterX;
    const z = wallFront + 0.12;
    add(box(0.9, 0.3, 0.7), cream, x, 0.15, z);
    add(
      new THREE.CylinderGeometry(0.3, 0.33, pH, 28),
      cream,
      x,
      0.3 + pH / 2,
      z,
    );
    for (let a = -70; a <= 70; a += 20) {
      const r = (a * Math.PI) / 180;
      const fl = add(
        box(0.04, pH - 0.8, 0.03),
        creamShade,
        x + Math.sin(r) * 0.315,
        0.3 + pH / 2,
        z + Math.cos(r) * 0.315,
      );
      fl.rotation.y = r;
      fl.castShadow = false;
    }
    add(
      new THREE.CylinderGeometry(0.42, 0.3, 0.28, 28),
      cream,
      x,
      0.3 + pH + 0.14,
      z,
    );
    add(box(0.9, 0.14, 0.9), cream, x, 0.3 + pH + 0.35, z);
  });

  // entablature with name plaque
  const entY = 8.75;
  const entW = pilasterX * 2 + 1.0;
  add(box(entW, 0.7, 0.9), cream, 0, entY, frontZ + 0.35);
  add(box(entW + 0.3, 0.16, 1.05), cream, 0, entY + 0.43, frontZ + 0.38);

  const plaqueTex = canvasTex(512, 64, (ctx, w, h) => {
    ctx.fillStyle = "#2a150b";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c9a24a";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = "#e6c36f";
    ctx.font = "600 34px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    try {
      ctx.letterSpacing = "8px";
    } catch (e) {
      /* no letter spacing support */
    }
    ctx.fillText("DRAWING ROOM", w / 2, h / 2 + 2);
  });
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 0.575),
    new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.45,
      metalness: 0.2,
    }),
  );
  plaque.position.set(0, entY, frontZ + 0.81);
  g.add(plaque);

  // pediment
  const ped = new THREE.Shape();
  ped.moveTo(-entW / 2 - 0.15, 0);
  ped.lineTo(entW / 2 + 0.15, 0);
  ped.lineTo(0, 1.15);
  ped.closePath();
  const pedGeo = new THREE.ExtrudeGeometry(ped, {
    depth: 0.5,
    bevelEnabled: false,
  });
  const pediment = new THREE.Mesh(pedGeo, cream);
  pediment.position.set(0, entY + 0.51, frontZ + 0.1);
  pediment.castShadow = true;
  g.add(pediment);
  const roundel = add(
    new THREE.CylinderGeometry(0.32, 0.32, 0.05, 32),
    brass,
    0,
    entY + 0.95,
    frontZ + 0.63,
  );
  roundel.rotation.x = Math.PI / 2;

  // =====================
  // Fanlight (glowing half-disc with brass muntins)
  // =====================
  const fan = new THREE.Mesh(
    new THREE.CircleGeometry(R, 48, 0, Math.PI),
    fanMat,
  );
  fan.position.set(0, doorH, frontZ - 0.12);
  g.add(fan);

  for (let i = 1; i <= 5; i++) {
    const a = (i * Math.PI) / 6;
    const sp = add(
      box(0.045, R, 0.05),
      brass,
      Math.cos(a) * (R / 2),
      doorH + Math.sin(a) * (R / 2),
      frontZ - 0.08,
    );
    sp.rotation.z = a - Math.PI / 2;
    sp.castShadow = false;
  }
  const ring = add(
    new THREE.TorusGeometry(R * 0.52, 0.022, 8, 48, Math.PI),
    brass,
    0,
    doorH,
    frontZ - 0.08,
  );
  ring.castShadow = false;

  // =====================
  // Double doors (inward opening)
  // =====================
  const Wl = R - 0.015;
  const Hl = doorH - 0.06;
  const midY = 3.3;
  const glassBottom = midY + 0.15;
  const glassTop = Hl - 0.4;
  const gh = glassTop - glassBottom;
  const gw = Wl - 0.74;

  function buildLeaf(m) {
    const pivot = new THREE.Group();
    pivot.position.set(m * -R, 0.05, frontZ - 0.05);
    g.add(pivot);

    const X = (x) => m * x;

    // frame: stiles and rails
    add(box(0.34, Hl, 0.2), walnut, X(0.17), Hl / 2, 0, pivot);
    add(box(0.4, Hl, 0.2), walnut, X(Wl - 0.2), Hl / 2, 0, pivot);
    add(box(Wl, 0.4, 0.2), walnut, X(Wl / 2), Hl - 0.2, 0, pivot);
    add(box(Wl, 0.3, 0.2), walnut, X(Wl / 2), midY, 0, pivot);
    add(box(Wl, 0.45, 0.2), walnut, X(Wl / 2), 0.225, 0, pivot);

    // glowing glass
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), glassMat);
    glass.position.set(X(0.34 + gw / 2), glassBottom + gh / 2, 0.0);
    pivot.add(glass);
    const glass2 = glass.clone();
    glass2.rotation.y = Math.PI;
    pivot.add(glass2);

    // muntins
    const gx = X(0.34 + gw / 2);
    const gy = glassBottom + gh / 2;
    [-1, 1].forEach((face) => {
      add(box(0.05, gh, 0.05), brass, gx, gy, face * 0.03, pivot);
      add(box(gw, 0.05, 0.05), brass, gx, gy - gh / 6, face * 0.03, pivot);
      add(box(gw, 0.05, 0.05), brass, gx, gy + gh / 6, face * 0.03, pivot);
    });

    // raised lower panel, both faces
    const pw = gw;
    const ph = midY - 0.15 - 0.45;
    [-1, 1].forEach((face) => {
      add(box(pw, ph, 0.06), walnutLight, gx, 0.45 + ph / 2, face * 0.1, pivot);
      add(
        box(pw - 0.32, ph - 0.32, 0.05),
        walnut,
        gx,
        0.45 + ph / 2,
        face * 0.13,
        pivot,
      );
    });

    // brass kick plate, pull handle, hinges
    add(box(Wl - 0.5, 0.36, 0.02), brass, X(Wl / 2), 0.25, 0.11, pivot);
    [-1, 1].forEach((face) => {
      const hx = X(Wl - 0.22);
      add(
        new THREE.CylinderGeometry(0.035, 0.035, 1.0, 14),
        brass,
        hx,
        3.1,
        face * 0.26,
        pivot,
      );
      [2.75, 3.45].forEach((y) => {
        const st = add(
          new THREE.CylinderGeometry(0.025, 0.025, 0.16, 10),
          brass,
          hx,
          y,
          face * 0.18,
          pivot,
        );
        st.rotation.x = Math.PI / 2;
      });
    });
    [0.9, 3.0, 5.0].forEach((y) => {
      add(
        new THREE.CylinderGeometry(0.035, 0.035, 0.3, 12),
        brass,
        0,
        y,
        0,
        pivot,
      );
    });

    return pivot;
  }

  const leftLeaf = buildLeaf(1); // hinged left, extends +x
  const rightLeaf = buildLeaf(-1); // hinged right, extends -x

  // brass threshold
  add(box(doorW, 0.05, 0.7), brass, 0, 0.025, frontZ);

  // =====================
  // Hall floor + runner
  // =====================
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(wallW, 16),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.18,
      metalness: 0.05,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, frontZ + 8);
  floor.receiveShadow = true;
  g.add(floor);

  const runner = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 14),
    new THREE.MeshStandardMaterial({ map: runnerTex, roughness: 0.95 }),
  );
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(0, 0.012, frontZ + 7.4);
  runner.receiveShadow = true;
  g.add(runner);

  // =====================
  // Pedestals with vases
  // =====================
  const vasePts = [
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

  [-1, 1].forEach((s) => {
    const x = s * 4.7;
    const z = wallFront + 0.45;
    add(box(0.75, 0.16, 0.75), cream, x, 0.08, z);
    add(box(0.55, 1.3, 0.55), cream, x, 0.81, z);
    add(box(0.8, 0.14, 0.8), cream, x, 1.53, z);

    const vase = new THREE.Group();
    vase.position.set(x, 1.6, z);
    vase.scale.setScalar(1.25);
    add(
      new THREE.LatheGeometry(vasePts, 36),
      mat(0x1d3a5f, { roughness: 0.22, metalness: 0.1 }),
      0,
      0,
      0,
      vase,
    );
    const rim = add(
      new THREE.TorusGeometry(0.14, 0.012, 8, 36),
      brass,
      0,
      0.76,
      0,
      vase,
    );
    rim.rotation.x = Math.PI / 2;
    const belt = add(
      new THREE.TorusGeometry(0.218, 0.01, 8, 36),
      brass,
      0,
      0.34,
      0,
      vase,
    );
    belt.rotation.x = Math.PI / 2;
    g.add(vase);
  });

  // =====================
  // Sconces
  // =====================
  function sconce(x) {
    const s = new THREE.Group();
    s.position.set(x, 5.0, wallFront + 0.03);
    g.add(s);

    const plate = add(
      new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28),
      brass,
      0,
      0,
      0,
      s,
    );
    plate.rotation.x = Math.PI / 2;
    plate.scale.z = 1.8;

    const arm = add(
      new THREE.CylinderGeometry(0.03, 0.03, 0.45, 10),
      brass,
      0,
      -0.1,
      0.22,
      s,
    );
    arm.rotation.x = Math.PI / 2;
    add(
      new THREE.CylinderGeometry(0.12, 0.07, 0.1, 18),
      brass,
      0,
      -0.1,
      0.46,
      s,
    );

    add(
      new THREE.CylinderGeometry(0.04, 0.04, 0.26, 12),
      mat(0xf1e6cc, { roughness: 0.8 }),
      0,
      0.08,
      0.46,
      s,
    );
    const flame = add(
      new THREE.SphereGeometry(0.05, 14, 12),
      new THREE.MeshStandardMaterial({
        color: 0xffe6b0,
        emissive: 0xffb45a,
        emissiveIntensity: 3,
      }),
      0,
      0.27,
      0.46,
      s,
    );
    flame.scale.set(0.8, 1.6, 0.8);
    flame.castShadow = false;

    const shade = add(
      new THREE.CylinderGeometry(0.17, 0.25, 0.36, 28, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xf3e3c0,
        emissive: 0xffa94d,
        emissiveIntensity: 0.55,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      }),
      0,
      0.25,
      0.46,
      s,
    );
    shade.castShadow = false;

    const l = new THREE.PointLight(0xffc27a, 8, 10, 2);
    l.position.set(0, 0.25, 0.75);
    s.add(l);
  }
  [-6.4, 6.4].forEach(sconce);

  // =====================
  // Paintings
  // =====================
  function painting(pal, seed) {
    return canvasTex(256, 340, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
      sky.addColorStop(0, pal.sky1);
      sky.addColorStop(1, pal.sky2);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const sun = ctx.createRadialGradient(
        w * 0.66,
        h * 0.44,
        4,
        w * 0.66,
        h * 0.44,
        90,
      );
      sun.addColorStop(0, pal.sun);
      sun.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      pal.hills.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y =
            h * (0.55 + i * 0.12) +
            Math.sin(x * (0.02 + i * 0.01) + seed + i * 2) * (14 + i * 6) +
            Math.sin(x * 0.05 + seed * 2) * 4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      });
    });
  }

  function framed(x, y, w, h, tex) {
    const f = new THREE.Group();
    f.position.set(x, y, wallFront + 0.06);
    g.add(f);
    const b = 0.16;
    add(box(w + 2 * b, b, 0.14), brass, 0, h / 2 + b / 2, 0, f);
    add(box(w + 2 * b, b, 0.14), brass, 0, -h / 2 - b / 2, 0, f);
    add(box(b, h, 0.14), brass, -w / 2 - b / 2, 0, 0, f);
    add(box(b, h, 0.14), brass, w / 2 + b / 2, 0, 0, f);
    add(box(w, h, 0.04), walnut, 0, 0, -0.02, f);
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 }),
    );
    canvas.position.z = 0.03;
    f.add(canvas);

    // picture light
    add(box(w * 0.5, 0.06, 0.06), brass, 0, h / 2 + b + 0.2, 0.22, f);
    add(box(0.04, 0.22, 0.04), brass, 0, h / 2 + b + 0.1, 0.12, f);
  }

  framed(
    -9.4,
    5.0,
    2.3,
    3.0,
    painting(
      {
        sky1: "#1b2a49",
        sky2: "#e39a55",
        sun: "rgba(255,226,170,0.95)",
        hills: ["#6a4a3a", "#3f3a3a", "#22272e"],
      },
      1.3,
    ),
  );
  framed(
    9.4,
    5.0,
    2.3,
    3.0,
    painting(
      {
        sky1: "#2b4a5c",
        sky2: "#c9d8a8",
        sun: "rgba(255,244,200,0.9)",
        hills: ["#6b8a54", "#3f6b49", "#1f3d30"],
      },
      4.1,
    ),
  );

  // =====================
  // Lights
  // =====================
  const spot = new THREE.SpotLight(0xffe3b3, 160, 30, 0.55, 0.8, 2);
  spot.position.set(0, 13, frontZ + 7);
  spot.target.position.set(0, 4.2, frontZ);
  g.add(spot, spot.target);

  const fill = new THREE.PointLight(0xffd9a0, 14, 26, 2);
  fill.position.set(0, 6, frontZ + 6);
  g.add(fill);

  // =====================
  // API
  // =====================
  g.userData.leaves = [leftLeaf, rightLeaf];
  g.userData.setOpen = (p) => {
    leftLeaf.rotation.y = OPEN_ANGLE * p;
    rightLeaf.rotation.y = -OPEN_ANGLE * p;
  };
  g.userData.pulse = (t) => {
    const v = 1.25 + Math.sin(t * 2.2) * 0.25;
    glassMat.emissiveIntensity = v;
    fanMat.emissiveIntensity = v;
  };

  return g;
}
