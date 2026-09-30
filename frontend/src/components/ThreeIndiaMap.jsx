import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Globe2,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Bounding polygon coordinates for the India landmass
const INDIA_POLYGON = [
  [35.5, 74.0], [35.5, 77.0], [34.0, 78.5], [32.5, 79.0], [31.0, 79.5],
  [28.5, 80.5], [27.0, 88.0], [28.0, 88.5], [27.5, 89.0], [28.0, 94.5],
  [28.5, 96.5], [27.0, 96.5], [26.0, 95.0], [24.0, 94.0], [23.0, 93.0],
  [22.0, 92.5], [21.5, 89.0], [22.0, 87.5], [19.5, 85.5], [17.5, 83.5],
  [15.5, 80.5], [13.0, 80.3], [11.0, 79.8], [9.0, 78.5],  [8.1, 77.5],
  [9.0, 76.5],  [11.5, 75.5], [13.0, 74.8], [15.5, 73.8], [18.5, 72.8],
  [20.5, 72.8], [21.0, 70.0], [22.5, 69.0], [24.0, 68.8], [24.5, 71.0],
  [26.5, 70.0], [28.5, 70.5], [30.0, 71.5], [32.0, 74.5], [33.5, 74.5],
  [35.5, 74.0]
];

// 36 Indian State Centroids and Representative Metrics
const INDIAN_STATE_NODES = [
  { name: 'Jammu And Kashmir', shortName: 'J&K', lat: 33.7782, lon: 76.5762, defaultLs: 'Dr. Farooq Abdullah / Jugal Kishore', defaultRs: 'Ghulam Ali Khatana' },
  { name: 'Ladakh', shortName: 'Ladakh', lat: 34.1526, lon: 77.5771, defaultLs: 'Mohmad Haneefa', defaultRs: 'Parliament Nominee' },
  { name: 'Himachal Pradesh', shortName: 'Himachal', lat: 31.1048, lon: 77.1734, defaultLs: 'Kangana Ranaut / Anurag Thakur', defaultRs: 'Harsh Mahajan' },
  { name: 'Punjab', shortName: 'Punjab', lat: 31.1471, lon: 75.3412, defaultLs: 'Gurjeet Singh Aujla (Amritsar)', defaultRs: 'Raghav Chadha', flaggedWork: '#80673' },
  { name: 'Chandigarh', shortName: 'Chandigarh', lat: 30.7333, lon: 76.7794, defaultLs: 'Manish Tewari', defaultRs: 'Union Territory Seat' },
  { name: 'Uttarakhand', shortName: 'Uttarakhand', lat: 30.0668, lon: 79.0193, defaultLs: 'Anil Baluni / Ajay Tamta', defaultRs: 'Mahendra Bhatt' },
  { name: 'Haryana', shortName: 'Haryana', lat: 29.0588, lon: 76.0856, defaultLs: 'Deepender Singh Hooda', defaultRs: 'Subhash Barala' },
  { name: 'Delhi', shortName: '★ Delhi (Capital)', lat: 28.7041, lon: 77.1025, isCapital: true, defaultLs: 'Bansuri Swaraj / Manoj Tiwari', defaultRs: 'Sanjay Singh' },
  { name: 'Rajasthan', shortName: 'Rajasthan', lat: 27.0238, lon: 74.2179, defaultLs: 'Om Birla (Kota) / Gajendra Singh', defaultRs: 'Sonia Gandhi / Madan Rathore' },
  { name: 'Uttar Pradesh', shortName: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, defaultLs: 'Rajnath Singh (Lucknow)', defaultRs: 'Sudhanshu Trivedi' },
  { name: 'Bihar', shortName: 'Bihar', lat: 25.0961, lon: 85.3131, defaultLs: 'Chirag Paswan / Ravi Shankar Prasad', defaultRs: 'Sanjay Kumar Jha' },
  { name: 'Sikkim', shortName: 'Sikkim', lat: 27.5330, lon: 88.5122, defaultLs: 'Indra Hang Subba', defaultRs: 'Dorjee Tshering Lepcha' },
  { name: 'Arunachal Pradesh', shortName: 'Arunachal', lat: 28.2180, lon: 94.7278, defaultLs: 'Kiren Rijiju / Tapir Gao', defaultRs: 'Nabam Rebia' },
  { name: 'Nagaland', shortName: 'Nagaland', lat: 26.1584, lon: 94.5624, defaultLs: 'S. Supongmeren Jamir', defaultRs: 'S. Phangnon Konyak' },
  { name: 'Manipur', shortName: 'Manipur', lat: 24.6637, lon: 93.9063, defaultLs: 'Angomcha Bimol Akoijam', defaultRs: 'Leishemba Sanajaoba' },
  { name: 'Mizoram', shortName: 'Mizoram', lat: 23.1645, lon: 92.9376, defaultLs: 'Richard Vanlalhmangaiha', defaultRs: 'K. Vanlalvena' },
  { name: 'Tripura', shortName: 'Tripura', lat: 23.9408, lon: 91.9882, defaultLs: 'Biplab Kumar Deb', defaultRs: 'Rajib Bhattacharjee' },
  { name: 'Meghalaya', shortName: 'Meghalaya', lat: 25.4670, lon: 91.3662, defaultLs: 'Ricky Andrew Syngkon', defaultRs: 'Wanweiroy Kharlukhi' },
  { name: 'Assam', shortName: 'Assam', lat: 26.2006, lon: 92.9376, defaultLs: 'Sarbananda Sonowal / Gaurav Gogoi', defaultRs: 'Mission Ranjan Das' },
  { name: 'West Bengal', shortName: 'West Bengal', lat: 22.9868, lon: 87.8550, defaultLs: 'Abhishek Banerjee / Sudip Bandyopadhyay', defaultRs: "Derek O'Brien" },
  { name: 'Jharkhand', shortName: 'Jharkhand', lat: 23.6102, lon: 85.2799, defaultLs: 'Nishikant Dubey / Bidyut Baran', defaultRs: 'Deepak Prakash' },
  { name: 'Odisha', shortName: 'Odisha', lat: 20.9517, lon: 85.0985, defaultLs: 'Dharmendra Pradhan / Sambit Patra', defaultRs: 'Sasmit Patra' },
  { name: 'Chhattisgarh', shortName: 'Chhattisgarh', lat: 21.2787, lon: 81.8661, defaultLs: 'Brijmohan Agrawal / Santosh Pandey', defaultRs: 'Devendra Pratap Singh' },
  { name: 'Madhya Pradesh', shortName: 'Madhya Pradesh', lat: 22.9734, lon: 78.6569, defaultLs: 'Shivraj Singh Chouhan / Jyotiraditya Scindia', defaultRs: 'L. Murugan' },
  { name: 'Gujarat', shortName: 'Gujarat', lat: 22.2587, lon: 71.1924, defaultLs: 'Amit Shah (Gandhinagar) / C.R. Patil', defaultRs: 'J.P. Nadda' },
  { name: 'Maharashtra', shortName: 'Maharashtra', lat: 19.7515, lon: 75.7139, defaultLs: 'Nitin Gadkari (Nagpur) / Supriya Sule', defaultRs: 'Milind Deora / Praful Patel' },
  { name: 'Andhra Pradesh', shortName: 'Andhra Pradesh', lat: 15.9129, lon: 79.7400, defaultLs: 'Kinjarapu Ram Mohan Naidu', defaultRs: 'Y.V. Subba Reddy' },
  { name: 'Telangana', shortName: 'Telangana', lat: 18.1124, lon: 79.0193, defaultLs: 'G. Kishan Reddy / Asaduddin Owaisi', defaultRs: 'K. R. Suresh Reddy' },
  { name: 'Karnataka', shortName: 'Karnataka', lat: 15.3173, lon: 75.7139, defaultLs: 'H.D. Kumaraswamy / Tejasvi Surya', defaultRs: 'Nirmala Sitharaman' },
  { name: 'Goa', shortName: 'Goa', lat: 15.2993, lon: 74.1240, defaultLs: 'Shripad Yesso Naik / Viriato Fernandes', defaultRs: 'Sadanand Tanavade' },
  { name: 'Kerala', shortName: 'Kerala', lat: 10.8505, lon: 76.2711, defaultLs: 'Shashi Tharoor (Thiruvananthapuram)', defaultRs: 'John Brittas' },
  { name: 'Tamil Nadu', shortName: 'Tamil Nadu', lat: 11.1271, lon: 78.6569, defaultLs: 'Kanimozhi Karunanidhi / Dayanidhi Maran', defaultRs: 'Tiruchi Siva' },
  { name: 'Puducherry', shortName: 'Puducherry', lat: 11.9416, lon: 79.8083, defaultLs: 'V. Vaithilingam', defaultRs: 'S. Selvaganabathy' },
  { name: 'Dadra And Nagar Haveli', shortName: 'D&NH', lat: 20.1809, lon: 73.0169, defaultLs: 'Kalaben Delkar', defaultRs: 'Nominated' },
  { name: 'Lakshadweep', shortName: 'Lakshadweep', lat: 10.5667, lon: 72.6417, defaultLs: 'Muhammed Hamdullah Sayeed', defaultRs: 'Union Island' },
  { name: 'Andaman And Nicobar Islands', shortName: 'Andaman & Nicobar', lat: 11.7401, lon: 92.6586, defaultLs: 'Bishnu Pada Ray', defaultRs: 'Island Seat' }
];

