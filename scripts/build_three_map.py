import sys

content = """import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  Compass, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Landmark, 
  Layers, 
  IndianRupee, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  X, 
  Activity,
  Maximize2
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
  [26.5, 70.0], [28.5, 70.5], [30.0, 71.5], [32.0, 74.5], [33.5, 74.5]
];

function isPointInIndia(lat, lon) {
  let inside = false;
  let j = INDIA_POLYGON.length - 1;
  for (let i = 0; i < INDIA_POLYGON.length; i++) {
    if ((INDIA_POLYGON[i][1] > lon) !== (INDIA_POLYGON[j][1] > lon) &&
        (lat < (INDIA_POLYGON[j][0] - INDIA_POLYGON[i][0]) * (lon - INDIA_POLYGON[i][1]) / 
         (INDIA_POLYGON[j][1] - INDIA_POLYGON[i][1]) + INDIA_POLYGON[i][0])) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
}

// 36 Indian State Centroids and Representative Data
const INDIAN_STATE_NODES = [
  { name: 'Jammu And Kashmir', lat: 33.7782, lon: 76.5762, defaultLs: 'Dr. Farooq Abdullah / Jugal Kishore', defaultRs: 'Ghulam Ali Khatana' },
  { name: 'Ladakh', lat: 34.1526, lon: 77.5771, defaultLs: 'Mohmad Haneefa', defaultRs: 'Parliament Nominee' },
  { name: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, defaultLs: 'Kangana Ranaut / Anurag Thakur', defaultRs: 'Harsh Mahajan' },
  { name: 'Punjab', lat: 31.1471, lon: 75.3412, defaultLs: 'Gurjeet Singh Aujla (Amritsar)', defaultRs: 'Raghav Chadha', flaggedWork: '#80673' },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, defaultLs: 'Manish Tewari', defaultRs: 'Union Territory Seat' },
  { name: 'Uttarakhand', lat: 30.0668, lon: 79.0193, defaultLs: 'Anil Baluni / Ajay Tamta', defaultRs: 'Mahendra Bhatt' },
  { name: 'Haryana', lat: 29.0588, lon: 76.0856, defaultLs: 'Deepender Singh Hooda', defaultRs: 'Subhash Barala' },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, isCapital: true, defaultLs: 'Bansuri Swaraj / Manoj Tiwari', defaultRs: 'Sanjay Singh' },
  { name: 'Rajasthan', lat: 27.0238, lon: 74.2179, defaultLs: 'Om Birla (Kota) / Gajendra Singh', defaultRs: 'Sonia Gandhi / Madan Rathore' },
  { name: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, defaultLs: 'Rajnath Singh (Lucknow)', defaultRs: 'Sudhanshu Trivedi' },
  { name: 'Bihar', lat: 25.0961, lon: 85.3131, defaultLs: 'Chirag Paswan / Ravi Shankar Prasad', defaultRs: 'Sanjay Kumar Jha' },
  { name: 'Sikkim', lat: 27.5330, lon: 88.5122, defaultLs: 'Indra Hang Subba', defaultRs: 'Dorjee Tshering Lepcha' },
  { name: 'Arunachal Pradesh', lat: 28.2180, lon: 94.7278, defaultLs: 'Kiren Rijiju / Tapir Gao', defaultRs: 'Nabam Rebia' },
  { name: 'Nagaland', lat: 26.1584, lon: 94.5624, defaultLs: 'S. Supongmeren Jamir', defaultRs: 'S. Phangnon Konyak' },
  { name: 'Manipur', lat: 24.6637, lon: 93.9063, defaultLs: 'Angomcha Bimol Akoijam', defaultRs: 'Leishemba Sanajaoba' },
  { name: 'Mizoram', lat: 23.1645, lon: 92.9376, defaultLs: 'Richard Vanlalhmangaiha', defaultRs: 'K. Vanlalvena' },
  { name: 'Tripura', lat: 23.9408, lon: 91.9882, defaultLs: 'Biplab Kumar Deb', defaultRs: 'Rajib Bhattacharjee' },
  { name: 'Meghalaya', lat: 25.4670, lon: 91.3662, defaultLs: 'Ricky Andrew Syngkon', defaultRs: 'Wanweiroy Kharlukhi' },
  { name: 'Assam', lat: 26.2006, lon: 92.9376, defaultLs: 'Sarbananda Sonowal / Gaurav Gogoi', defaultRs: 'Mission Ranjan Das' },
  { name: 'West Bengal', lat: 22.9868, lon: 87.8550, defaultLs: 'Abhishek Banerjee / Sudip Bandyopadhyay', defaultRs: "Derek O'Brien" },
  { name: 'Jharkhand', lat: 23.6102, lon: 85.2799, defaultLs: 'Nishikant Dubey / Bidyut Baran', defaultRs: 'Deepak Prakash' },
  { name: 'Odisha', lat: 20.9517, lon: 85.0985, defaultLs: 'Dharmendra Pradhan / Sambit Patra', defaultRs: 'Sasmit Patra' },
  { name: 'Chhattisgarh', lat: 21.2787, lon: 81.8661, defaultLs: 'Brijmohan Agrawal / Santosh Pandey', defaultRs: 'Devendra Pratap Singh' },
  { name: 'Madhya Pradesh', lat: 22.9734, lon: 78.6569, defaultLs: 'Shivraj Singh Chouhan / Jyotiraditya Scindia', defaultRs: 'L. Murugan' },
  { name: 'Gujarat', lat: 22.2587, lon: 71.1924, defaultLs: 'Amit Shah (Gandhinagar) / C.R. Patil', defaultRs: 'J.P. Nadda' },
  { name: 'Maharashtra', lat: 19.7515, lon: 75.7139, defaultLs: 'Nitin Gadkari (Nagpur) / Supriya Sule', defaultRs: 'Milind Deora / Praful Patel' },
  { name: 'Andhra Pradesh', lat: 15.9129, lon: 79.7400, defaultLs: 'Kinjarapu Ram Mohan Naidu', defaultRs: 'Y.V. Subba Reddy' },
  { name: 'Telangana', lat: 18.1124, lon: 79.0193, defaultLs: 'G. Kishan Reddy / Asaduddin Owaisi', defaultRs: 'K. R. Suresh Reddy' },
  { name: 'Karnataka', lat: 15.3173, lon: 75.7139, defaultLs: 'H.D. Kumaraswamy / Tejasvi Surya', defaultRs: 'Nirmala Sitharaman' },
  { name: 'Goa', lat: 15.2993, lon: 74.1240, defaultLs: 'Shripad Yesso Naik / Viriato Fernandes', defaultRs: 'Sadanand Tanavade' },
  { name: 'Kerala', lat: 10.8505, lon: 76.2711, defaultLs: 'Shashi Tharoor (Thiruvananthapuram)', defaultRs: 'John Brittas' },
  { name: 'Tamil Nadu', lat: 11.1271, lon: 78.6569, defaultLs: 'Kanimozhi Karunanidhi / Dayanidhi Maran', defaultRs: 'Tiruchi Siva' },
  { name: 'Puducherry', lat: 11.9416, lon: 79.8083, defaultLs: 'V. Vaithilingam', defaultRs: 'S. Selvaganabathy' },
  { name: 'Dadra And Nagar Haveli', lat: 20.1809, lon: 73.0169, defaultLs: 'Kalaben Delkar', defaultRs: 'Nominated' },
  { name: 'Lakshadweep', lat: 10.5667, lon: 72.6417, defaultLs: 'Muhammed Hamdullah Sayeed', defaultRs: 'Union Island' },
  { name: 'Andaman And Nicobar Islands', lat: 11.7401, lon: 92.6586, defaultLs: 'Bishnu Pada Ray', defaultRs: 'Island Seat' }
];

export const ThreeIndiaMap = ({ onSelectState }) => {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  const [houseFilter, setHouseFilter] = useState('ALL'); // 'ALL' | 'LOK_SABHA' | 'RAJYA_SABHA'
  const houseFilterRef = useRef('ALL');
  useEffect(() => {
    houseFilterRef.current = houseFilter;
  }, [houseFilter]);

  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null); // Clicked node for Zoom-on-Click
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [stateMetrics, setStateMetrics] = useState({});
  const [mpDirectory, setMpDirectory] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  // References for GSAP camera animations
  const cameraRef = useRef(null);
  const initialCamPos = useRef({ x: 0, y: 15, z: 19 });

  // Fetch live state and MP metrics
  useEffect(() => {
    let mounted = true;
    api.getStateAnalytics()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const lookup = {};
        data.forEach((st) => { lookup[st.state] = st; });
        setStateMetrics(lookup);
      })
      .catch((e) => console.warn('State analytics error in 3D Map:', e));

    const fetchMps = api.getMps || api.getMPs;
    if (typeof fetchMps === 'function') {
      fetchMps('', 300)
        .then((mps) => {
          if (!mounted || !Array.isArray(mps)) return;
          const mpMap = {};
          mps.forEach((mp) => {
            if (!mpMap[mp.state]) mpMap[mp.state] = { ls: [], rs: [] };
            if (mp.house === 'Lok Sabha' && mpMap[mp.state].ls.length < 3) {
              mpMap[mp.state].ls.push(mp.mp_name);
            } else if (mp.house === 'Rajya Sabha' && mpMap[mp.state].rs.length < 3) {
              mpMap[mp.state].rs.push(mp.mp_name);
            }
          });
          setMpDirectory(mpMap);
        })
        .catch((e) => console.warn('MP fetch error in 3D Map:', e));
    }

    return () => { mounted = false; };
  }, []);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x070b14 : 0xe2e8f0, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(initialCamPos.current.x, initialCamPos.current.y, initialCamPos.current.z);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // Coordinate projection helpers
    const centerLat = 22.5;
    const centerLon = 80.0;
    const to3D = (lat, lon) => ({
      x: (lon - centerLon) * 0.68,
      z: -(lat - centerLat) * 0.76
    });

    // 1. LIGHTING
    const ambientLight = new THREE.AmbientLight(isDark ? 0xffffff : 0xf8fafc, isDark ? 0.8 : 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isDark ? 0x00f0ff : 0x3b82f6, isDark ? 2.5 : 2.0);
    dirLight.position.set(12, 22, 12);
    scene.add(dirLight);

    const crimsonLight = new THREE.PointLight(0xf43f5e, isDark ? 4.5 : 1.5, 30);
    crimsonLight.position.set(-4, 9, -2);
    scene.add(crimsonLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3.0, 25);
    goldLight.position.set(5, 9, 3);
    scene.add(goldLight);

    // 2. DARK MODE: QUANTUM NANO DOT MATRIX (Matching Uploaded Image)
    //    LIGHT MODE: SATELLITE TOPOGRAPHIC VIEW
    const interactiveMeshes = [];
    const dotObjects = [];
    const statePillars = [];

    if (isDark) {
      // Grid dimensions matching uploaded image
      const latMin = 8.0, latMax = 36.0, latStep = 1.0;
      const lonMin = 68.0, lonMax = 97.0, lonStep = 1.0;

      // Base matrix plate
      const gridHelper = new THREE.GridHelper(26, 26, 0x1e293b, 0x0c1322);
      gridHelper.position.y = -0.05;
      mapGroup.add(gridHelper);

      // Dots Geometry
      const dotGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
      
      for (let lat = latMin; lat <= latMax; lat += latStep) {
        for (let lon = lonMin; lon <= lonMax; lon += lonStep) {
          const inIndia = isPointInIndia(lat, lon);
          const pos = to3D(lat, lon);
          const dist = Math.hypot(pos.x, pos.z);

          // Vibrant Crimson/Rose/Cyan for India, dark slate for background
          const dotColor = inIndia ? 0xf43f5e : 0x1e293b;
          const emissiveColor = inIndia ? 0xe11d48 : 0x0f172a;
          const emissiveIntensity = inIndia ? 1.2 : 0.2;

          const dotMat = new THREE.MeshStandardMaterial({
            color: dotColor,
            emissive: emissiveColor,
            emissiveIntensity: emissiveIntensity,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: inIndia ? 0.95 : 0.28
          });

          const dotMesh = new THREE.Mesh(dotGeo, dotMat);
          dotMesh.position.set(pos.x, inIndia ? 0.15 : 0.0, pos.z);
          mapGroup.add(dotMesh);

          dotObjects.push({
            mesh: dotMesh,
            inIndia,
            dist,
            baseY: inIndia ? 0.15 : 0.0,
            initialScale: inIndia ? 1.0 : 0.75
          });
        }
      }

      // Crosshair lines matching uploaded reference image
      const crossMat = new THREE.LineBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.35
      });

      const hLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, 0.08, 0),
        new THREE.Vector3(10, 0.08, 0)
      ]);
      mapGroup.add(new THREE.Line(hLineGeo, crossMat));

      const vLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.08, -10),
        new THREE.Vector3(0, 0.08, 10)
      ]);
      mapGroup.add(new THREE.Line(vLineGeo, crossMat));

    } else {
      // LIGHT MODE: SATELLITE TOPOGRAPHIC VIEW
      const satGeo = new THREE.CylinderGeometry(11, 11.5, 0.4, 64);
      const satMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.7,
        metalness: 0.2
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.y = -0.2;
      mapGroup.add(satMesh);

      const oceanGeo = new THREE.RingGeometry(11.2, 13.5, 64);
      const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7
      });
      const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
      oceanMesh.rotation.x = -Math.PI / 2;
      oceanMesh.position.y = -0.18;
      mapGroup.add(oceanMesh);
    }

    // 3. STATE NODES, PARLIAMENT SPIRES & DUAL BEACONS
    const delhiCoord = to3D(28.7041, 77.1025);

    const spireGeo = new THREE.CylinderGeometry(0.1, 0.35, 3.4, 20);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.1
    });
    const spireMesh = new THREE.Mesh(spireGeo, spireMat);
    spireMesh.position.set(delhiCoord.x, 1.7, delhiCoord.z);
    mapGroup.add(spireMesh);

    const orbGeo = new THREE.SphereGeometry(0.4, 24, 24);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.0,
      roughness: 0.1
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbMesh.position.set(delhiCoord.x, 3.4, delhiCoord.z);
    mapGroup.add(orbMesh);

    // State Structural Nodes
    INDIAN_STATE_NODES.forEach((st) => {
      const pos = to3D(st.lat, st.lon);
      const isCap = st.isCapital;

      const pillarH = isCap ? 2.0 : 0.9 + (Math.abs(Math.sin(st.lat * 0.5)) * 0.9);
      const pillarGeo = new THREE.CylinderGeometry(0.35, 0.45, pillarH, 16);

      const pillarMat = new THREE.MeshStandardMaterial({
        color: isCap ? 0x00f0ff : (isDark ? 0xf43f5e : 0x0284c7),
        emissive: isCap ? 0x00f0ff : (isDark ? 0xbe123c : 0x0369a1),
        emissiveIntensity: isCap ? 1.4 : 0.8,
        roughness: 0.25,
        metalness: 0.85
      });

      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(pos.x, pillarH / 2, pos.z);
      pillar.castShadow = true;

      pillar.userData = {
        stateName: st.name,
        isCapital: isCap,
        initialY: pillarH / 2,
        pillarH,
        pos,
        defaultLs: st.defaultLs,
        defaultRs: st.defaultRs,
        lat: st.lat,
        lon: st.lon,
        flaggedWork: st.flaggedWork || null
      };

      mapGroup.add(pillar);
      interactiveMeshes.push(pillar);

      // Lok Sabha Beacon
      const lsGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const lsMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.2,
        roughness: 0.2,
        transparent: true,
        opacity: 1.0
      });
      const lsBeacon = new THREE.Mesh(lsGeo, lsMat);
      lsBeacon.position.set(pos.x - 0.2, pillarH + 0.25, pos.z);
      lsBeacon.userData = { type: 'LS', stateName: st.name };
      mapGroup.add(lsBeacon);

      // Rajya Sabha Beacon
      const rsGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const rsMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
        roughness: 0.2,
        transparent: true,
        opacity: 1.0
      });
      const rsBeacon = new THREE.Mesh(rsGeo, rsMat);
      rsBeacon.position.set(pos.x + 0.2, pillarH + 0.23, pos.z);
      rsBeacon.userData = { type: 'RS', stateName: st.name };
      mapGroup.add(rsBeacon);

      // Connecting Arcs to Parliament
      if (!isCap) {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(pos.x, pillarH, pos.z),
          new THREE.Vector3((pos.x + delhiCoord.x) / 2, Math.max(pillarH, 2.2) + 1.2, (pos.z + delhiCoord.z) / 2),
          new THREE.Vector3(delhiCoord.x, 3.4, delhiCoord.z)
        );
        const pts = curve.getPoints(20);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const arcMat = new THREE.LineBasicMaterial({
          color: isDark ? 0xf43f5e : 0x0ea5e9,
          transparent: true,
          opacity: 0.25
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        mapGroup.add(arcLine);
      }

      statePillars.push({
        pillar,
        lsBeacon,
        rsBeacon,
        pos,
        dist: Math.hypot(pos.x, pos.z)
      });
    });

    // 4. RAYCASTING: HOVER & ZOOM-ON-CLICK HANDLERS
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let currentHover = null;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handlePointerLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
      if (currentHover) {
        currentHover.scale.set(1, 1, 1);
        currentHover = null;
      }
      setHoveredNode(null);
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes);

      if (hits.length > 0) {
        const targetMesh = hits[0].object;
        const data = targetMesh.userData;
        setSelectedNode(data);
        setIsZoomed(true);

        const targetPos = data.pos;
        gsap.to(camera.position, {
          x: targetPos.x,
          y: Math.max(3.5, data.pillarH + 2.5),
          z: targetPos.z + 4.8,
          duration: 1.4,
          ease: 'power3.inOut',
          onUpdate: () => {
            camera.lookAt(targetPos.x, data.pillarH * 0.5, targetPos.z);
          }
        });
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('click', handleClick);

    // 5. ANIMATION & NANO PARTICLE WAVE LOOP
    let startTime = performance.now();
    let scrollYTarget = 0;
    let currentScroll = 0;

    const handleWindowScroll = () => {
      scrollYTarget = window.scrollY || document.documentElement.scrollTop || 0;
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    let animId;
    const animate = (now) => {
      animId = requestAnimationFrame(animate);

      const elapsed = (now - startTime) * 0.001;
      const waveSpeed = 3.6;
      const waveFreq = 0.5;

      // NANO PARTICLE WAVE EFFECT
      dotObjects.forEach(({ mesh, dist, inIndia, baseY, initialScale }) => {
        const wave = Math.sin(dist * waveFreq - elapsed * waveSpeed);
        mesh.position.y = baseY + wave * (inIndia ? 0.28 : 0.08);
        const scaleVal = initialScale + wave * (inIndia ? 0.2 : 0.05);
        mesh.scale.set(scaleVal, scaleVal, scaleVal);
        if (inIndia && mesh.material) {
          mesh.material.emissiveIntensity = 1.0 + wave * 0.6;
        }
      });

      const hf = houseFilterRef.current;
      statePillars.forEach(({ pillar, lsBeacon, rsBeacon, dist }) => {
        const nodeWave = Math.sin(dist * waveFreq - elapsed * waveSpeed) * 0.12;
        pillar.position.y = pillar.userData.initialY + nodeWave;
        lsBeacon.position.y = pillar.userData.pillarH + nodeWave + 0.25;
        rsBeacon.position.y = pillar.userData.pillarH + nodeWave + 0.23;

        if (hf === 'LOK_SABHA') {
          lsBeacon.material.opacity = 1.0;
          lsBeacon.scale.set(1.25, 1.25, 1.25);
          rsBeacon.material.opacity = 0.15;
          rsBeacon.scale.set(0.6, 0.6, 0.6);
        } else if (hf === 'RAJYA_SABHA') {
          rsBeacon.material.opacity = 1.0;
          rsBeacon.scale.set(1.25, 1.25, 1.25);
          lsBeacon.material.opacity = 0.15;
          lsBeacon.scale.set(0.6, 0.6, 0.6);
        } else {
          lsBeacon.material.opacity = 1.0;
          lsBeacon.scale.set(1.0, 1.0, 1.0);
          rsBeacon.material.opacity = 1.0;
          rsBeacon.scale.set(1.0, 1.0, 1.0);
        }
      });

      if (!isZoomed) {
        currentScroll = THREE.MathUtils.lerp(currentScroll, scrollYTarget, 0.08);
        const progress = Math.min(1.0, currentScroll / 1200);

        const targetCamY = initialCamPos.current.y - Math.sin(progress * Math.PI) * 4.0;
        const targetCamZ = initialCamPos.current.z - Math.sin(progress * Math.PI * 0.8) * 5.0 + progress * 4.0;
        const targetScale = 1.0 - Math.sin(progress * Math.PI) * 0.18;

        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.06);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.06);
        camera.lookAt(0, 0.5, 0);

        mapGroup.scale.set(targetScale, targetScale, targetScale);
        mapGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.05 + progress * 0.35;
      }

      orbMesh.material.emissiveIntensity = 1.4 + Math.sin(elapsed * 4.5) * 0.6;
      orbMesh.position.y = 3.4 + Math.sin(elapsed * 2.0) * 0.08;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes);

      if (hits.length > 0) {
        const hit = hits[0].object;
        if (currentHover !== hit) {
          if (currentHover) currentHover.scale.set(1, 1, 1);
          currentHover = hit;
          currentHover.scale.set(1.3, 1.1, 1.3);
          setHoveredNode(hit.userData);
        }
      } else {
        if (currentHover) {
          currentHover.scale.set(1, 1, 1);
          currentHover = null;
          setHoveredNode(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate(performance.now());

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('click', handleClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark, isZoomed]);

  const handleResetView = () => {
    if (!cameraRef.current) return;
    setIsZoomed(false);
    setSelectedNode(null);

    gsap.to(cameraRef.current.position, {
      x: initialCamPos.current.x,
      y: initialCamPos.current.y,
      z: initialCamPos.current.z,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        cameraRef.current.lookAt(0, 0, 0);
      }
    });
  };

  const activeNode = selectedNode || hoveredNode;
  const getNodeDetails = () => {
    if (!activeNode) return null;
    const stName = activeNode.stateName;
    const metrics = stateMetrics[stName] || {};
    const totalProjects = metrics.total_projects || (activeNode.isCapital ? 4520 : 3620);
    const completed = metrics.completed_count || Math.round(totalProjects * 0.42);
    const pending = totalProjects - completed;
    const mps = mpDirectory[stName] || {};
    const lsMps = (mps.ls && mps.ls.length > 0) ? mps.ls.join(', ') : activeNode.defaultLs;
    const rsMps = (mps.rs && mps.rs.length > 0) ? mps.rs.join(', ') : activeNode.defaultRs;

    return {
      name: stName,
      isCapital: activeNode.isCapital,
      totalProjects,
      completed,
      pending,
      lsMps,
      rsMps,
      lat: activeNode.lat,
      lon: activeNode.lon,
      flaggedWork: activeNode.flaggedWork,
      riskScore: metrics.avg_risk_score || 17.2,
      expenditure: metrics.total_final ? `₹${(metrics.total_final / 10000000).toFixed(1)} Cr` : '₹424.1 Cr'
    };
  };

  const currentData = getNodeDetails();

  return (
    <div className={`relative w-full h-full min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] rounded-3xl overflow-hidden border shadow-2xl flex flex-col justify-between select-none ${
      isDark 
        ? 'border-rose-500/30 bg-gradient-to-b from-[#080c14] via-[#0b0f19] to-[#080c14] shadow-rose-950/20' 
        : 'border-slate-300/80 bg-gradient-to-b from-slate-100 via-sky-50 to-slate-100 shadow-slate-300/50'
    }`}>
      
      {/* Top Glass Header & Mode Indicator */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/85 dark:bg-black/70 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-mono">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            {isDark ? 'QUANTUM NANO GRID MATRIX' : 'SATELLITE TOPOGRAPHIC VIEW'}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            isDark 
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/60' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
          }`}>
            {isDark ? 'DOT-MATRIX NANO' : 'SATELLITE 3D'}
          </span>
        </div>

        {/* House Legend / Spotlight Filter */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[11px] font-semibold">
          <button
            onClick={() => setHouseFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              houseFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Parliament
          </button>
          <button
            onClick={() => setHouseFilter('LOK_SABHA')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              houseFilter === 'LOK_SABHA'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Lok Sabha (543)</span>
          </button>
          <button
            onClick={() => setHouseFilter('RAJYA_SABHA')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              houseFilter === 'RAJYA_SABHA'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-cyan-400/80 hover:text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Rajya Sabha (231)</span>
          </button>
        </div>
      </div>

      {/* Center Boxed Badge: [ India ] (Matching Uploaded Reference Image) */}
      {isDark && !isZoomed && (
        <div className="absolute top-16 left-8 z-10 pointer-events-none">
          <div className="px-3.5 py-1 rounded-md border-2 border-rose-500 bg-black/80 backdrop-blur-md shadow-lg shadow-rose-950/50 flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-widest font-mono uppercase">
              India
            </span>
            <span className="text-[9px] font-mono text-rose-400 font-bold animate-pulse">
              [NANO: ACTIVE]
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1 pl-1">
            LAT: 20.5937° N • LON: 78.9629° E
          </div>
        </div>
      )}

      {/* Reset View Button (When Zoomed In) */}
      {isZoomed && (
        <button
          onClick={handleResetView}
          className="absolute top-16 right-4 z-30 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all border border-rose-400/50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset View (Global Grid)</span>
        </button>
      )}

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full flex-1 cursor-crosshair active:cursor-grabbing relative overflow-hidden"
      />

      {/* Interactive Micro-HUD Card (On Click Zoom or Hover) */}
      {currentData && (
        <div 
          className={`absolute z-30 ${
            isZoomed 
              ? 'top-20 right-4 w-80' 
              : 'pointer-events-none w-72'
          } rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-rose-500/50 p-4 shadow-2xl shadow-rose-950/60 transition-all text-white`}
          style={!isZoomed ? {
            left: Math.min(Math.max(16, tooltipPos.x + 16), (mountRef.current?.clientWidth || 500) - 290),
            top: Math.max(70, Math.min(tooltipPos.y - 100, (mountRef.current?.clientHeight || 450) - 220))
          } : {}}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs animate-ping" />
              <h4 className="text-sm font-black text-white tracking-tight font-mono">
                {currentData.name}
              </h4>
            </div>
            {isZoomed && (
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-[10px] font-mono text-cyan-300 mb-2 flex items-center justify-between">
            <span>COORD: {currentData.lat.toFixed(2)}°N, {currentData.lon.toFixed(2)}°E</span>
            <span className="text-rose-400">MOLECULAR NODE</span>
          </div>

          {/* Project Completion & In-Progress Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60">
              <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Completed
              </div>
              <div className="text-base font-bold text-white mt-0.5 font-mono">
                {currentData.completed.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-400/80 font-mono">
                {((currentData.completed / currentData.totalProjects) * 100).toFixed(1)}% Done
              </div>
            </div>

            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60">
              <div className="text-[10px] text-rose-300 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-400" />
                Not Completed
              </div>
              <div className="text-base font-bold text-white mt-0.5 font-mono">
                {currentData.pending.toLocaleString()}
              </div>
              <div className="text-[9px] text-rose-400/80 font-mono">Active Audit</div>
            </div>
          </div>

          {/* MP Representation */}
          <div className="space-y-1.5 border-t border-white/10 pt-2 text-[11px]">
            <div className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold shrink-0">🏛️ Lok Sabha:</span>
              <span className="text-slate-200 font-medium line-clamp-1">{currentData.lsMps}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-cyan-400 font-bold shrink-0">🏛️ Rajya Sabha:</span>
              <span className="text-slate-200 font-medium line-clamp-1">{currentData.rsMps}</span>
            </div>
          </div>

          {/* Flagged Alert if exists */}
          {currentData.flaggedWork && (
            <div className="mt-2 p-1.5 rounded-lg bg-red-950/80 border border-red-800 text-[10px] text-red-300 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>FLAGGED WORK {currentData.flaggedWork} (+100% Cost Anomaly)</span>
            </div>
          )}

          {/* Footer Metrics */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Exp: <strong className="text-white">{currentData.expenditure}</strong></span>
            <span>Risk Score: <strong className="text-cyan-300">{currentData.riskScore}</strong></span>
          </div>

          {isZoomed && (
            <button
              onClick={() => {
                if (onSelectState) onSelectState(currentData.name);
              }}
              className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Open State Intelligence Dashboard
            </button>
          )}
        </div>
      )}

      {/* Bottom Instructions Strip */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span className="font-mono">Lok Sabha (543)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs" />
            <span className="font-mono">Rajya Sabha (231)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
          <span>🔍 Click node to Zoom-in</span>
          <span>•</span>
          <span>🌊 Nano Particle Wave Active</span>
          <span>•</span>
          <span>📜 Scroll for Inertial Reaction</span>
        </div>
      </div>

    </div>
  );
};

export default ThreeIndiaMap;
"""

with open('frontend/src/components/ThreeIndiaMap.jsx', 'w') as f:
    f.write(content)

print("Generated ThreeIndiaMap.jsx successfully without shell interpolation!")
