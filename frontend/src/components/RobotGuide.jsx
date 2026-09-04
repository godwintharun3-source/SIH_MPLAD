import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import * as THREE from 'three';
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
 * Interactive Tour Spotlight & Explanation Popup
 * Highlights the target UI component being explained with a glowing cyan frame and cyber target brackets,
 * and attaches a floating explanation card explaining that specific section of the application.
 */
const TourSpotlight = ({ guideData, isVisible }) => {
  const [targetRect, setTargetRect] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal whenever route/guideData changes
  useEffect(() => {
    setIsDismissed(false);
  }, [guideData?.focusElementLabel, guideData?.title]);

  useEffect(() => {
    if (!isVisible || !guideData || isDismissed) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      let el = null;
      if (guideData.focusElementSelector) {
        const selectors = guideData.focusElementSelector.split(',').map(s => s.trim());
        for (const s of selectors) {
          try {
            const found = document.querySelector(s);
            if (found && found.getBoundingClientRect().height > 20) {
              el = found;
              break;
            }
          } catch (e) {}
        }
      }
      // Graceful fallback candidates if primary selector is not found
      if (!el) {
        const candidates = [
          '.grid.grid-cols-1',
          '.table-card',
          'table',
          '.overflow-x-auto',
          'svg.india-map',
          'main > div > div:nth-child(2)',
          '.space-y-6 > div:nth-child(2)',
          '.space-y-6 > div:nth-child(1)'
        ];
        for (const c of candidates) {
          try {
            const found = document.querySelector(c);
            if (found && found.getBoundingClientRect().height > 20) {
              el = found;
              break;
            }
          } catch (e) {}
        }
      }

      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 20 && r.height > 20) {
          setTargetRect({
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
            bottom: r.bottom,
            right: r.right,
            rawElement: el
          });
        }
      }
    };

    updateRect();
    const t1 = setTimeout(updateRect, 200);
    const t2 = setTimeout(updateRect, 600);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [guideData, isVisible, isDismissed]);

  if (!isVisible || !targetRect || isDismissed) return null;

  // Position popup either above or below the highlighted section based on viewport space
  const showPopupBelow = targetRect.top < 120;
  const popupTop = showPopupBelow 
    ? Math.min(window.innerHeight - 130, targetRect.bottom + 14) 
    : Math.max(16, targetRect.top - 88);
  const popupLeft = Math.max(16, Math.min(window.innerWidth - 460, targetRect.left + 12));

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-40 transition-all duration-300">
      {/* 1. Glowing Pulsing Cyan Target Frame */}
      <div 
        className="fixed rounded-2xl border-3 border-cyan-400 shadow-[0_0_35px_5px_rgba(6,182,212,0.65),inset_0_0_20px_rgba(6,182,212,0.2)] pointer-events-none transition-all duration-300 ease-out animate-pulse"
        style={{
          top: `${Math.max(6, targetRect.top - 8)}px`,
          left: `${Math.max(6, targetRect.left - 8)}px`,
          width: `${Math.min(window.innerWidth - 12, targetRect.width + 16)}px`,
          height: `${targetRect.height + 16}px`,
        }}
      >
        {/* High-Tech Cyber Corner Brackets */}
        <div className="absolute -top-2 -left-2 w-5 h-5 border-t-3 border-l-3 border-cyan-200 shadow-md shadow-cyan-400" />
        <div className="absolute -top-2 -right-2 w-5 h-5 border-t-3 border-r-3 border-cyan-200 shadow-md shadow-cyan-400" />
        <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-3 border-l-3 border-cyan-200 shadow-md shadow-cyan-400" />
        <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-3 border-r-3 border-cyan-200 shadow-md shadow-cyan-400" />
      </div>

      {/* 2. Floating Highlight Explanation Popup */}
      <div 
        className="fixed pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0c1017]/95 border-2 border-cyan-400 shadow-2xl shadow-cyan-950 text-white backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[92vw] sm:max-w-xl z-50"
        style={{
          top: `${popupTop}px`,
          left: `${popupLeft}px`,
        }}
      >
        <div className="p-2 rounded-xl bg-slate-900 border border-cyan-500/60 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-900">
          <RobotEyesIcon className="w-6 h-3.5" />
        </div>

        <div className="space-y-1 text-left min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Robot Explaining
            </span>
            <span className="text-xs font-black text-white truncate">
              {guideData?.focusElementLabel || 'Current Section'}
            </span>
          </div>
          <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed font-medium">
            {guideData?.officerFocus || guideData?.summary}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (targetRect?.rawElement) {
                targetRect.rawElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-cyan-950 cursor-pointer flex items-center gap-1"
            title="Center this section on screen"
          >
            <span>Focus 🎯</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Hide Highlight Frame"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/**
 * Custom 3D Companion Robot Eyes Icon (Rounded Visor with Square Cyan Eyes & Smile)
 * Faithfully represents the 3D procedural companion robot avatar
 */
export const RobotEyesIcon = ({ className = "w-7 h-4" }) => (
  <svg 
    viewBox="0 0 48 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Sleek rounded dark visor */}
    <rect x="2" y="2" width="44" height="20" rx="7" fill="#0b1322" stroke="#38bdf8" strokeWidth="1.8" />
    
    {/* Left Glowing Cyan Square Eye */}
    <rect x="11" y="6.5" width="9" height="9" rx="2.2" fill="#38bdf8" />
    <circle cx="17.5" cy="8.5" r="1.2" fill="#ffffff" />
    
    {/* Right Glowing Cyan Square Eye */}
    <rect x="28" y="6.5" width="9" height="9" rx="2.2" fill="#38bdf8" />
    <circle cx="34.5" cy="8.5" r="1.2" fill="#ffffff" />
    
    {/* Smiling Curved Mouth */}
    <path d="M19 16.5 Q24 20.8 29 16.5" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  </svg>
);

/**
 * Creates rounded rectangle shape for Three.js geometry extrusions
 */
function createRoundRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/**
 * Canvas round rect helper with graceful fallback
 */
function canvasRoundRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
}

