import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  getGeminiPageGuide, 
  askGeminiRobot, 
  PAGE_GUIDE_KNOWLEDGE 
} from '../services/geminiService';
import { 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Sparkles, 
  X, 
  Eye,
  ArrowUpRight
} from 'lucide-react';

const TOUR_STEPS = [
  { path: '/', title: 'National Overview', label: '1. Overview' },
  { path: '/high-risk', title: 'Priority Review Queue', label: '2. High-Risk Works' },
  { path: '/project/80673', title: 'Project #80673 Diagnostic', label: '3. Flagged #80673' },
  { path: '/anomalies', title: 'Anomaly Center', label: '4. Anomalies' },
  { path: '/mps', title: 'MP & Constituency Analytics', label: '5. MP Analytics' },
  { path: '/states', title: 'State Regional Matrix', label: '6. State Matrix' },
  { path: '/reports', title: 'Inspection Reports', label: '7. Reports' },
  { path: '/transparency', title: 'Data Transparency & Audit', label: '8. Transparency' }
];

/**
 * Custom 3D Robot Eyes Icon (Double Camera Binocular Lenses)
 * Replaces generic 2D bot logo with the 3D model's actual facial lenses
 */
export const RobotEyesIcon = ({ className = "w-7 h-4" }) => (
  <svg 
    viewBox="0 0 48 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Orange Binocular Bridge */}
    <rect x="20" y="10" width="8" height="4" rx="2" fill="#ea580c" />
    
    {/* Left Eye Housing */}
    <circle cx="12" cy="12" r="11" fill="#18181b" stroke="#f97316" strokeWidth="2.5" />
    <circle cx="12" cy="12" r="7" fill="#09090b" stroke="#38bdf8" strokeWidth="1.5" />
    
    {/* Blinking Left Pupil */}
    <g className="animate-bot-eye-blink">
      <circle cx="12" cy="12" r="4" fill="#38bdf8" />
      <circle cx="13.5" cy="10.5" r="1.3" fill="#ffffff" />
    </g>
    
    {/* Right Eye Housing */}
    <circle cx="36" cy="12" r="11" fill="#18181b" stroke="#f97316" strokeWidth="2.5" />
    <circle cx="36" cy="12" r="7" fill="#09090b" stroke="#38bdf8" strokeWidth="1.5" />
    
    {/* Blinking Right Pupil */}
    <g className="animate-bot-eye-blink">
      <circle cx="36" cy="12" r="4" fill="#38bdf8" />
      <circle cx="37.5" cy="10.5" r="1.3" fill="#ffffff" />
    </g>
  </svg>
);

/**
 * Poses the fingers for a given arm
 * @param {Object} bones - Map of captured bones
 * @param {boolean} isArm1 - True for right waving arm, false for left arm
 * @param {boolean} isOpen - True for wide open fingers, false for natural relaxed resting pose
 * @param {number} waveFlutter - Gentle dynamic flutter offset during waving
 */
const setArmFingers = (bones, isArm1, isOpen, waveFlutter = 0) => {
  const p = isArm1 ? '1' : '2';
  const f = bones[`finger${p}`];
  const fm = bones[`finger${p}_m`];
  const fe = bones[`finger${p}_end`];
  const idx = bones[`index${p}`];
  const idxm = bones[`index${p}_m`];
  const idxe = bones[`index${p}_end`];
  const th = bones[`thumb${p}`];
  const the = bones[`thumb${p}_end`];

  const side = isArm1 ? 1 : -1;

  if (isOpen) {
    // Wide open, extended fingers with natural lateral spread & waving flutter
    if (idx) idx.rotation.set(-0.02, 0, (-0.14 - waveFlutter) * side);
    if (idxm) idxm.rotation.set(-0.02, 0, 0);
    if (idxe) idxe.rotation.set(0, 0, 0);

    if (f) f.rotation.set(-0.02, 0, (0.12 + waveFlutter) * side);
    if (fm) fm.rotation.set(-0.02, 0, 0);
    if (fe) fe.rotation.set(0, 0, 0);

    if (th) th.rotation.set(0.18, -0.22 * side, (0.52 + waveFlutter * 0.5) * side);
    if (the) the.rotation.set(0, 0, 0);
  } else {
    // Natural relaxed open resting pose (fingers extended & slightly curved, never clenched fists!)
    if (idx) idx.rotation.set(0.04, 0, -0.06 * side);
    if (idxm) idxm.rotation.set(0.06, 0, 0);
    if (idxe) idxe.rotation.set(0, 0, 0);

    if (f) f.rotation.set(0.04, 0, 0.06 * side);
    if (fm) fm.rotation.set(0.06, 0, 0);
    if (fe) fe.rotation.set(0, 0, 0);

    if (th) th.rotation.set(0.1, -0.15 * side, 0.35 * side);
    if (the) the.rotation.set(0, 0, 0);
  }
};