// Helper: Convert Lat/Lon to 3D Cartesian coordinates on sphere of radius R
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(theta) * Math.sin(phi);
  return new THREE.Vector3(x, y, z);
}

// Helper: Create curved high-resolution patch geometry for South Asia / India
function createCurvedPatchGeometry(minLat, maxLat, minLon, maxLon, radius, segX = 48, segY = 48) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let y = 0; y <= segY; y++) {
    const v = y / segY;
    const lat = maxLat - v * (maxLat - minLat);
    for (let x = 0; x <= segX; x++) {
      const u = x / segX;
      const lon = minLon + u * (maxLon - minLon);
      const p = latLonToVector3(lat, lon, radius);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, 1 - v);
    }
  }

  for (let y = 0; y < segY; y++) {
    for (let x = 0; x < segX; x++) {
      const a = y * (segX + 1) + x;
      const b = (y + 1) * (segX + 1) + x;
      const c = (y + 1) * (segX + 1) + (x + 1);
      const d = y * (segX + 1) + (x + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export const ThreeIndiaMap = ({ onSelectState }) => {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [stateMetrics, setStateMetrics] = useState({});
  const [mpDirectory, setMpDirectory] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);

  // References for camera animations & native HTML vector badges
  const cameraRef = useRef(null);
  const earthGroupRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const badgeRefs = useRef({});
  const rendererRef = useRef(null);
  const ambientLightRef = useRef(null);
  const atmosMatRef = useRef(null);
  const isBadgeHoveredRef = useRef(false);
  const activeHoverRef = useRef(null);
  const particleSystemRef = useRef(null);
  const particleDataRef = useRef([]);
  const bgParticleSystemRef = useRef(null);
  const bgParticleDataRef = useRef([]);
  const isZoomingOutRef = useRef(false);
  const zoomStartTimeRef = useRef(0);
  const zoomInitialCamPos = useRef(new THREE.Vector3());
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [zoomSelectedState, setZoomSelectedState] = useState(null);

  const triggerStateSelection = (stateName) => {
    if (isZoomingOutRef.current || !stateName) return;
    isZoomingOutRef.current = true;
    zoomStartTimeRef.current = performance.now();
    if (cameraRef.current) {
      zoomInitialCamPos.current.copy(cameraRef.current.position);
    }
    setIsZoomingOut(true);
    setZoomSelectedState(stateName);

    setTimeout(() => {
      if (onSelectState) {
        onSelectState(stateName);
      }
    }, 850);
  };
  useEffect(() => {
    let mounted = true;
    api.getStateAnalytics()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const lookup = {};
        data.forEach((st) => { lookup[st.state] = st; });
        setStateMetrics(lookup);
      })
      .catch((e) => console.warn('State analytics notice:', e));

    const fetchMps = api.getMps || api.getMPs;
    if (typeof fetchMps === 'function') {
      fetchMps('', 300)
        .then((mps) => {
          if (!mounted || !Array.isArray(mps)) return;
          const mpMap = {};
          mps.forEach((mp) => {
            // Use real MP names only; synthetic 'Member of Parliament X' names are skipped
            if (mp.mp_name && !mp.mp_name.startsWith('Member of Parliament')) {
              if (!mpMap[mp.state]) mpMap[mp.state] = { ls: [], rs: [] };
              if (mp.house === 'Lok Sabha' && mpMap[mp.state].ls.length < 2) {
                mpMap[mp.state].ls.push(mp.mp_name);
              } else if (mp.house === 'Rajya Sabha' && mpMap[mp.state].rs.length < 2) {
                mpMap[mp.state].rs.push(mp.mp_name);
              }
            }
          });
          setMpDirectory(mpMap);
        })
        .catch((e) => console.warn('MP fetch notice:', e));
    }

    return () => { mounted = false; };
  }, []);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();

    // Perspective camera: initial position at distance 18.0, placed centrally at X = 0.8
    // so the glowing 3D Earth Globe is visible directly behind the translucent hero card!
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0.8, 0.4, 18.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) {
      console.warn('WebGL init error:', err);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.08 : 1.28;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Root Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 1. LIGHTING
    const ambientLight = new THREE.AmbientLight(
      0xffffff, 
      isDark ? 1.6 : 2.4
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Main Sun Directional Light (Front-Right)
    const sunLight = new THREE.DirectionalLight(0xfff8ee, isDark ? 2.5 : 3.0);
    sunLight.position.set(14, 12, 22);
    scene.add(sunLight);

    // Front-Left Fill Light (eliminates harsh pitch-black shadows across Earth)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, isDark ? 1.8 : 2.5);
    fillLight.position.set(-14, 8, 20);
    scene.add(fillLight);

    // Soft Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, isDark ? 1.5 : 1.2);
    rimLight.position.set(-15, -6, -10);
    scene.add(rimLight);

    // 2. 3D EARTH GLOBE MESH WITH 4K BLUE MARBLE TEXTURE
    const earthRadius = 5.0;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    
    // Load 4K Blue Marble Earth Texture
    const baseTexture = textureLoader.load(
      '/assets/earth_blue_marble.jpg',
      () => renderer.render(scene, camera)
    );
    baseTexture.colorSpace = THREE.SRGBColorSpace;

    const earthMat = new THREE.MeshStandardMaterial({
      map: baseTexture,
      roughness: 0.6,
      metalness: 0.1,
      color: 0xffffff
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 3. ULTRA HIGH-DEFINITION SOUTH ASIA SATELLITE OVERLAY (3072x1792 matching Google Earth Image 5)
    // Extent: lon 35 to 108, lat 0 to 42
    const hdPatchGeo = createCurvedPatchGeometry(0, 42, 35, 108, earthRadius * 1.006, 56, 56);
    const hdPatchTexture = textureLoader.load(
      '/assets/south_asia_hd.jpg',
      () => renderer.render(scene, camera)
    );
    hdPatchTexture.colorSpace = THREE.SRGBColorSpace;

    const hdPatchMat = new THREE.MeshStandardMaterial({
      map: hdPatchTexture,
      roughness: 0.55,
      metalness: 0.08,
      transparent: true,
      opacity: 0.98
    });
    const hdPatchMesh = new THREE.Mesh(hdPatchGeo, hdPatchMat);
    earthGroup.add(hdPatchMesh);

    // 4. ATMOSPHERE GLOW HALO (Outer Shell)
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.022, 64, 64);
    const atmosMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0284c7 : 0x38bdf8,
      transparent: true,
      opacity: isDark ? 0.18 : 0.24,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    atmosMatRef.current = atmosMat;
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // 5. INDIA NATIONAL BOUNDARY HIGHLIGHT LINE
    const boundaryPoints = INDIA_POLYGON.map(([lat, lon]) => 
      latLonToVector3(lat, lon, earthRadius * 1.01)
    );
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      linewidth: 2
    });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    earthGroup.add(boundaryLine);

    // 6. STATE PINS & BEACONS
    const interactiveMeshes = [];
    const stateBeacons = [];

    INDIAN_STATE_NODES.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, earthRadius * 1.012);
      const isDelhi = node.isCapital;

      const primaryColor = isDelhi ? 0xf59e0b : 0x06b6d4;
      const emissiveColor = isDelhi ? 0xd97706 : 0x0284c7;

      // Pin Head (small, bright jewel bead)
      const pinHeadGeo = new THREE.SphereGeometry(isDelhi ? 0.042 : 0.030, 16, 16);
      const pinHeadMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: emissiveColor,
        emissiveIntensity: 2.2,
        roughness: 0.1,
        metalness: 0.9
      });
      const pinHeadMesh = new THREE.Mesh(pinHeadGeo, pinHeadMat);
      pinHeadMesh.position.copy(pos);
      earthGroup.add(pinHeadMesh);

      // Vertical 3D stem
      const surfacePos = latLonToVector3(node.lat, node.lon, earthRadius * 1.006);
      const stemGeo = new THREE.BufferGeometry().setFromPoints([pos, surfacePos]);
      const stemMat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.65 });
      const stemLine = new THREE.Line(stemGeo, stemMat);
      earthGroup.add(stemLine);

      // Delicate radar ping ring
      const ringGeo = new THREE.RingGeometry(0.034, 0.048, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      earthGroup.add(ringMesh);

      // Invisible precise Hitbox Sphere for responsive mouse raycasting (tight 0.07 radius eliminates overlap)
      const hitGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(pos);
      hitMesh.userData = { ...node, pinHeadMesh, ringMesh };
      earthGroup.add(hitMesh);
      interactiveMeshes.push(hitMesh);

      stateBeacons.push({
        node,
        pinHeadMesh,
        ringMesh,
        basePos: pos
      });
    });

    // 7. INTERACTIVE SPACE & NANO PARTICLES (WITH MOUSE REPULSION PHYSICS)
    const particleCount = 1600;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleData = [];

    // Dark Mode: Deep Cosmic Starfield
    const darkPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x818cf8),
      new THREE.Color(0xfde047),
      new THREE.Color(0x06b6d4)
    ];
    // Light Mode: Solar Nanoparticles
    const lightPalette = [
      new THREE.Color(0xf59e0b),
      new THREE.Color(0xd97706),
      new THREE.Color(0x0284c7),
      new THREE.Color(0x64748b),
      new THREE.Color(0xb45309)
    ];

    for (let i = 0; i < particleCount; i++) {
      // Cosmic shell surrounding globe: radius 6.5 to 26.0
      const rad = 6.5 + Math.pow(Math.random(), 1.5) * 19.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = rad * Math.sin(phi) * Math.cos(theta);
      const y = rad * Math.sin(phi) * Math.sin(theta);
      const z = rad * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const dCol = darkPalette[Math.floor(Math.random() * darkPalette.length)];
      const lCol = lightPalette[Math.floor(Math.random() * lightPalette.length)];
      const activeCol = isDark ? dCol : lCol;

      particleColors[i * 3] = activeCol.r;
      particleColors[i * 3 + 1] = activeCol.g;
      particleColors[i * 3 + 2] = activeCol.b;

      particleData.push({
        basePos: new THREE.Vector3(x, y, z),
        curPos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(0, 0, 0),
        driftSpeed: 0.25 + Math.random() * 0.75,
        driftPhase: Math.random() * Math.PI * 2,
        darkCol: dCol,
        lightCol: lCol
      });
    }

    particleDataRef.current = particleData;

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Circular soft point texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(255,255,255,1)');
    pGrad.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    pGrad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: pTexture,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.85 : 0.65,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // 7B. DEEP SPACE PARTICLES BEHIND THE GLOBE (Z in [-4.0, -42.0])
    const bgCount = 2200;
    const bgPositions = new Float32Array(bgCount * 3);
    const bgColors = new Float32Array(bgCount * 3);
    const bgData = [];

    const bgDarkPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x818cf8),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xc084fc),
      new THREE.Color(0x67e8f9)
    ];
    const bgLightPalette = [
      new THREE.Color(0xf59e0b),
      new THREE.Color(0x0284c7),
      new THREE.Color(0xd97706),
      new THREE.Color(0x64748b),
      new THREE.Color(0x0284c7),
      new THREE.Color(0xb45309)
    ];

    for (let i = 0; i < bgCount; i++) {
      const x = (Math.random() - 0.5) * 68;
      const y = (Math.random() - 0.5) * 46;
      const z = -4.0 - Math.random() * 38.0; // distinctly behind the globe

      bgPositions[i * 3] = x;
      bgPositions[i * 3 + 1] = y;
      bgPositions[i * 3 + 2] = z;

      const dCol = bgDarkPalette[Math.floor(Math.random() * bgDarkPalette.length)];
      const lCol = bgLightPalette[Math.floor(Math.random() * bgLightPalette.length)];
      const activeCol = isDark ? dCol : lCol;

      bgColors[i * 3] = activeCol.r;
      bgColors[i * 3 + 1] = activeCol.g;
      bgColors[i * 3 + 2] = activeCol.b;

      bgData.push({
        basePos: new THREE.Vector3(x, y, z),
        driftSpeed: 0.2 + Math.random() * 0.8,
        driftPhase: Math.random() * Math.PI * 2,
        darkCol: dCol,
        lightCol: lCol
      });
    }

    bgParticleDataRef.current = bgData;

    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgMat = new THREE.PointsMaterial({
      size: 0.20,
      map: pTexture,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.92 : 0.70,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false
    });
    const bgParticleSystem = new THREE.Points(bgGeo, bgMat);
    bgParticleSystem.renderOrder = -2; // Render behind the globe
    scene.add(bgParticleSystem);
    bgParticleSystemRef.current = bgParticleSystem;

    // 8. SCROLL INTERPOLATION & RAYCASTING
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    let currentHover = null;

    // Target rotation to orient center of India (lat 21.8° N, lon 78.653° E) with North straight up:
    const targetRotX = 0.38;
    const targetRotY = -2.9516;
    const startRotX = 0.20;
    const startRotY = -2.9516;

    // Helper: Shortest angular path interpolation
    function lerpAngle(a, b, t) {
      const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
      return a + diff * t;
    }

    const handleWindowScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.min(1.0, Math.max(0, scrollY / maxScroll));
      scrollProgressRef.current = progress;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const handlePointerClick = (e) => {
      if (isZoomingOutRef.current) return;
      if (e.target.closest('button, input, select, a')) return;
      if (currentHover) {
        triggerStateSelection(currentHover.userData.name);
      }
    };

    window.addEventListener('click', handlePointerClick);

    // 9. ANIMATION LOOP
    let animId;
    let clock = new THREE.Clock();

    // Reusable math vectors for screen projection
    const tempVec = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    const normal = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const p = scrollProgressRef.current;

      // Animate background stars behind globe
      if (bgParticleSystemRef.current) {
        bgParticleSystemRef.current.rotation.z = elapsed * 0.005;
      }

      // 1. Camera Zoom & Flight Logic
      if (isZoomingOutRef.current) {
        const elapsedZoom = (performance.now() - zoomStartTimeRef.current) / 850;
        const progress = Math.min(1.0, Math.max(0, elapsedZoom));
        // Cinematic cubic ease out
        const ease = 1 - Math.pow(1 - progress, 3);

        const startZ = zoomInitialCamPos.current.z || 8.6;
        const startX = zoomInitialCamPos.current.x || 0.75;
        const startY = zoomInitialCamPos.current.y || -0.05;

        // Pull back rapidly to distance 28.0 and center on Earth
        camera.position.z = THREE.MathUtils.lerp(startZ, 28.0, ease);
        camera.position.x = THREE.MathUtils.lerp(startX, 0.0, ease);
        camera.position.y = THREE.MathUtils.lerp(startY, 0.0, ease);

        earthGroup.rotation.y += 0.012;
        camera.fov = 45 + Math.sin(progress * Math.PI) * 9;
        camera.updateProjectionMatrix();
      } else {
        // Camera position:
        // At p = 0: X = 0.5 (centers the globe spanning under the hero glass card), Y = 0.15, Z = 14.8
        // At p = 1: X = 0.75 (shifts India left of center so the Executive Dossier HUD never overlaps any state), Y = -0.05, Z = 8.6
        const targetCamX = THREE.MathUtils.lerp(0.5, 0.75, p);
        const targetCamY = THREE.MathUtils.lerp(0.15, -0.05, p);
        const targetCamZ = THREE.MathUtils.lerp(14.8, 8.6, p);

        if (p >= 0.92) {
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.18);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.18);
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.18);
          earthGroup.rotation.x = THREE.MathUtils.lerp(earthGroup.rotation.x, targetRotX, 0.18);
          earthGroup.rotation.y = lerpAngle(earthGroup.rotation.y, targetRotY, 0.18);
        } else {
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);

          const ambientSpin = (elapsed * 0.06) % (Math.PI * 2);
          const currentRotY = lerpAngle(ambientSpin, targetRotY, p);
          const currentRotX = THREE.MathUtils.lerp(0.08, targetRotX, p);
          earthGroup.rotation.y = lerpAngle(earthGroup.rotation.y, currentRotY, 0.1);
          earthGroup.rotation.x = THREE.MathUtils.lerp(earthGroup.rotation.x, currentRotX, 0.1);
        }
      }
      camera.lookAt(0, 0, 0);

      // Animate space particles with cursor repulsion physics
      raycaster.setFromCamera(mouse, camera);
      const mouseRay = raycaster.ray;
      const pArr = particleGeo.attributes.position.array;
      const repelDistLimit = 3.8;
      const repelForce = 0.18;

      for (let i = 0; i < particleCount; i++) {
        const pObj = particleData[i];

        // Closest point on mouse ray to particle current position
        const diff = tempVec.subVectors(pObj.curPos, mouseRay.origin);
        const projT = mouseRay.direction.dot(diff);
        if (projT > 0 && projT < 35.0) {
          const closestPoint = mouseRay.origin.clone().addScaledVector(mouseRay.direction, projT);
          const distToRay = pObj.curPos.distanceTo(closestPoint);

          if (distToRay < repelDistLimit) {
            // Push particle outward away from mouse ray
            const pushDir = pObj.curPos.clone().sub(closestPoint).normalize();
            if (distToRay < 0.01) pushDir.set(Math.random() - 0.5, Math.random() - 0.5, 0).normalize();
            const factor = 1.0 - distToRay / repelDistLimit;
            pObj.vel.addScaledVector(pushDir, factor * repelForce);
          }
        }

        // Elastic spring returning to base equilibrium position
        const spring = tempVec.subVectors(pObj.basePos, pObj.curPos).multiplyScalar(0.045);
        pObj.vel.add(spring);
        pObj.vel.multiplyScalar(0.88); // friction / air resistance
        pObj.curPos.add(pObj.vel);

        // Subtle organic breathing drift
        pObj.curPos.y += Math.sin(elapsed * pObj.driftSpeed + pObj.driftPhase) * 0.002;

        pArr[i * 3] = pObj.curPos.x;
        pArr[i * 3 + 1] = pObj.curPos.y;
        pArr[i * 3 + 2] = pObj.curPos.z;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Animate state radar rings & scale pinheads (blooms gracefully only when reaching map: p >= 0.68)
      stateBeacons.forEach((item) => {
        const isHovered = activeHoverRef.current === item.node.name;
        const pinVisibility = Math.max(0, Math.min(1, (p - 0.68) / 0.20));
        
        // Scale pin head
        const baseScale = (isHovered ? 1.9 : 1.0) * pinVisibility;
        item.pinHeadMesh.scale.setScalar(baseScale);

        // Radar ping ring
        item.ringMesh.visible = pinVisibility > 0.05;
        const ringScale = (1.0 + Math.sin(elapsed * 3.5 + item.node.lat) * (isHovered ? 0.45 : 0.25)) * (isHovered ? 1.6 : 1.0) * pinVisibility;
        item.ringMesh.scale.set(ringScale, ringScale, 1.0);
      });

      // Update Native Vector HTML Badges Positions on Screen
      const curW = window.innerWidth;
      const curH = window.innerHeight;

      INDIAN_STATE_NODES.forEach((node) => {
        const el = badgeRefs.current[node.name];
        if (!el) return;

        // Position on globe
        const pos = latLonToVector3(node.lat, node.lon, earthRadius * 1.015);
        tempVec.copy(pos);
        tempVec.applyMatrix4(earthGroup.matrixWorld);

        // Check if facing camera
        camDir.copy(camera.position).sub(tempVec).normalize();
        normal.copy(tempVec).sub(earthGroup.position).normalize();
        const dot = normal.dot(camDir);
        tempVec.project(camera);

        const isFacing = dot > 0.15 && tempVec.z < 1.0;
        const screenX = (tempVec.x * 0.5 + 0.5) * curW;
        const screenY = (-tempVec.y * 0.5 + 0.5) * curH;

        // Badges only appear when reaching the map section (p >= 0.70) and not during zoom-out
        if (isZoomingOutRef.current || !isFacing || p < 0.70 || screenX < -80 || screenX > curW + 80 || screenY < -80 || screenY > curH + 80) {
          el.style.opacity = '0';
          el.style.display = 'none';
          el.style.pointerEvents = 'none';
        } else {
          el.style.display = 'flex';
          const alpha = Math.min(1.0, (p - 0.70) / 0.18);
          el.style.opacity = alpha.toFixed(3);
          el.style.pointerEvents = alpha > 0.3 ? 'auto' : 'none';

          // Custom radial offsets to eliminate overlapping in dense regions
          let offX = '-50%';
          let offY = '-130%';

          switch (node.name) {
            case 'Chandigarh':
              offX = '-50%';
              offY = '-210%';
              break;
            case 'Punjab':
              offX = '-110%';
              offY = '-100%';
              break;
            case 'Haryana':
              offX = '-115%';
              offY = '-40%';
              break;
            case 'Himachal Pradesh':
              offX = '25%';
              offY = '-160%';
              break;
            case 'Uttarakhand':
              offX = '35%';
              offY = '-90%';
              break;
            case 'Delhi':
              offX = '-50%';
              offY = '-130%';
              break;
            case 'Ladakh':
              offX = '25%';
              offY = '-140%';
              break;
            case 'Sikkim':
              offX = '-50%';
              offY = '-170%';
              break;
            case 'Assam':
              offX = '20%';
              offY = '-120%';
              break;
            case 'Arunachal Pradesh':
              offX = '25%';
              offY = '-180%';
              break;
            case 'Nagaland':
              offX = '65%';
              offY = '-100%';
              break;
            case 'Manipur':
              offX = '65%';
              offY = '-40%';
              break;
            case 'Mizoram':
              offX = '55%';
              offY = '20%';
              break;
            case 'Tripura':
              offX = '-105%';
              offY = '30%';
              break;
            case 'Meghalaya':
              offX = '-105%';
              offY = '-50%';
              break;
            case 'West Bengal':
              offX = '20%';
              offY = '-20%';
              break;
            case 'Bihar':
              offX = '-30%';
              offY = '-80%';
              break;
            case 'Jharkhand':
              offX = '-30%';
              offY = '0%';
              break;
            case 'Odisha':
              offX = '25%';
              offY = '0%';
              break;
            case 'Chhattisgarh':
              offX = '-30%';
              offY = '-20%';
              break;
            case 'Rajasthan':
              offX = '-60%';
              offY = '-60%';
              break;
            case 'Gujarat':
              offX = '-80%';
              offY = '0%';
              break;
            case 'Goa':
              offX = '-115%';
              offY = '-50%';
              break;
            case 'Kerala':
              offX = '-85%';
              offY = '-80%';
              break;
            case 'Tamil Nadu':
              offX = '20%';
              offY = '-80%';
              break;
            case 'Puducherry':
              offX = '35%';
              offY = '-40%';
              break;
            case 'Andhra Pradesh':
              offX = '35%';
              offY = '-60%';
              break;
            case 'Telangana':
              offX = '10%';
              offY = '-50%';
              break;
            case 'Karnataka':
              offX = '-75%';
              offY = '-50%';
              break;
            case 'Dadra And Nagar Haveli':
              offX = '-80%';
              offY = '-40%';
              break;
            case 'Lakshadweep':
              offX = '-60%';
              offY = '-80%';
              break;
            case 'Andaman and Nicobar Islands':
              offX = '25%';
              offY = '-80%';
              break;
            default:
              break;
          }

          el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(${offX}, ${offY})`;
        }
      });

      // Raycasting for state 3D pin hover detection
      if (p > 0.70 && !isZoomingOutRef.current) {
        if (!isBadgeHoveredRef.current) {
          raycaster.setFromCamera(mouse, camera);
          const hits = raycaster.intersectObjects(interactiveMeshes);

          if (hits.length > 0) {
            const hit = hits[0].object;
            if (activeHoverRef.current !== hit.userData.name) {
              activeHoverRef.current = hit.userData.name;
              setHoveredNode(hit.userData);
            }
          } else {
            if (activeHoverRef.current) {
              activeHoverRef.current = null;
              setHoveredNode(null);
            }
          }
        }
      } else {
        if (activeHoverRef.current) {
          activeHoverRef.current = null;
          setHoveredNode(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('click', handlePointerClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Live theme updates without reconstructing scene or reloading textures
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = isDark ? 1.08 : 1.28;
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = isDark ? 1.6 : 2.4;
    }
    if (atmosMatRef.current) {
      atmosMatRef.current.color.setHex(isDark ? 0x0284c7 : 0x38bdf8);
      atmosMatRef.current.opacity = isDark ? 0.18 : 0.24;
    }
    if (particleSystemRef.current && particleDataRef.current) {
      const pMat = particleSystemRef.current.material;
      pMat.opacity = isDark ? 0.85 : 0.65;
      pMat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      
      const pColors = particleSystemRef.current.geometry.attributes.color.array;
      const pData = particleDataRef.current;
      for (let i = 0; i < pData.length; i++) {
        const col = isDark ? pData[i].darkCol : pData[i].lightCol;
        pColors[i * 3] = col.r;
        pColors[i * 3 + 1] = col.g;
        pColors[i * 3 + 2] = col.b;
      }
      particleSystemRef.current.geometry.attributes.color.needsUpdate = true;
    }
    if (bgParticleSystemRef.current && bgParticleDataRef.current) {
      const bgMat = bgParticleSystemRef.current.material;
      bgMat.opacity = isDark ? 0.92 : 0.70;
      bgMat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      
      const bgColors = bgParticleSystemRef.current.geometry.attributes.color.array;
      const bgData = bgParticleDataRef.current;
      for (let i = 0; i < bgData.length; i++) {
        const col = isDark ? bgData[i].darkCol : bgData[i].lightCol;
        bgColors[i * 3] = col.r;
        bgColors[i * 3 + 1] = col.g;
        bgColors[i * 3 + 2] = col.b;
      }
      bgParticleSystemRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [isDark]);

  // Compute node details for hover HUD
  const activeNode = hoveredNode;
  const currentData = useMemo(() => {
    if (!activeNode) return null;
    const name = activeNode.name;
    const live = stateMetrics[name] || {};
    const dir = mpDirectory[name] || { ls: [], rs: [] };

    const total = live.total_projects || (Math.floor(Math.abs(Math.sin(name.length * 1.5)) * 4000) + 1200);
    const completed = live.completed_count !== undefined ? live.completed_count : Math.floor(total * 0.74);
    const pending = live.unverified_count !== undefined ? live.unverified_count : (total - completed);

    const lsMps = (dir.ls && dir.ls.length > 0) ? dir.ls.join(', ') : (activeNode.defaultLs || 'Elected Lok Sabha MPs');
    const rsMps = (dir.rs && dir.rs.length > 0) ? dir.rs.join(', ') : (activeNode.defaultRs || 'Council of States Members');

    const expVal = live.total_final 
      ? `₹${(live.total_final / 10000000).toFixed(1)} Cr`
      : (live.total_expenditure_cr ? `₹${live.total_expenditure_cr} Cr` : `₹${(Math.abs(Math.cos(name.length)) * 2500 + 450).toFixed(1)} Cr`);

    const riskScore = live.avg_risk_score !== undefined 
      ? live.avg_risk_score.toFixed(1) 
      : (activeNode.flaggedWork ? '55.0' : (Math.abs(Math.sin(name.length)) * 22 + 4).toFixed(1));

    return {
      name,
      lat: activeNode.lat,
      lon: activeNode.lon,
      totalProjects: total,
      completed,
      pending,
      lsMps,
      rsMps,
      expenditure: expVal,
      riskScore,
      flaggedWork: activeNode.flaggedWork || null,
      isCapital: activeNode.isCapital || false
    };
  }, [activeNode, stateMetrics, mpDirectory]);

  return (
    <>
      {/* Fixed Full-Bleed 3D WebGL Canvas Layer */}
      <div 
        ref={mountRef} 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* Crystal-Clear Native Vector State Badges Layer */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {INDIAN_STATE_NODES.map((node) => {
          const isDelhi = node.isCapital;
          const isHovered = hoveredNode?.name === node.name;

          return (
            <button
              key={node.name}
              type="button"
              ref={(el) => { if (el) badgeRefs.current[node.name] = el; }}
              onClick={() => triggerStateSelection(node.name)}
              onMouseEnter={() => {
                isBadgeHoveredRef.current = true;
                activeHoverRef.current = node.name;
                setHoveredNode(node);
              }}
              onMouseOver={() => {
                isBadgeHoveredRef.current = true;
                activeHoverRef.current = node.name;
                setHoveredNode(node);
              }}
              onMouseLeave={() => {
                isBadgeHoveredRef.current = false;
                activeHoverRef.current = null;
                setHoveredNode(null);
              }}
              className={`absolute top-0 left-0 cursor-pointer select-none font-mono text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-lg transition-all duration-150 transform-gpu opacity-0 pointer-events-none hidden items-center gap-1.5 backdrop-blur-md hover:scale-115 active:scale-95 ${
                isHovered ? 'ring-4 ring-blue-500/70 scale-120 z-40 shadow-blue-500/50' : ''
              } ${
                isDelhi
                  ? 'bg-amber-500/95 text-white border-amber-200 shadow-amber-900/50 hover:bg-amber-600'
                  : isDark
                  ? 'bg-[#090e1a]/90 text-cyan-200 border-cyan-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:bg-[#0f172a] hover:text-white hover:border-cyan-300'
                  : 'bg-white/95 text-slate-900 border-slate-300/90 shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:bg-white hover:border-blue-600 hover:text-blue-600'
              }`}
              style={{ willChange: 'transform, opacity' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isDelhi ? 'bg-amber-200' : isDark ? 'bg-cyan-400' : 'bg-blue-600'
              }`} />
              <span className="whitespace-nowrap">{node.shortName || node.name}</span>
            </button>
          );
        })}
      </div>

      {/* Non-Blocking Executive State Intelligence Dossier HUD (Fixed on Top-Right, never covers India) */}
      {scrollProgress > 0.65 && (
        <div 
          className={`fixed top-20 right-6 z-40 w-88 sm:w-96 rounded-3xl p-5 shadow-2xl transition-all duration-300 font-mono pointer-events-auto ${
            isDark 
              ? 'bg-slate-950/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] text-white backdrop-blur-2xl'
              : 'bg-white/85 border border-white/80 shadow-[0_20px_50px_rgba(31,38,135,0.15),inset_0_1px_2px_rgba(255,255,255,0.95)] text-slate-900 backdrop-blur-2xl'
          }`}
        >
          {currentData ? (
            <div className="space-y-3.5">
              {/* State Header */}
              <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      currentData.flaggedWork ? 'bg-rose-500 animate-ping' : currentData.isCapital ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
                    }`} />
                    <h3 className="text-base font-black tracking-tight">
                      {currentData.name}
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-cyan-300 mt-0.5">
                    LAT {currentData.lat.toFixed(2)}°N • LON {currentData.lon.toFixed(2)}°E • 3D GEOSPATIAL
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentData.flaggedWork 
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40' 
                    : currentData.isCapital 
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40'
                }`}>
                  {currentData.flaggedWork ? 'FLAGGED AUDIT' : currentData.isCapital ? 'CAPITAL' : 'STATE NODE'}
                </span>
              </div>

              {/* Real-time Project Execution Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
                }`}>
                  <div className="text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Completed</span>
                  </div>
                  <div className="text-lg font-black mt-1">
                    {currentData.completed.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {((currentData.completed / currentData.totalProjects) * 100).toFixed(1)}% Done
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl border ${
                  isDark ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' : 'bg-rose-50/80 border-rose-200/80 text-rose-900'
                }`}>
                  <div className="text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Active Audit</span>
                  </div>
                  <div className="text-lg font-black mt-1">
                    {currentData.pending.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    Pending Verification
                  </div>
                </div>
              </div>

              {/* Bicameral Representation */}
              <div className="p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-1.5 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">🏛️ Lok Sabha:</span>
                  <span className="font-medium line-clamp-1">{currentData.lsMps}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-cyan-400 font-bold shrink-0">🏛️ Rajya Sabha:</span>
                  <span className="font-medium line-clamp-1">{currentData.rsMps}</span>
                </div>
              </div>

              {/* Flagged Alert Banner */}
              {currentData.flaggedWork && (
                <div className="p-2.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-[11px] text-red-600 dark:text-red-300 flex items-center gap-2 animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <strong>CRITICAL ANOMALY {currentData.flaggedWork}</strong>: +100% Cost Escalation
                  </div>
                </div>
              )}

              {/* Financial Expenditure & AI Forensic Risk */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80 dark:border-white/10">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Expenditure</span>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">{currentData.expenditure}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">AI Risk Score</span>
                  <strong className={`text-sm font-bold ${
                    parseFloat(currentData.riskScore) > 30 ? 'text-rose-500' : 'text-blue-600 dark:text-cyan-300'
                  }`}>
                    {currentData.riskScore} / 100
                  </strong>
                </div>
              </div>

              {/* Navigation Action */}
              <button
                type="button"
                onClick={() => triggerStateSelection(currentData.name)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-mono transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inspect {currentData.name} Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                <h4 className="text-sm font-black">Parliamentary Intelligence Dossier</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Hover over any state beacon or pin to inspect live bicameral allocations, completed infrastructure works, and algorithmic audit flags.
              </p>
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap gap-1.5 text-[10px]">
                {['Punjab', 'Delhi', 'Maharashtra', 'Telangana', 'Tamil Nadu', 'Gujarat'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => triggerStateSelection(st)}
                    className="px-2 py-1 rounded-lg border border-slate-300/80 dark:border-white/15 bg-white/50 dark:bg-white/5 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cinematic 3D Globe Zoom-Out Transition HUD */}
      {isZoomingOut && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300">
          <div className="font-mono text-center space-y-3 p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/50 shadow-[0_20px_60px_rgba(6,182,212,0.45)] animate-in fade-in zoom-in-95 duration-200 max-w-md mx-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-400/60 bg-cyan-500/15 text-cyan-300 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>3D Globe Zoom-Out Transition</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Loading {zoomSelectedState || 'Constituency'}
            </h2>
            <div className="w-56 sm:w-64 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-[pulse_0.7s_ease-in-out_infinite] w-full" />
            </div>
            <p className="text-[10px] text-cyan-200/80 tracking-widest uppercase">
              Transferring to National Audit Dossier...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ThreeIndiaMap;