/**
 * Renders the digital face (cyan square eyes + specular shine + smile) onto the visor canvas
 */
/**
 * Renders the digital face (cyan square eyes + specular shine + smile) onto the visor canvas
 */
function renderFaceDisplay(fCtx, faceTexture, blinkProgress, lookX, lookY, isWaving, isSpeaking, isHiding = false) {
  fCtx.clearRect(0, 0, 512, 512);

  // 1. Dark Glossy Screen Background (Guarantees face is never blank)
  fCtx.fillStyle = '#080d16';
  canvasRoundRect(fCtx, 12, 12, 488, 488, 54);
  fCtx.fill();

  // Subtle glassy highlight reflection arc across upper screen
  const specGrad = fCtx.createLinearGradient(20, 20, 480, 220);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
  specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  fCtx.fillStyle = specGrad;
  canvasRoundRect(fCtx, 20, 20, 472, 210, 44);
  fCtx.fill();

  // Cyan Neon Glow styling
  fCtx.shadowColor = '#00f0ff';
  fCtx.shadowBlur = 22;
  fCtx.fillStyle = '#67f5ff';
  fCtx.strokeStyle = '#67f5ff';
  fCtx.lineWidth = 10;
  fCtx.lineCap = 'round';
  fCtx.lineJoin = 'round';

  const eyeBaseW = 96;
  const eyeBaseH = 96;
  const eyeRadius = 26;

  // Eye Squashing for natural blink
  const currentEyeH = Math.max(3.5, eyeBaseH * (1 - blinkProgress * 0.96));
  const isEyeClosed = blinkProgress > 0.82;

  // Pupil look-at offset (-1 to 1 normalized mouse, or peeking top-left when hiding)
  const offsetX = isHiding ? -28 : lookX * 16;
  const offsetY = isHiding ? -20 : -lookY * 10;

  const leftEyeCenterX = 170 + offsetX;
  const rightEyeCenterX = 342 + offsetX;
  const eyeCenterY = 210 + offsetY;

  // Left Eye
  if (isWaving) {
    // Cheerful smiling squint arch ^
    fCtx.lineWidth = 10;
    fCtx.beginPath();
    fCtx.arc(leftEyeCenterX, eyeCenterY + 16, 42, Math.PI * 1.15, Math.PI * 1.85, false);
    fCtx.stroke();
  } else if (isEyeClosed) {
    fCtx.lineWidth = 9;
    fCtx.beginPath();
    fCtx.moveTo(leftEyeCenterX - 42, eyeCenterY);
    fCtx.lineTo(leftEyeCenterX + 42, eyeCenterY);
    fCtx.stroke();
  } else {
    fCtx.beginPath();
    const rx = leftEyeCenterX - eyeBaseW / 2;
    const ry = eyeCenterY - currentEyeH / 2;
    canvasRoundRect(fCtx, rx, ry, eyeBaseW, currentEyeH, Math.min(eyeRadius, currentEyeH / 2));
    fCtx.fill();

    // Specular highlight white dot in upper-right corner
    if (currentEyeH > 35) {
      fCtx.fillStyle = '#ffffff';
      fCtx.beginPath();
      fCtx.arc(leftEyeCenterX + 18, eyeCenterY - 16, 10, 0, Math.PI * 2);
      fCtx.fill();
      fCtx.fillStyle = '#67f5ff';
    }
  }

  // Right Eye
  if (isWaving) {
    fCtx.lineWidth = 10;
    fCtx.beginPath();
    fCtx.arc(rightEyeCenterX, eyeCenterY + 16, 42, Math.PI * 1.15, Math.PI * 1.85, false);
    fCtx.stroke();
  } else if (isEyeClosed) {
    fCtx.lineWidth = 9;
    fCtx.beginPath();
    fCtx.moveTo(rightEyeCenterX - 42, eyeCenterY);
    fCtx.lineTo(rightEyeCenterX + 42, eyeCenterY);
    fCtx.stroke();
  } else {
    fCtx.beginPath();
    const rx = rightEyeCenterX - eyeBaseW / 2;
    const ry = eyeCenterY - currentEyeH / 2;
    canvasRoundRect(fCtx, rx, ry, eyeBaseW, currentEyeH, Math.min(eyeRadius, currentEyeH / 2));
    fCtx.fill();

    if (currentEyeH > 35) {
      fCtx.fillStyle = '#ffffff';
      fCtx.beginPath();
      fCtx.arc(rightEyeCenterX + 18, eyeCenterY - 16, 10, 0, Math.PI * 2);
      fCtx.fill();
      fCtx.fillStyle = '#67f5ff';
    }
  }

  // Prominent Glowing Beaming Smily Face
  const mouthCenterX = 256 + offsetX * 0.4;
  const mouthCenterY = 276 + offsetY * 0.4;

  if (isSpeaking) {
    // Joyful talking mouth pulsing with speech
    const talkHeight = 9 + Math.abs(Math.sin(performance.now() * 0.016)) * 14;
    fCtx.fillStyle = '#67f5ff';
    fCtx.beginPath();
    fCtx.ellipse(mouthCenterX, mouthCenterY + 4, 24, talkHeight, 0, 0, Math.PI * 2);
    fCtx.fill();
  } else {
    // Glowing cyan smile curve with rounded tips lifting up
    const smileW = isHiding ? 30 : isWaving ? 44 : 38;
    const smileDrop = isHiding ? 17 : isWaving ? 25 : 21;
    fCtx.lineWidth = 11;
    fCtx.strokeStyle = '#67f5ff';
    fCtx.beginPath();
    fCtx.moveTo(mouthCenterX - smileW, mouthCenterY - 4);
    fCtx.quadraticCurveTo(mouthCenterX, mouthCenterY + smileDrop, mouthCenterX + smileW, mouthCenterY - 4);
    fCtx.stroke();
  }

  faceTexture.needsUpdate = true;
}