export const RobotGuide = ({ 
  isTourActive = true, 
  onToggleTour,
  onStartTour 
}) => {
  const mountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Three.js references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const activeActionRef = useRef(null);
  const bonesRef = useRef({});
  const eyesMaterialRef = useRef(null);
  const eyesMeshRef = useRef(null);
  const origEyePositionsRef = useRef(null);
  const eyeLightRef = useRef(null);
  const blinkStateRef = useRef({
    nextBlinkTime: performance.now() + 1600,
    isBlinking: false,
    blinkStartTime: 0,
    blinkDuration: 160,
    isDoubleBlink: false,
    progress: 0.0
  });
  const reqIdRef = useRef(null);

  // Mouse cursor tracking for head look-at
  const mouseRef = useRef({ x: 0, y: 0 });
  const headRotationRef = useRef({ x: 0, y: 0, z: 0 });
  const isThinkingRef = useRef(false);
  const pathnameRef = useRef(location.pathname);
  const isHoppingRef = useRef(false);
  const initialPosRef = useRef({ x: 0, y: 0, z: 0 });

  // States
  const [modelLoaded, setModelLoaded] = useState(false);
  const [secretWatchPhase, setSecretWatchPhase] = useState('watching'); // 'watching' | 'saying_hi' | 'active'
  const [isWalkingAcross, setIsWalkingAcross] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [walkOffset, setWalkOffset] = useState(0);
  const [speechBubbleOpen, setSpeechBubbleOpen] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(() => {
    return localStorage.getItem('mplad_voice_allowed') === 'true';
  });
  const [guideData, setGuideData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isPeekingHovered, setIsPeekingHovered] = useState(false);

  // Synchronized refs for Three.js render loop to prevent any re-mounts
  const isTourActiveRef = useRef(isTourActive);
  const secretWatchPhaseRef = useRef(secretWatchPhase);
  const isWavingRef = useRef(isWaving);
  const speechBubbleOpenRef = useRef(speechBubbleOpen);
  const isWalkingAcrossRef = useRef(isWalkingAcross);
  const lastPatrolledRouteRef = useRef(location.pathname); // Track route to prevent run on app open

  useEffect(() => { isTourActiveRef.current = isTourActive; }, [isTourActive]);
  useEffect(() => { secretWatchPhaseRef.current = secretWatchPhase; }, [secretWatchPhase]);
  useEffect(() => { isWavingRef.current = isWaving; }, [isWaving]);
  useEffect(() => { speechBubbleOpenRef.current = speechBubbleOpen; }, [speechBubbleOpen]);
  useEffect(() => { isWalkingAcrossRef.current = isWalkingAcross; }, [isWalkingAcross]);

  // Track mouse cursor for realistic head-tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Play animation with smooth cross-fade
  const playAnimation = (name, duration = 0.35) => {
    const actions = actionsRef.current;
    if (!actions) return;
    const targetKey = Object.keys(actions).find(
      k => k.toLowerCase() === name.toLowerCase()
    );
    if (!targetKey || !actions[targetKey]) return;

    const nextAction = actions[targetKey];
    const prevAction = activeActionRef.current;

    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(duration);
      nextAction.reset().fadeIn(duration).play();
    } else if (!prevAction) {
      nextAction.reset().play();
    }
    activeActionRef.current = nextAction;
  };

  // Sync animation refs with React state
  useEffect(() => {
    isThinkingRef.current = loadingAI || isAnswering;
  }, [loadingAI, isAnswering]);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Trigger a lifelike eye blink (single or double blink)
  const triggerBlink = (isDouble = true) => {
    const blink = blinkStateRef.current;
    if (!blink) return;
    blink.isBlinking = true;
    blink.blinkStartTime = performance.now();
    blink.blinkDuration = 160;
    blink.isDoubleBlink = isDouble;
  };

  // Autonomous wave gesture with extended duration (4.8 seconds) and greeting eye blink
  const triggerSideToSideWave = () => {
    setIsWaving(true);
    triggerBlink(true);
    playAnimation('IDLE', 0.25);
    setTimeout(() => {
      setIsWaving(false);
    }, 4800);
  };

  // Autonomous celebration wave (no jumping, stays planted on ground)
  const triggerCelebration = () => {
    isHoppingRef.current = false;
    triggerSideToSideWave();
  };

  // 1. Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth > 0 ? container.clientWidth : 220;
    const height = container.clientHeight > 0 ? container.clientHeight : 290;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.25, 3.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    const amberBounce = new THREE.PointLight(0xf59e0b, 1.4, 8);
    amberBounce.position.set(0, -0.5, 1.5);
    scene.add(amberBounce);

    const eyeLight = new THREE.PointLight(0x00f0ff, 2.8, 4);
    eyeLight.position.set(0, 1.45, 0.4);
    scene.add(eyeLight);
    eyeLightRef.current = eyeLight;

    // Load Animated Humanoid Robot GLB
    const loader = new GLTFLoader();
    loader.load(
      '/animated_humanoid_robot.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Auto-center and fit model perfectly in camera view
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetHeight = 1.85;
        const scale = targetHeight / (size.y || 1);
        model.scale.set(scale, scale, scale);

        const ox = -center.x * scale;
        const oy = -box.min.y * scale;
        const oz = -center.z * scale;
        initialPosRef.current = { x: ox, y: oy, z: oz };
        model.position.set(ox, oy, oz);

        const capturedBones = {};
        model.traverse((child) => {
          if (child.isMesh && (child.name === 'Cylinder001_1' || child.material?.name === 'EYES' || child.name.includes('Cylinder'))) {
            if (child.material?.name === 'EYES' || child.name === 'Cylinder001_1' || child.name === 'Cylinder_001_1') {
              const mat = child.material.clone();
              mat.color = new THREE.Color(0xffffff);
              mat.emissive = new THREE.Color(0x00f0ff);
              mat.emissiveIntensity = 2.2;
              child.material = mat;
              eyesMaterialRef.current = mat;
              eyesMeshRef.current = child;

              if (child.geometry && child.geometry.attributes.position) {
                origEyePositionsRef.current = new Float32Array(child.geometry.attributes.position.array);
              }
            }
          }

          if (child.isBone || child.name.includes('ROBOT_BONES')) {
            const n = child.name;
            if (n.includes('HEAD')) capturedBones.head = child;
            if (n.includes('NECK')) capturedBones.neck = child;
            if (n.includes('BODY')) capturedBones.body = child;
            if (n === 'ARM_ROBOT_BONES') capturedBones.arm = child;
            if (n === 'FOREARM_ROBOT_BONES') capturedBones.forearm = child;
            if (n === 'HAND_ROBOT_BONES') capturedBones.hand = child;
            if (n === 'ARM.001_ROBOT_BONES') capturedBones.arm2 = child;
            if (n === 'FOREARM.001_ROBOT_BONES') capturedBones.forearm2 = child;
            if (n === 'HAND.001_ROBOT_BONES') capturedBones.hand2 = child;

            // Arm 1 (Right waving arm) Finger Bones
            if (n === 'FINGER_ROBOT_BONES') capturedBones.finger1 = child;
            if (n === 'FINGER_M_ROBOT_BONES') capturedBones.finger1_m = child;
            if (n === 'FINGER_END_ROBOT_BONES') capturedBones.finger1_end = child;
            if (n === 'INDEX_ROBOT_BONES') capturedBones.index1 = child;
            if (n === 'INDEX_M_ROBOT_BONES') capturedBones.index1_m = child;
            if (n === 'INDEX_END_ROBOT_BONES') capturedBones.index1_end = child;
            if (n === 'THUMB_ROBOT_BONES') capturedBones.thumb1 = child;
            if (n === 'THUMB_END_ROBOT_BONES') capturedBones.thumb1_end = child;

            // Arm 2 (Left arm) Finger Bones
            if (n === 'FINGER.001_ROBOT_BONES') capturedBones.finger2 = child;
            if (n === 'FINGER_M.001_ROBOT_BONES') capturedBones.finger2_m = child;
            if (n === 'FINGER_END.001_ROBOT_BONES') capturedBones.finger2_end = child;
            if (n === 'INDEX.001_ROBOT_BONES') capturedBones.index2 = child;
            if (n === 'INDEX_M.001_ROBOT_BONES') capturedBones.index2_m = child;
            if (n === 'INDEX_END.001_ROBOT_BONES') capturedBones.index2_end = child;
            if (n === 'THUMB.001_ROBOT_BONES') capturedBones.thumb2 = child;
            if (n === 'THUMB_END.001_ROBOT_BONES') capturedBones.thumb2_end = child;
          }
        });
        bonesRef.current = capturedBones;

        scene.add(model);

        // Animations Setup
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          const actions = {};
          gltf.animations.forEach((clip) => {
            const clipName = clip.name.toUpperCase();
            actions[clipName] = mixer.clipAction(clip);
          });
          actionsRef.current = actions;

          const idleClip = Object.keys(actions).find(k => k.includes('IDLE')) || Object.keys(actions)[0];
          if (idleClip && actions[idleClip]) {
            actions[idleClip].play();
            activeActionRef.current = actions[idleClip];
          }
        }

        setModelLoaded(true);
      },
      undefined,
      (error) => {
        console.warn('Animated GLB load fallback:', error);
      }
    );

    // Responsive Canvas Resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Render loop
    const clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const now = performance.now();

      if (mixerRef.current) mixerRef.current.update(delta);

      const bones = bonesRef.current;
      const model = modelRef.current;
      const camera = cameraRef.current;
      const isThinking = isThinkingRef.current;
      const currentPath = pathnameRef.current;
      const isAnomalyPage = currentPath.includes('risk') || currentPath.includes('anomal');

      // -------------------------------------------------------------
      // EYE BLINKING ANIMATION CYCLE
      // -------------------------------------------------------------
      const blink = blinkStateRef.current;
      if (!blink.isBlinking) {
        if (now >= blink.nextBlinkTime) {
          blink.isBlinking = true;
          blink.blinkStartTime = now;
          blink.blinkDuration = 160;
          blink.isDoubleBlink = Math.random() < 0.30;
        }
      } else {
        const elapsed = now - blink.blinkStartTime;
        if (!blink.isDoubleBlink) {
          const tNorm = elapsed / blink.blinkDuration;
          if (tNorm >= 1.0) {
            blink.isBlinking = false;
            blink.progress = 0.0;
            blink.nextBlinkTime = now + 2400 + Math.random() * 2200;
          } else if (tNorm < 0.38) {
            blink.progress = Math.sin((tNorm / 0.38) * (Math.PI / 2));
          } else if (tNorm < 0.52) {
            blink.progress = 1.0;
          } else {
            const openT = (tNorm - 0.52) / 0.48;
            blink.progress = 1.0 - Math.sin(openT * (Math.PI / 2));
          }
        } else {
          // Double blink sequence (~320ms)
          if (elapsed >= 320) {
            blink.isBlinking = false;
            blink.progress = 0.0;
            blink.nextBlinkTime = now + 2600 + Math.random() * 2400;
          } else if (elapsed < 60) {
            blink.progress = elapsed / 60;
          } else if (elapsed < 110) {
            blink.progress = 1.0 - ((elapsed - 60) / 50) * 0.7; // open to 0.3
          } else if (elapsed < 170) {
            blink.progress = 0.3 + ((elapsed - 110) / 60) * 0.7; // close back to 1.0
          } else if (elapsed < 210) {
            blink.progress = 1.0; // hold shut
          } else {
            blink.progress = Math.max(0, 1.0 - (elapsed - 210) / 110);
          }
        }
      }

      // Physical 3D Eye Mesh Vertex Squash (Z is the vertical lens axis in local space)
      if (eyesMeshRef.current && origEyePositionsRef.current) {
        const posAttr = eyesMeshRef.current.geometry.attributes.position;
        const orig = origEyePositionsRef.current;
        const EYE_CENTER_Z = -1.708;
        const squashFactor = 1.0 - blink.progress * 0.96;

        for (let i = 0; i < 192; i++) {
          const zIdx = i * 3 + 2;
          posAttr.array[zIdx] = EYE_CENTER_Z + (orig[zIdx] - EYE_CENTER_Z) * squashFactor;
        }
        posAttr.needsUpdate = true;
      }

      // Dynamic Eye Light & Color with Blink Dimming
      if (eyeLightRef.current && eyesMaterialRef.current) {
        if (isAnomalyPage) {
          eyeLightRef.current.color.setHex(0xf97316);
          eyesMaterialRef.current.color.setHex(0xf97316);
          eyesMaterialRef.current.emissive.setHex(0xea580c);
        } else {
          eyeLightRef.current.color.setHex(0x00f0ff);
          eyesMaterialRef.current.color.setHex(0x00e5ff);
          eyesMaterialRef.current.emissive.setHex(0x00b4d8);
        }

        const blinkDim = Math.max(0.04, 1.0 - blink.progress * 0.96);

        if (isThinking) {
          const pulse = 1.5 + Math.sin(now * 0.012) * 1.0;
          eyeLightRef.current.intensity = pulse * 2.0 * blinkDim;
          eyesMaterialRef.current.emissiveIntensity = pulse * 1.5 * blinkDim;
        } else {
          eyeLightRef.current.intensity = 2.4 * blinkDim;
          eyesMaterialRef.current.emissiveIntensity = 2.0 * blinkDim;
        }
      }

      if (model && camera) {
        const t = now * 0.003;

        const isTourActiveVal = isTourActiveRef.current;
        const secretWatchPhaseVal = secretWatchPhaseRef.current;
        const isWavingVal = isWavingRef.current;
        const speechBubbleOpenVal = speechBubbleOpenRef.current;
        const isWalkingAcrossVal = isWalkingAcrossRef.current;

        const base = initialPosRef.current;
        model.position.y = base.y;
        model.position.z = base.z;

        // -------------------------------------------------------------
        // CASE 1: TOUR OFF OR SECRET WATCHING -> EDGE PEEK & SHAKE
        // -------------------------------------------------------------
        if (!isTourActiveVal || secretWatchPhaseVal === 'watching' || secretWatchPhaseVal === 'saying_hi') {
          camera.position.set(0.1, 1.42, 2.1);
          camera.lookAt(-0.05, 1.38, 0);

          model.rotation.z = 0.12;
          model.rotation.y = -0.35 + Math.sin(t * 0.8) * 0.08;
          model.position.x = base.x + 0.15;

          // Inquisitive head tilt & secret watching scanning motion
          if (bones.head) {
            bones.head.rotation.z = -0.3 + Math.sin(t * 1.2) * 0.06;
            bones.head.rotation.y = 0.25 + Math.sin(t * 1.5) * 0.12;
            bones.head.rotation.x = 0.1 + Math.sin(t * 1.5) * 0.04;
          }

          if (secretWatchPhaseVal === 'watching') {
            // Stealthy secret watching pose: hands tucked beside edge
            if (bones.arm) bones.arm.rotation.set(-0.5, 0.4, -0.3);
            if (bones.forearm) bones.forearm.rotation.set(-0.6, 0, 0);
            setArmFingers(bones, true, false, 0);
            setArmFingers(bones, false, false, 0);
          } else {
            // Upward Hand Wave: Arm Raised High, Hand Shaking Left to Right with OPEN fingers
            if (bones.arm) {
              bones.arm.rotation.set(0.14, 0.04, -0.34); // Raised UPWARD beside head
            }
            if (bones.forearm) {
              const waveSwing = Math.sin(t * 3.8) * 0.40;
              bones.forearm.rotation.set(0.12, 0.04, waveSwing);
            }
            if (bones.hand) {
              const handSwing = Math.sin(t * 3.8 - 0.25) * 0.36;
              bones.hand.rotation.set(0.08, 0, handSwing);
            }
            // FINGERS OPEN & WAVING FLUTTER
            const flutter = Math.sin(t * 3.8 - 0.5) * 0.08;
            setArmFingers(bones, true, true, flutter);
            setArmFingers(bones, false, false, 0);
          }
        } 
        // -------------------------------------------------------------
        // CASE 2: TOUR ON -> AUTONOMOUS LIFE-LIKE GESTURING, THINKING & SCANNING
        // -------------------------------------------------------------
        else {
          camera.position.set(0, 1.25, 3.2);
          camera.lookAt(0, 0.9, 0);
          model.position.x = base.x;
          model.position.y = base.y;
          model.position.z = base.z;

          // 1. Thinking / Pondering Pose (chin tap & head tilt while AI is computing)
          if (isThinking) {
            if (bones.arm) bones.arm.rotation.set(-1.64, 0.16, -1.64);
            if (bones.forearm) bones.forearm.rotation.set(1.5, 0, 0);
            if (bones.hand) bones.hand.rotation.x = Math.sin(t * 8.0) * 0.18; // gentle chin tap
            if (bones.head) {
              bones.head.rotation.z = -0.25;
              bones.head.rotation.x = -0.16 + Math.sin(t * 3.5) * 0.05;
              bones.head.rotation.y = 0.12;
            }
            setArmFingers(bones, true, false, 0);
            setArmFingers(bones, false, false, 0);
          }
          // 2. When raised hand shake is triggered (e.g. on greeting or on click) -> DO HI WITH OPEN FINGERS!
          else if (isWavingVal) {
            // Upward Hand Wave: Arm Raised High, Hand Shaking Left to Right
            if (bones.arm) {
              bones.arm.rotation.set(0.14, 0.04, -0.34); // Raised UPWARD beside head
            }
            if (bones.forearm) {
              const waveSwing = Math.sin(t * 3.8) * 0.40;
              bones.forearm.rotation.set(0.12, 0.04, waveSwing);
            }
            if (bones.hand) {
              const handSwing = Math.sin(t * 3.8 - 0.25) * 0.36;
              bones.hand.rotation.set(0.08, 0, handSwing);
            }
            if (bones.head) {
              bones.head.rotation.z = -0.18 + Math.sin(t * 1.6) * 0.06;
              bones.head.rotation.y = 0.12 + Math.sin(t * 1.6) * 0.06;
              bones.head.rotation.x = -0.05 + Math.sin(t * 3.2) * 0.04;
            }
            // FINGERS OPEN & WAVING FLUTTER
            const flutter = Math.sin(t * 3.8 - 0.5) * 0.08;
            setArmFingers(bones, true, true, flutter);
            setArmFingers(bones, false, false, 0);
          }
          // 3. Conversational / Inspect Gestures while presenting
          else if (speechBubbleOpenVal && !isWalkingAcrossVal) {
            // Organic Breathing & Hip weight shift in IDLE
            if (bones.body) bones.body.position.y = Math.sin(t * 2.2) * 0.02;
            if (bones.neck) bones.neck.rotation.x = Math.sin(t * 2.2) * 0.02;
            model.rotation.z = Math.sin(t * 0.9) * 0.015;

            // Scout Inspection Lean on Anomaly Pages
            if (isAnomalyPage) {
              model.rotation.x = 0.08; // Leans forward to inspect anomalies
            } else {
              model.rotation.x = 0;
            }

            // Mouse cursor head tracking + Anomaly radar sweep
            if (bones.head) {
              const targetYaw = mouseRef.current.x * 0.35;
              const targetPitch = -mouseRef.current.y * 0.25;
              headRotationRef.current.y = THREE.MathUtils.lerp(headRotationRef.current.y, targetYaw, 0.08);
              headRotationRef.current.x = THREE.MathUtils.lerp(headRotationRef.current.x, targetPitch, 0.08);

              const talkNod = Math.sin(t * 3.2) * 0.06;
              const scanSweep = isAnomalyPage ? Math.sin(t * 2.0) * 0.12 : 0;
              bones.head.rotation.y = headRotationRef.current.y + scanSweep;
              bones.head.rotation.x = headRotationRef.current.x + talkNod;
            }

            // Subtle presentation arm gestures (only when idle, not waving)
            if (bones.arm && bones.forearm && !isWavingVal && !isThinking) {
              bones.arm.rotation.z = -0.25 + Math.sin(t * 2.2) * 0.12;
              bones.forearm.rotation.x = -0.3 + Math.sin(t * 2.8) * 0.15;
            }
            if (bones.arm2 && bones.forearm2) {
              bones.arm2.rotation.z = 0.25 - Math.sin(t * 2.2) * 0.12;
              bones.forearm2.rotation.x = -0.3 + Math.cos(t * 2.8) * 0.15;
            }
            // Natural relaxed open fingers on both hands
            setArmFingers(bones, true, false, 0);
            setArmFingers(bones, false, false, 0);
          } else {
            // Default idle fingers open and relaxed
            setArmFingers(bones, true, false, 0);
            setArmFingers(bones, false, false, 0);
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  // 2. Initial "Secret Watch & Say Hi" Entrance Animation on App Open
  useEffect(() => {
    if (!modelLoaded) return;

    // Phase 1: Secretly watching from behind the screen border
    setSecretWatchPhase('watching');
    setSpeechBubbleOpen(false);

    // Phase 2: Spots user, leans in, raises hand and says "Hi!" with enthusiastic shake
    const sayHiTimer = setTimeout(() => {
      setSecretWatchPhase('saying_hi');
      triggerSideToSideWave();
    }, 1700);

    // Phase 3: Steps into active dashboard companion mode & opens Gemini overview
    const activeTimer = setTimeout(() => {
      setSecretWatchPhase('active');
      setSpeechBubbleOpen(true);
    }, 3900);

    return () => {
      clearTimeout(sayHiTimer);
      clearTimeout(activeTimer);
    };
  }, [modelLoaded]);

  // Periodic spontaneous friendly "Hi!" wave & blink every 22 seconds if idle
  useEffect(() => {
    if (!modelLoaded || secretWatchPhase !== 'active') return;
    const interval = setInterval(() => {
      if (!isThinkingRef.current && !isWalkingAcrossRef.current && !isWavingRef.current) {
        triggerSideToSideWave();
      }
    }, 22000);
    return () => clearInterval(interval);
  }, [modelLoaded, secretWatchPhase]);

  // 3. Autonomous Patrol Run: runs across to left corner area and returns running to the same place ONLY on page navigation!
  useEffect(() => {
    // Only run when tour is active and initial entrance has finished
    if (!isTourActive || !modelLoaded || secretWatchPhase !== 'active') return;

    // BUG FIX: Never trigger run on initial app open! Only run when route ACTUALLY changes!
    if (lastPatrolledRouteRef.current === location.pathname) {
      return;
    }
    lastPatrolledRouteRef.current = location.pathname;

    setIsWalkingAcross(true);
    setSpeechBubbleOpen(false); // keep center stage clear while running!
    playAnimation('RUN', 0.2); // Energetic run animation!

    // Run from corner across towards left corner area, then return to home corner!
    const maxDistance = Math.min(window.innerWidth * 0.55, 680);
    const startTime = performance.now();
    const runDuration = 3000; // 3.0s total patrol run across and return

    const runInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / runDuration, 1);

      if (progress < 0.48) {
        // Phase 1: Sprint from home corner across to left corner area
        const sub = progress / 0.48;
        const eased = 0.5 - 0.5 * Math.cos(sub * Math.PI); // smooth easeInOut
        setWalkOffset(-maxDistance * eased);
        if (modelRef.current) modelRef.current.rotation.y = -Math.PI * 0.48; // face left
      } else if (progress < 0.52) {
        // Phase 2: Turn around at left corner
        const turnSub = (progress - 0.48) / 0.04;
        if (modelRef.current) {
          modelRef.current.rotation.y = -Math.PI * 0.48 + turnSub * Math.PI * 0.96;
        }
      } else {
        // Phase 3: Sprint back to the same place (home corner)!
        const sub = (progress - 0.52) / 0.48;
        const eased = 0.5 - 0.5 * Math.cos(sub * Math.PI);
        setWalkOffset(-maxDistance * (1 - eased));
        if (modelRef.current) modelRef.current.rotation.y = Math.PI * 0.48; // face right
      }

      if (progress >= 1) {
        clearInterval(runInterval);
        setWalkOffset(0); // exactly at the same place in the corner!
        setIsWalkingAcross(false);
        if (modelRef.current) {
          modelRef.current.rotation.y = 0; // Turn facing officer
        }
        playAnimation('IDLE', 0.35);
        setSpeechBubbleOpen(true); // Open speech bubble docked in corner!
      }
    }, 16);

    return () => {
      clearInterval(runInterval);
      setWalkOffset(0);
      setIsWalkingAcross(false);
      if (modelRef.current) modelRef.current.rotation.y = 0;
      playAnimation('IDLE', 0.2);
    };
  }, [location.pathname, isTourActive, modelLoaded, secretWatchPhase]);

  // Helper to speak text aloud
  const speakExplanation = (text) => {
    if (!window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.04;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.includes('en') && 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Enable audio permission on user gesture
  const enableAudioPermission = () => {
    setAudioAllowed(true);
    localStorage.setItem('mplad_voice_allowed', 'true');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const primer = new SpeechSynthesisUtterance('Voice guide activated');
      primer.volume = 0.05;
      window.speechSynthesis.speak(primer);
    }
    if (guideData?.explanation) {
      speakExplanation(guideData.explanation);
    }
  };

  // 4. Load Gemini AI explanation & Auto-Speak when audio allowed
  useEffect(() => {
    if (!isTourActive) return;

    let isMounted = true;
    setLoadingAI(true);
    setChatHistory([]);

    getGeminiPageGuide(location.pathname).then((data) => {
      if (isMounted) {
        setGuideData(data);
        setLoadingAI(false);

        // Auto-speak explanation once robot returns to the corner place!
        if (audioAllowed && data?.explanation) {
          setTimeout(() => {
            if (isMounted) speakExplanation(data.explanation);
          }, 3100);
        }
      }
    });

    return () => {
      isMounted = false;
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    };
  }, [location.pathname, isTourActive, audioAllowed]);

  // Audio Narration toggle
  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!audioAllowed) {
      enableAudioPermission();
      return;
    }

    if (guideData?.explanation) {
      speakExplanation(guideData.explanation);
    }
  };

  // Step Navigation
  const currentTourIndex = TOUR_STEPS.findIndex(s => s.path === location.pathname || (s.path !== '/' && location.pathname.startsWith(s.path)));
  const prevStep = currentTourIndex > 0 ? TOUR_STEPS[currentTourIndex - 1] : null;
  const nextStep = currentTourIndex >= 0 && currentTourIndex < TOUR_STEPS.length - 1 ? TOUR_STEPS[currentTourIndex + 1] : TOUR_STEPS[0];

  const goToStep = (path) => {
    // Automatically grant audio permission on user click
    if (!audioAllowed) {
      setAudioAllowed(true);
      localStorage.setItem('mplad_voice_allowed', 'true');
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    navigate(path);
  };

  // Ask Question to Gemini
  const handleAskQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim() || isAnswering) return;

    const q = userQuery.trim();
    setUserQuery('');
    setChatHistory(prev => [...prev, { sender: 'user', text: q }]);
    setIsAnswering(true);

    playAnimation('WALK', 0.3);

    const answer = await askGeminiRobot(q, location.pathname);

    setChatHistory(prev => [...prev, { sender: 'robot', text: answer }]);
    setIsAnswering(false);
    playAnimation('IDLE', 0.4);
  };

  const isPeekingOrTourOff = !isTourActive || secretWatchPhase === 'watching' || secretWatchPhase === 'saying_hi';

  return (
    <aside 
      aria-label="3D AI Robot Guide" 
      className={`fixed z-50 select-none flex flex-col lg:flex-row items-end gap-2.5 transition-all duration-500 ease-out ${
        isPeekingOrTourOff 
          ? 'bottom-0 right-0 pointer-events-auto' 
          : 'bottom-4 right-6 pointer-events-none'
      }`}
      style={{
        transform: isPeekingOrTourOff
          ? secretWatchPhase === 'watching'
            ? 'translateX(15px) translateY(5px)' // peering curiously from edge
            : secretWatchPhase === 'saying_hi'
            ? 'translateX(0px) translateY(0px)' // leaning in to say hi!
            : isPeekingHovered 
            ? 'translateX(-10px) translateY(-5px)' 
            : 'translateX(5px) translateY(5px)'
          : `translateX(${walkOffset}px)`,
        transition: isWalkingAcross ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={() => { if (isPeekingOrTourOff) setIsPeekingHovered(true); }}
      onMouseLeave={() => { if (isPeekingOrTourOff) setIsPeekingHovered(false); }}
    >
      
      {/* 1. Speech Bubble / Gemini Explanation Popup (Only shown when active tour) */}
      {!isPeekingOrTourOff && speechBubbleOpen && !isWalkingAcross && (
        <div className="pointer-events-auto w-[92vw] sm:w-[360px] rounded-3xl bg-[#0c1017]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 p-4 text-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Top Bar with 3D Robot Eyes Icon (No generic bot logo!) */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              
              {/* 3D Robot Eyes Icon */}
              <div className="p-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-xs flex items-center justify-center">
                <RobotEyesIcon className="w-6 h-3.5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-wide text-white">
                    MoSPI Robot Guide
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Gemini 3.6 Flash
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {guideData?.title || 'Tour Active'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* If Audio Permission not yet granted: display 1-click Enable Voice button! */}
              {!audioAllowed && (
                <button
                  onClick={enableAudioPermission}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold border border-cyan-400 shadow-xs animate-pulse transition-all"
                  title="Grant audio permission so the robot speaks aloud"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Enable Voice 🔊</span>
                </button>
              )}

              {/* Speaking Soundwave Indicator */}
              {audioAllowed && isSpeaking && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono">
                  <span className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse" />
                    <span className="w-0.5 h-2.5 bg-cyan-300 animate-bounce" />
                    <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                  </span>
                  <span>Speaking...</span>
                </div>
              )}

              {/* Narration Audio Mute / Unmute Button */}
              {audioAllowed && (
                <button
                  onClick={toggleSpeech}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    isSpeaking
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title={isSpeaking ? "Mute Narration" : "Read Aloud"}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Wave Hi & Blink Button */}
              <button
                onClick={() => {
                  triggerSideToSideWave();
                  triggerBlink(true);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                title="Make robot wave and say hi"
              >
                <span>👋 Hi!</span>
              </button>

              {/* Close Dialog */}
              <button
                onClick={() => setSpeechBubbleOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                title="Dismiss Message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Guide Text */}
          <div className="max-h-52 overflow-y-auto pr-1 space-y-2 text-xs">
            {loadingAI ? (
              <div className="flex items-center gap-2 py-3 text-cyan-400">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-[11px] font-mono">Analyzing with Gemini AI...</span>
              </div>
            ) : (
              <>
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-white/10 leading-relaxed text-slate-200">
                  <p>{guideData?.explanation}</p>
                </div>

                {guideData?.officerFocus && (
                  <div className="bg-cyan-950/40 rounded-xl p-2.5 border border-cyan-800/40 flex items-start gap-2 text-[11px] text-cyan-200 leading-snug">
                    <span className="font-bold text-cyan-400 shrink-0">Officer Focus:</span>
                    <span>{guideData.officerFocus}</span>
                  </div>
                )}
              </>
            )}

            {/* Q&A Thread */}
            {chatHistory.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                  item.sender === 'user' 
                    ? 'bg-blue-950/60 border border-blue-800/40 text-blue-200 ml-4' 
                    : 'bg-slate-900/90 border border-cyan-800/40 text-slate-200 mr-2'
                }`}
              >
                <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {item.sender === 'user' ? 'You' : 'Robot Guide'}
                </span>
                <p>{item.text}</p>
              </div>
            ))}

            {isAnswering && (
              <div className="flex items-center gap-2 text-cyan-400 text-[11px] py-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking with Gemini...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {guideData?.suggestedQuestions && guideData.suggestedQuestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {guideData.suggestedQuestions.slice(0, 2).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setUserQuery(q)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-950 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-700 text-[10px] text-left transition-colors truncate max-w-full"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          )}

          {/* Ask Input */}
          <form onSubmit={handleAskQuestion} className="relative flex items-center pt-1">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask the Robot Guide anything..."
              className="w-full bg-slate-900/90 text-slate-200 text-[11px] pl-3 pr-8 py-2 rounded-xl border border-white/15 focus:outline-hidden focus:border-cyan-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!userQuery.trim() || isAnswering}
              className="absolute right-1.5 p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
            {prevStep ? (
              <button
                onClick={() => goToStep(prevStep.path)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Page</span>
              </button>
            ) : <span />}

            <span className="text-[10px] text-slate-400 font-mono">
              {currentTourIndex >= 0 ? `Step ${currentTourIndex + 1} of ${TOUR_STEPS.length}` : 'Tour'}
            </span>

            {nextStep && (
              <button
                onClick={() => goToStep(nextStep.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md shadow-cyan-950"
              >
                <span>Next: {nextStep.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* 2. 3D Humanoid Robot Avatar (Permanent, Stable Single Mount!) */}
      <div className="pointer-events-auto flex flex-col items-center relative group">
        
        {/* Badge 1: When secretly watching on app open */}
        {secretWatchPhase === 'watching' && (
          <div className="mr-6 mb-[-10px] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c1017]/95 text-amber-300 border border-amber-500/50 shadow-2xl backdrop-blur-xl text-xs font-bold animate-pulse z-20">
            <span className="text-sm">👀</span>
            <span>*Secretly watching...*</span>
          </div>
        )}

        {/* Badge 2: When spotting user & saying hi! */}
        {secretWatchPhase === 'saying_hi' && (
          <div className="mr-8 mb-[-10px] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1017]/95 text-cyan-300 border border-cyan-400 shadow-2xl backdrop-blur-xl text-xs font-bold animate-bounce z-20">
            <RobotEyesIcon className="w-5 h-3" />
            <span>👋 Hi! I'm your AI Guide</span>
          </div>
        )}

        {/* Badge 3: When waving during active mode */}
        {secretWatchPhase === 'active' && isWaving && (
          <div className="mr-8 mb-[-10px] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1017]/95 text-cyan-300 border border-cyan-400 shadow-2xl backdrop-blur-xl text-xs font-bold animate-bounce z-20">
            <RobotEyesIcon className="w-5 h-3" />
            <span>👋 Hi! *Blinking & waving*</span>
          </div>
        )}

        {/* Badge 4: When tour is toggled off */}
        {secretWatchPhase === 'active' && !isTourActive && !isWaving && (
          <button
            onClick={() => {
              if (onStartTour) onStartTour();
              else if (onToggleTour) onToggleTour();
            }}
            className="mr-8 mb-[-12px] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1017]/95 text-cyan-300 border border-cyan-500/50 shadow-2xl backdrop-blur-xl text-xs font-bold animate-bounce group-hover:scale-105 transition-all z-20 cursor-pointer"
          >
            <RobotEyesIcon className="w-5 h-3" />
            <span>Click to Tour</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        )}

        {/* Transparent Three.js Container */}
        <div className="relative w-60 h-80 cursor-pointer overflow-visible">
          <div 
            ref={mountRef} 
            className="w-full h-full overflow-visible"
            style={{ width: '240px', height: '320px', minWidth: '240px', minHeight: '320px' }}
            onClick={() => {
              triggerSideToSideWave();
              triggerBlink(true);
              if (isPeekingOrTourOff) {
                setSecretWatchPhase('active');
                if (onStartTour) onStartTour();
                else if (onToggleTour) onToggleTour();
              } else {
                if (!speechBubbleOpen) setSpeechBubbleOpen(true);
              }
            }}
            title="Click robot to wave hi and blink"
          />

          {/* Organic Ground Contact Shadow */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/35 rounded-full blur-[4px] pointer-events-none" />
        </div>

      </div>

    </aside>
  );
};

export default RobotGuide;