/**
 * Procedural Companion Robot 3D Assembly
 * Generates the white ceramic floating robot with blue vest, arc reactor, and glowing visor
 */
function assembleProceduralCompanionRobot(scene) {
  const robotRoot = new THREE.Group();
  robotRoot.name = "ProceduralCompanionRobot";
  // Compact chibi robot scale (leaves viewport open, makes ears & hands stand out cute)
  robotRoot.scale.set(0.68, 0.68, 0.68);

  // --- High-Quality Materials ---
  const whiteCeramicMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.16,
    metalness: 0.04,
  });

  const blueVestMat = new THREE.MeshStandardMaterial({
    color: 0x4aa3eb, // Sky blue vest matching image
    roughness: 0.28,
    metalness: 0.06,
  });

  const collarTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
  });

  const darkVisorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.06,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });

  const darkJointMat = new THREE.MeshStandardMaterial({
    color: 0x2b3544,
    roughness: 0.4,
    metalness: 0.5,
  });

  const cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x67f5ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 2.8,
    roughness: 0.2,
  });

  const cyanGlowBasicMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.85,
  });

  // --- 1. Soft Dynamic Contact Shadow on Floor ---
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.12)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -0.88;
  scene.add(shadowMesh);

  // --- 2. Floating Body Torso ---
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, -0.22, 0);

  // White rounded egg capsule torso
  const torsoGeom = new THREE.SphereGeometry(0.52, 32, 32);
  torsoGeom.scale(1.02, 1.20, 0.94);
  const torsoMesh = new THREE.Mesh(torsoGeom, whiteCeramicMat);
  bodyGroup.add(torsoMesh);

  // Sky Blue Chest Collar / Vest Plate
  const vestGeom = new THREE.SphereGeometry(
    0.535, 32, 24, 
    Math.PI * 0.28, Math.PI * 0.44, 
    Math.PI * 0.08, Math.PI * 0.38
  );
  const vestMesh = new THREE.Mesh(vestGeom, blueVestMat);
  bodyGroup.add(vestMesh);

  // White Collar Trim border line
  const collarTrimGeom = new THREE.TorusGeometry(0.26, 0.015, 8, 28, Math.PI * 0.85);
  const collarTrimMesh = new THREE.Mesh(collarTrimGeom, collarTrimMat);
  collarTrimMesh.position.set(0, 0.34, 0.44);
  collarTrimMesh.rotation.x = 0.35;
  bodyGroup.add(collarTrimMesh);

  // Chest Arc Reactor (Cyan Core)
  const coreBezelGeom = new THREE.CylinderGeometry(0.115, 0.115, 0.02, 32);
  const coreBezelMesh = new THREE.Mesh(coreBezelGeom, whiteCeramicMat);
  coreBezelMesh.rotation.x = Math.PI / 2 + 0.15;
  coreBezelMesh.position.set(0, 0.11, 0.48);
  bodyGroup.add(coreBezelMesh);

  const coreGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.028, 32);
  const coreMesh = new THREE.Mesh(coreGeom, cyanEmissiveMat);
  coreMesh.rotation.x = Math.PI / 2 + 0.15;
  coreMesh.position.set(0, 0.11, 0.49);
  bodyGroup.add(coreMesh);

  const coreLight = new THREE.PointLight(0x00f0ff, 1.8, 2.0);
  coreLight.position.set(0, 0.11, 0.65);
  bodyGroup.add(coreLight);

  // Underside soft cyan glow rim
  const auraGeom = new THREE.TorusGeometry(0.38, 0.025, 8, 32);
  const auraMesh = new THREE.Mesh(auraGeom, cyanGlowBasicMat);
  auraMesh.rotation.x = Math.PI / 2;
  auraMesh.position.set(0, -0.48, 0);
  bodyGroup.add(auraMesh);

  robotRoot.add(bodyGroup);

  // --- 3. Floating Arms & Noticeably Bigger Chubby Hands ---
  const armGeom = new THREE.CapsuleGeometry(0.13, 0.32, 14, 24);
  const handPalmGeom = new THREE.SphereGeometry(0.19, 24, 24);
  handPalmGeom.scale(1.05, 1.20, 0.90);
  const thumbGeom = new THREE.CapsuleGeometry(0.075, 0.14, 8, 16);
  const palmSensorGeom = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24);

  // Left Arm (Relaxed)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.55, 0.06, 0);
  const leftArmMesh = new THREE.Mesh(armGeom, whiteCeramicMat);
  leftArmMesh.position.set(0, -0.16, 0);
  leftArmMesh.rotation.z = -0.12;
  leftArmGroup.add(leftArmMesh);

  // Left Chubby Hand (Noticeably Big & Cute)
  const leftHandGroup = new THREE.Group();
  leftHandGroup.position.set(0, -0.36, 0);
  const leftPalm = new THREE.Mesh(handPalmGeom, whiteCeramicMat);
  leftHandGroup.add(leftPalm);

  const leftThumb = new THREE.Mesh(thumbGeom, whiteCeramicMat);
  leftThumb.position.set(-0.14, 0.04, 0.06);
  leftThumb.rotation.z = -0.70;
  leftThumb.rotation.x = 0.3;
  leftHandGroup.add(leftThumb);

  const leftSensor = new THREE.Mesh(palmSensorGeom, cyanEmissiveMat);
  leftSensor.rotation.x = Math.PI / 2;
  leftSensor.position.set(0, 0, 0.14);
  leftHandGroup.add(leftSensor);

  leftArmGroup.add(leftHandGroup);
  bodyGroup.add(leftArmGroup);

  // Right Arm (Interactive Waving Arm with Large Chubby Hand)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.55, 0.06, 0);
  const rightArmMesh = new THREE.Mesh(armGeom, whiteCeramicMat);
  rightArmMesh.position.set(0, -0.16, 0);
  rightArmMesh.rotation.z = 0.12;
  rightArmGroup.add(rightArmMesh);

  // Right Chubby Hand (Noticeably Big & Cute)
  const rightHandGroup = new THREE.Group();
  rightHandGroup.position.set(0, -0.36, 0);
  const rightPalm = new THREE.Mesh(handPalmGeom, whiteCeramicMat);
  rightHandGroup.add(rightPalm);

  const rightThumb = new THREE.Mesh(thumbGeom, whiteCeramicMat);
  rightThumb.position.set(0.14, 0.04, 0.06);
  rightThumb.rotation.z = 0.70;
  rightThumb.rotation.x = 0.3;
  rightHandGroup.add(rightThumb);

  const rightSensor = new THREE.Mesh(palmSensorGeom, cyanEmissiveMat);
  rightSensor.rotation.x = Math.PI / 2;
  rightSensor.position.set(0, 0, 0.14);
  rightHandGroup.add(rightSensor);

  rightArmGroup.add(rightHandGroup);
  bodyGroup.add(rightArmGroup);

  // --- 4. Neck Joint ---
  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 0.14, 24),
    darkJointMat
  );
  neckMesh.position.set(0, 0.36, 0);
  robotRoot.add(neckMesh);

  // --- 5. Head Group ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0);

  // Outer White Ceramic Head Shell
  const headShape = createRoundRectShape(0.96, 0.70, 0.22);
  const headGeom = new THREE.ExtrudeGeometry(headShape, {
    depth: 0.50,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08
  });
  headGeom.center();
  const headMesh = new THREE.Mesh(headGeom, whiteCeramicMat);
  headGroup.add(headMesh);

  // Curved Black Screen Visor
  const visorShape = createRoundRectShape(0.76, 0.50, 0.14);
  const visorGeom = new THREE.ExtrudeGeometry(visorShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03
  });
  visorGeom.center();
  const visorMesh = new THREE.Mesh(visorGeom, darkVisorMat);
  visorMesh.position.set(0, 0, 0.30);
  headGroup.add(visorMesh);

  // Interactive Digital Face Canvas Texture (Cyan square eyes + smile)
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 512;
  faceCanvas.height = 512;
  const fCtx = faceCanvas.getContext('2d');
  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;

  // Render initial face so smiley face is visible immediately upon initialization
  renderFaceDisplay(fCtx, faceTexture, 0, 0, 0, false, false, false);

  const facePlaneMat = new THREE.MeshBasicMaterial({
    map: faceTexture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const facePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.49), facePlaneMat);
  facePlane.position.set(0, 0, 0.368);
  facePlane.renderOrder = 20;
  headGroup.add(facePlane);

  // Top Light Accent
  const topGlowGeom = new THREE.TorusGeometry(0.24, 0.015, 8, 24, Math.PI * 0.7);
  const topGlowMesh = new THREE.Mesh(topGlowGeom, cyanEmissiveMat);
  topGlowMesh.rotation.x = Math.PI / 2;
  topGlowMesh.position.set(0, 0.44, 0.02);
  headGroup.add(topGlowMesh);

  // Extra Large Cute Bunny/Chibi Ears (Noticeably Bigger)
  const earGeom = new THREE.CapsuleGeometry(0.14, 0.48, 14, 24);
  
  // Left Ear Nub
  const leftEar = new THREE.Mesh(earGeom, whiteCeramicMat);
  leftEar.position.set(-0.54, 0.42, 0);
  leftEar.rotation.z = -0.30;
  leftEar.rotation.x = -0.05;
  headGroup.add(leftEar);

  // Right Ear Nub
  const rightEar = new THREE.Mesh(earGeom, whiteCeramicMat);
  rightEar.position.set(0.54, 0.42, 0);
  rightEar.rotation.z = 0.30;
  rightEar.rotation.x = -0.05;
  headGroup.add(rightEar);

  // Extra Large Side Earmuffs with Bright Cyan Glow Rings
  const earmuffDiscGeom = new THREE.CylinderGeometry(0.19, 0.19, 0.08, 28);
  const earmuffRingGeom = new THREE.TorusGeometry(0.19, 0.034, 10, 28);

  // Left Pod
  const leftPodDisc = new THREE.Mesh(earmuffDiscGeom, whiteCeramicMat);
  leftPodDisc.rotation.z = Math.PI / 2;
  leftPodDisc.position.set(-0.55, 0, 0);
  headGroup.add(leftPodDisc);

  const leftPodRing = new THREE.Mesh(earmuffRingGeom, cyanEmissiveMat);
  leftPodRing.rotation.y = Math.PI / 2;
  leftPodRing.position.set(-0.59, 0, 0);
  headGroup.add(leftPodRing);

  // Right Pod
  const rightPodDisc = new THREE.Mesh(earmuffDiscGeom, whiteCeramicMat);
  rightPodDisc.rotation.z = -Math.PI / 2;
  rightPodDisc.position.set(0.55, 0, 0);
  headGroup.add(rightPodDisc);

  const rightPodRing = new THREE.Mesh(earmuffRingGeom, cyanEmissiveMat);
  rightPodRing.rotation.y = -Math.PI / 2;
  rightPodRing.position.set(0.59, 0, 0);
  headGroup.add(rightPodRing);

  robotRoot.add(headGroup);
  scene.add(robotRoot);

  return {
    robotRoot,
    bodyGroup,
    headGroup,
    leftArmGroup,
    rightArmGroup,
    leftHandGroup,
    rightHandGroup,
    coreLight,
    shadowMesh,
    shadowMat,
    faceCanvas,
    fCtx,
    faceTexture,
    cyanEmissiveMat,
    blueVestMat
  };
}

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
  const companionRobotRef = useRef(null);
  const reqIdRef = useRef(null);

  // Mouse cursor tracking for head look-at
  const mouseRef = useRef({ x: 0, y: 0 });
  const isThinkingRef = useRef(false);
  const pathnameRef = useRef(location.pathname);
  const waveStartTimeRef = useRef(0);

  // Lifelike eye blink cycle state
  const blinkStateRef = useRef({
    nextBlinkTime: performance.now() + 1600,
    isBlinking: false,
    blinkStartTime: 0,
    blinkDuration: 160,
    isDoubleBlink: false,
    progress: 0.0
  });

  // States
  const [secretWatchPhase, setSecretWatchPhase] = useState('watching'); // 'watching' | 'saying_hi' | 'active'
  const [isWaving, setIsWaving] = useState(false);
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

  // Synchronized refs for Three.js render loop
  const isTourActiveRef = useRef(isTourActive);
  const isWavingRef = useRef(isWaving);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => { isTourActiveRef.current = isTourActive; }, [isTourActive]);
  useEffect(() => { isWavingRef.current = isWaving; }, [isWaving]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { isThinkingRef.current = loadingAI || isAnswering; }, [loadingAI, isAnswering]);
  useEffect(() => { pathnameRef.current = location.pathname; }, [location.pathname]);

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

  // Trigger lifelike eye blink
  const triggerBlink = (isDouble = true) => {
    const blink = blinkStateRef.current;
    if (!blink) return;
    blink.isBlinking = true;
    blink.blinkStartTime = performance.now();
    blink.blinkDuration = 160;
    blink.isDoubleBlink = isDouble;
  };

  // Autonomous waving gesture with greeting eye blink
  const triggerSideToSideWave = () => {
    setIsWaving(true);
    waveStartTimeRef.current = performance.now();
    triggerBlink(true);
    setTimeout(() => {
      setIsWaving(false);
    }, 4200);
  };

  // 1. Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth > 0 ? container.clientWidth : 240;
    const height = container.clientHeight > 0 ? container.clientHeight : 320;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 3.4);
    camera.lookAt(0, 0.10, 0);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.4);
    rimLight.position.set(-2.5, 2, -2);
    scene.add(rimLight);

    const softFill = new THREE.PointLight(0x38bdf8, 1.2, 8);
    softFill.position.set(0, -0.6, 1.8);
    scene.add(softFill);

    // Build the 3D Procedural Companion Robot
    const robot = assembleProceduralCompanionRobot(scene);
    companionRobotRef.current = robot;

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
      const time = clock.getElapsedTime();
      const now = performance.now();

      const r = companionRobotRef.current;
      if (!r) return;

      const {
        robotRoot,
        headGroup,
        bodyGroup,
        leftArmGroup,
        rightArmGroup,
        leftHandGroup,
        rightHandGroup,
        coreLight,
        shadowMesh,
        shadowMat,
        faceCanvas,
        fCtx,
        faceTexture,
        cyanEmissiveMat
      } = r;

      const isCurrentWaving = isWavingRef.current;
      const isCurrentSpeaking = isSpeakingRef.current;
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
          } else if (tNorm < 0.4) {
            blink.progress = Math.sin((tNorm / 0.4) * (Math.PI / 2));
          } else if (tNorm < 0.52) {
            blink.progress = 1.0;
          } else {
            const openT = (tNorm - 0.52) / 0.48;
            blink.progress = 1.0 - Math.sin(openT * (Math.PI / 2));
          }
        } else {
          // Double blink sequence
          if (elapsed >= 320) {
            blink.isBlinking = false;
            blink.progress = 0.0;
            blink.nextBlinkTime = now + 2600 + Math.random() * 2400;
          } else if (elapsed < 60) {
            blink.progress = elapsed / 60;
          } else if (elapsed < 110) {
            blink.progress = 1.0 - ((elapsed - 60) / 50) * 0.7;
          } else if (elapsed < 170) {
            blink.progress = 0.3 + ((elapsed - 110) / 60) * 0.7;
          } else if (elapsed < 210) {
            blink.progress = 1.0;
          } else {
            blink.progress = Math.max(0, 1.0 - (elapsed - 210) / 110);
          }
        }
      }

      // Redraw Digital Face Screen (Cyan square eyes, blinking, pupil tracking, smile, hiding gaze)
      renderFaceDisplay(
        fCtx,
        faceTexture,
        blink.progress,
        mouseRef.current.x,
        mouseRef.current.y,
        isCurrentWaving,
        isCurrentSpeaking,
        !isTourActiveRef.current
      );

      // -------------------------------------------------------------
      // FLOATING HOVER PHYSICS & BREATHING
      // -------------------------------------------------------------
      const hoverY = Math.sin(time * 2.2) * 0.065;
      const hoverRotZ = Math.cos(time * 1.6) * 0.018;
      const hoverRotY = Math.sin(time * 1.1) * 0.025;

      robotRoot.position.y = hoverY;
      robotRoot.rotation.z = hoverRotZ;
      robotRoot.rotation.y = hoverRotY;

      // Soft Floor Contact Shadow responds to hover height
      shadowMesh.scale.setScalar(1 - hoverY * 0.8);
      shadowMat.opacity = Math.max(0.18, 0.46 - hoverY * 0.35);

      // Arc Core Reactor Pulsing
      coreLight.intensity = 1.8 + Math.sin(time * 3.5) * 0.45;
      if (isAnomalyPage) {
        cyanEmissiveMat.color.setHex(0xf97316);
        cyanEmissiveMat.emissive.setHex(0xea580c);
        coreLight.color.setHex(0xf97316);
      } else {
        cyanEmissiveMat.color.setHex(0x67f5ff);
        cyanEmissiveMat.emissive.setHex(0x00f0ff);
        coreLight.color.setHex(0x00f0ff);
      }

      // -------------------------------------------------------------
      // HIDING POSE VS INTERACTIVE HEAD LOOK-AT CURSOR
      // -------------------------------------------------------------
      if (!isTourActiveRef.current) {
        // When tour is off, robot hides behind screen corner with curious sideways tilt
        const hideTiltZ = -0.40;
        const hideTiltY = -0.48 + mouseRef.current.x * 0.18; // curious peek inwards
        const hideTiltX = -0.16;
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, hideTiltZ, 0.08);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, hideTiltY, 0.08);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, hideTiltX, 0.08);
        
        // Right hand rests peeking on imaginary corner edge
        rightArmGroup.rotation.z = THREE.MathUtils.lerp(rightArmGroup.rotation.z, -1.35, 0.08);
        rightArmGroup.rotation.y = THREE.MathUtils.lerp(rightArmGroup.rotation.y, 0.65, 0.08);
      } else {
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, 0, 0.08);
        const targetHeadY = mouseRef.current.x * 0.36;
        const targetHeadX = -mouseRef.current.y * 0.20;
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadY, 0.08);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadX, 0.08);
      }

      // -------------------------------------------------------------
      // WAVING ARM ANIMATION (Right Arm raises high on right side and hand sweeps Right to Left)
      // -------------------------------------------------------------
      if (isCurrentWaving) {
        const waveElapsed = (now - waveStartTimeRef.current) * 0.001;
        // Rhythmically sweep right-to-left
        const waveSweep = Math.sin(waveElapsed * 7.5); // oscillates between -1 (rightmost) and +1 (leftmost)
        
        // Arm rises up high on the right side and swings across from right to left
        const targetWaveZ = 2.40 + waveSweep * 0.36; // 2.04 (right) to 2.76 (left)
        const targetWaveY = -0.22 - waveSweep * 0.38; // sweeps in front across right-to-left
        const targetWaveX = -0.28 + Math.cos(waveElapsed * 7.5) * 0.14;

        rightArmGroup.rotation.z = THREE.MathUtils.lerp(rightArmGroup.rotation.z, targetWaveZ, 0.18);
        rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, targetWaveX, 0.18);
        rightArmGroup.rotation.y = THREE.MathUtils.lerp(rightArmGroup.rotation.y, targetWaveY, 0.18);

        // Hand articulates visibly from right to left in sync with arm stroke
        if (rightHandGroup) {
          rightHandGroup.rotation.z = THREE.MathUtils.lerp(rightHandGroup.rotation.z, -waveSweep * 0.60, 0.22);
          rightHandGroup.rotation.y = THREE.MathUtils.lerp(rightHandGroup.rotation.y, Math.cos(waveElapsed * 7.5) * 0.35, 0.22);
        }
      } else if (isTourActiveRef.current) {
        // Natural resting pose beside body when tour is active
        rightArmGroup.rotation.z = THREE.MathUtils.lerp(rightArmGroup.rotation.z, 0.12, 0.08);
        rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, 0.08, 0.08);
        rightArmGroup.rotation.y = THREE.MathUtils.lerp(rightArmGroup.rotation.y, 0, 0.08);
        if (rightHandGroup) {
          rightHandGroup.rotation.z = THREE.MathUtils.lerp(rightHandGroup.rotation.z, 0, 0.08);
          rightHandGroup.rotation.y = THREE.MathUtils.lerp(rightHandGroup.rotation.y, 0, 0.08);
        }
      }

      // Left Arm gentle breathing sway
      leftArmGroup.rotation.z = -0.12 + Math.sin(time * 2.2) * 0.03;
      if (leftHandGroup) {
        leftHandGroup.rotation.z = Math.sin(time * 2.2) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // 2. Secret Watching Experience on Initial App Load
  useEffect(() => {
    const watchTimer = setTimeout(() => {
      setSecretWatchPhase('saying_hi');
      triggerSideToSideWave();
      triggerBlink(true);

      const activeTimer = setTimeout(() => {
        setSecretWatchPhase('active');
        setSpeechBubbleOpen(true);
      }, 2600);

      return () => clearTimeout(activeTimer);
    }, 1800);

    return () => clearTimeout(watchTimer);
  }, []);

  // 3. Audio Narration & Speech Synthesis
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!audioAllowed) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.08; // Friendly warm AI tone

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Samantha') || 
      v.name.includes('Google US English') ||
      v.lang.startsWith('en')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (guideData?.explanation) {
      speakText(guideData.explanation);
    }
  };

  const handleEnableAudio = () => {
    localStorage.setItem('mplad_voice_allowed', 'true');
    setAudioAllowed(true);
    if (guideData?.explanation) {
      speakText(guideData.explanation);
    }
  };

  // 4. Update Guide Content on Route Change
  useEffect(() => {
    const updateGuide = async () => {
      setLoadingAI(true);
      const data = await getGeminiPageGuide(location.pathname);
      setGuideData(data);
      setLoadingAI(false);

      if (audioAllowed && !isSpeaking && data?.explanation) {
        speakText(data.explanation);
      }
    };

    updateGuide();
    setChatHistory([]);
  }, [location.pathname]);

  // 5. Ask Gemini Question
  const handleAskQuestion = async (e) => {
    e?.preventDefault();
    if (!userQuery.trim() || isAnswering) return;

    const q = userQuery.trim();
    setUserQuery('');
    setChatHistory(prev => [...prev, { sender: 'user', text: q }]);
    setIsAnswering(true);

    triggerBlink(true);
    const answer = await askGeminiRobot(q, location.pathname);
    setChatHistory(prev => [...prev, { sender: 'robot', text: answer }]);
    setIsAnswering(false);

    if (audioAllowed) {
      speakText(answer);
    }
  };

  // Tour Navigation
  const currentTourIndex = TOUR_STEPS.findIndex(s => s.path === location.pathname);
  const nextStep = TOUR_STEPS[currentTourIndex + 1];
  const prevStep = TOUR_STEPS[currentTourIndex - 1];

  const goToStep = (path) => {
    navigate(path);
    triggerSideToSideWave();
  };

  const isPeekingOrTourOff = !isTourActive || secretWatchPhase === 'watching' || secretWatchPhase === 'saying_hi';

  return (
    <>
      {/* 0. Live UI Component Spotlight & Highlight Popup while Explaining */}
      <TourSpotlight 
        guideData={guideData} 
        isVisible={isTourActive && !loadingAI} 
      />

      <aside 
        aria-label="MoSPI AI Companion Guide"
        className="fixed bottom-3 right-3 z-50 pointer-events-none flex flex-col items-end gap-2.5 transition-all select-none"
        style={{
          transform: !isTourActive
            ? isPeekingHovered 
              ? 'translateX(70px) translateY(55px) rotate(-9deg)' 
              : 'translateX(135px) translateY(115px) rotate(-18deg)'
            : secretWatchPhase === 'watching'
            ? 'translateX(12px) translateY(5px)'
            : 'translateX(0px) translateY(0px)',
          transition: 'transform 0.50s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={() => { if (isPeekingOrTourOff) setIsPeekingHovered(true); }}
        onMouseLeave={() => { if (isPeekingOrTourOff) setIsPeekingHovered(false); }}
      >
      
      {/* 1. Speech Bubble / Gemini Explanation Popup */}
      {!isPeekingOrTourOff && speechBubbleOpen && (
        <div className="pointer-events-auto w-[92vw] sm:w-[360px] rounded-3xl bg-[#0c1017]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 p-4 text-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Top Bar with 3D Robot Eyes Icon */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              
              {/* Cute Companion Robot Visor Icon */}
              <div className="p-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-xs flex items-center justify-center">
                <RobotEyesIcon className="w-6 h-3.5" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-wide text-white">
                    MoSPI AI Companion
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Live Guide
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {guideData?.title || 'Tour Active'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!audioAllowed && (
                <button
                  onClick={handleEnableAudio}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                  title="Enable Audio Read Aloud"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Enable Voice 🔊</span>
                </button>
              )}

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

              {/* Wave Hi Button */}
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
                  {item.sender === 'user' ? 'You' : 'Companion Guide'}
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
              placeholder="Ask me anything about this page..."
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400/60 transition-colors"
            />
            <button
              type="submit"
              disabled={!userQuery.trim() || isAnswering}
              className="absolute right-1.5 p-1 rounded-lg text-cyan-400 hover:text-cyan-300 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Tour Steps Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
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

      {/* 2. 3D Companion Robot Avatar Container */}
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

        {/* Badge 4: When tour is toggled off (Hiding Mode) */}
        {!isTourActive && !isWaving && (
          <button
            onClick={() => {
              if (onStartTour) onStartTour();
              else if (onToggleTour) onToggleTour();
            }}
            className="mr-6 mb-[-12px] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1017]/95 text-cyan-300 border border-cyan-500/60 shadow-2xl backdrop-blur-xl text-xs font-bold animate-bounce hover:scale-105 transition-all z-20 cursor-pointer pointer-events-auto"
            title="Click to bring robot out and start tour"
          >
            <span className="text-sm">🫣</span>
            <span>*Psst! Hiding here... Click to start tour*</span>
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

          {/* Additional soft contact blur */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-black/25 rounded-full blur-[3px] pointer-events-none" />
        </div>

      </div>

    </aside>
    </>
  );
};

export default RobotGuide;
