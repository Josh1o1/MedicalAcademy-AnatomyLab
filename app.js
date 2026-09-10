
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
    SKELETON_DATA,
    getSkeletonData,
} from "./anatomy/skeleton-data.js";
import { buildSkeletonCatalog } from "./anatomy/skeleton-catalog.js";

const viewer = document.getElementById("viewer");
const loading = document.getElementById("loading");

const structureName = document.getElementById("structureName");
const structureInfo = document.getElementById("structureInfo");
const structureMeta = document.getElementById("structureMeta");

const resetBtn = document.getElementById("resetBtn");
const identifyBtn = document.getElementById("identifyBtn");
const closeBtn = document.getElementById("closeBtn");


const identifyPanel = document.getElementById("identifyPanel");
const identifyQuestion = document.getElementById("identifyQuestion");
const identifyAttemptsEl = document.getElementById("identifyAttempts");
const identifyScoreEl = document.getElementById("identifyScore");
const identifyFeedback = document.getElementById("identifyFeedback");
const identifyExitBtn = document.getElementById("identifyExitBtn");

const tg = window.Telegram?.WebApp;

const MODEL_URL = "./assets/anatomy/skeleton.glb";
const gltfLoader = new GLTFLoader();
let loadedAnatomyModel = null;
// --------------------------------------------------------
// IDENTIFY MODE
// --------------------------------------------------------

let identifyMode = false;
let identifyTarget = null;
let identifyAttempts = 0;
let identifyScore = 0;
let identifyStreak = 0;
let identifyBestStreak = 0;
let identifyQuestions = 0;
const IDENTIFY_SESSION_LENGTH = 10;
let IDENTIFY_POOL = [];
let SKELETON_CATALOG = [];
let identifyDifficulty = null;

const difficultySelector =
    document.getElementById("difficultySelector");

const difficultyButtons =
    document.querySelectorAll(".difficulty-btn");

const identifyAccuracyEl =
    document.getElementById("identifyAccuracy");

const identifyStreakEl =
    document.getElementById("identifyStreak");

const identifyNextBtn =
    document.getElementById("identifyNextBtn");

function startIdentifyChallenge() {
    if (!loadedAnatomyModel || SKELETON_CATALOG.length === 0) {
        return;
    }

    identifyMode = true;
    identifyAttempts = 0;
    identifyScore = 0;
    identifyStreak = 0;
    identifyBestStreak = 0;
    identifyQuestions = 0;
    identifyDifficulty = null;

    identifyPanel.classList.remove("hidden");

    difficultySelector.classList.remove("hidden");

    identifyQuestion.textContent =
        "Choose a difficulty to begin.";

    updateIdentifyStats();

    identifyFeedback.textContent =
        "Select the challenge level that matches your current anatomy knowledge.";
}

function startDifficultyChallenge(difficulty) {
    const pool = SKELETON_CATALOG
        .filter((item) => item.difficulty === difficulty)
        .map((item) => item.key);

    if (pool.length === 0) {
        identifyFeedback.textContent =
            "No structures are available for this difficulty yet.";
        return;
    }

    identifyDifficulty = difficulty;
    IDENTIFY_POOL = pool;

    difficultySelector.classList.add("hidden");

    difficultyButtons.forEach((button) => {
        button.classList.toggle(
            "selected",
            button.dataset.difficulty === difficulty
        );
    });

    identifyAttempts = 0;
    identifyScore = 0;
    identifyStreak = 0;
    identifyBestStreak = 0;
    identifyQuestions = 0;

    identifyAttemptsEl.textContent = "Attempts: 0";
    identifyScoreEl.textContent = "Score: 0";

    chooseNextIdentifyTarget();
}

difficultyButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        startDifficultyChallenge(
            button.dataset.difficulty
        );
    });
});

identifyNextBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!identifyMode || !identifyTarget) return;

    identifyStreak = 0;
    identifyAttempts = 0;

    updateIdentifyStats();
    chooseNextIdentifyTarget();
});

function updateIdentifyStats() {
    const accuracy =
        identifyAttempts > 0
            ? Math.round(
                (identifyScore / identifyAttempts) * 100
            )
            : 0;

    identifyAttemptsEl.textContent =
        `Attempts: ${identifyAttempts}`;

    identifyScoreEl.textContent =
        `Score: ${identifyScore}`;

    identifyAccuracyEl.textContent =
        `Accuracy: ${accuracy}%`;

    identifyStreakEl.textContent =
        `Streak: ${identifyStreak}`;
}

function showIdentifyComplete() {
    const accuracy =
        IDENTIFY_SESSION_LENGTH > 0
            ? Math.round(
                (identifyScore / IDENTIFY_SESSION_LENGTH) * 100
            )
            : 0;

    const difficultyNames = {
        beginner: "🌱 Beginner",
        intermediate: "🔬 Intermediate",
        advanced: "🧠 Advanced"
    };

    const difficultyName =
        difficultyNames[identifyDifficulty] ||
        "🎯 Identify Challenge";

    let message =
        "✦ Keep practicing your anatomy recognition.";

    if (accuracy >= 90) {
        message = "✦ Exceptional anatomy recognition.";
    } else if (accuracy >= 80) {
        message = "✦ Strong anatomy recognition.";
    } else if (accuracy >= 60) {
        message = "✦ Good foundation. Keep sharpening your recognition.";
    }

    identifyQuestion.textContent =
        "🎯 IDENTIFY COMPLETE";

    identifyFeedback.innerHTML = `
        <div class="identify-complete">
            <div class="complete-divider">━━━━━━━━━━━━━━━━━━━━</div>

            <div class="complete-difficulty">
                ${difficultyName}
            </div>

            <div class="complete-stat">
                <span>Questions</span>
                <strong>${IDENTIFY_SESSION_LENGTH}</strong>
            </div>

            <div class="complete-stat">
                <span>Correct</span>
                <strong>${identifyScore}</strong>
            </div>

            <div class="complete-stat">
                <span>Accuracy</span>
                <strong>${accuracy}%</strong>
            </div>

            <div class="complete-stat">
                <span>Best streak</span>
                <strong>${identifyBestStreak}</strong>
            </div>

            <div class="complete-message">
                ${message}
            </div>
        </div>
    `;

    identifyNextBtn.classList.add("hidden");
    identifyExitBtn.textContent = "↻ Exit Identify Mode";

    identifyTarget = null;
    clearSelection();
}

function chooseNextIdentifyTarget() {
    identifyNextBtn.classList.add("hidden");
    const randomIndex = Math.floor(
        Math.random() * IDENTIFY_POOL.length
    );

    identifyTarget = IDENTIFY_POOL[randomIndex];

    const data = getSkeletonData(identifyTarget);

    const displayName =
        data?.name ||
        identifyTarget ||
        "requested structure";

    identifyQuestion.textContent =
        `Find the ${displayName}.`;

    identifyAttemptsEl.textContent = "Attempts: 0";

    identifyScoreEl.textContent =
        `Score: ${identifyScore}`;

    identifyFeedback.textContent =
        "Rotate the model and tap the structure you think is correct.";
}

function exitIdentifyMode() {
    identifyMode = false;
    identifyTarget = null;

    identifyPanel.classList.add("hidden");

    clearSelection();

    structureName.textContent = "Human Skeleton";

    structureInfo.textContent =
        "Explore the major bones of the human skeleton. Rotate the model and select a structure to begin.";

    structureMeta.innerHTML = `
        <span>🦴 Skeletal System</span>
        <span>🔬 Explore Mode</span>
    `;
}

if (tg) {
    tg.ready();
    tg.expand();
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b10);

const camera = new THREE.PerspectiveCamera(
    45,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    100
);

camera.position.set(0, 1.0, 8.5);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.panSpeed = 0.8;
controls.minDistance = 4;
controls.maxDistance = 14;
controls.target.set(0, 0.8, 0);

scene.add(new THREE.AmbientLight(0xffffff, 1.8));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(4, 7, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
fillLight.position.set(-5, 2, -4);
scene.add(fillLight);

const anatomy = new THREE.Group();
scene.add(anatomy);

const clickable = [];
const boneMeshes = new Map();

const boneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9e1dc,
    roughness: 0.7,
    metalness: 0.0
});

const selectedMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0c674,
    roughness: 0.55,
    metalness: 0.0
});

function createBone(id, name, a, b, radius = 0.075) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);

    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    const geometry = new THREE.CylinderGeometry(
        radius,
        radius * 1.08,
        length,
        10
    );

    const mesh = new THREE.Mesh(geometry, boneMaterial.clone());

    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );

    mesh.userData = {
        id,
        name,
        defaultMaterial: mesh.material
    };

    anatomy.add(mesh);
    clickable.push(mesh);
    boneMeshes.set(id, mesh);

    return mesh;
}

function createSphere(id, name, position, radius) {
    const geometry = new THREE.SphereGeometry(radius, 16, 12);
    const mesh = new THREE.Mesh(geometry, boneMaterial.clone());

    mesh.position.set(...position);

    mesh.userData = {
        id,
        name,
        defaultMaterial: mesh.material
    };

    anatomy.add(mesh);
    clickable.push(mesh);
    boneMeshes.set(id, mesh);

    return mesh;
}

function buildSkeleton() {

    // Skull
    createSphere("skull", "Skull", [0, 3.25, 0], 0.55);
    createBone("mandible", "Mandible", [-0.22, 2.92, 0], [0.22, 2.92, 0], 0.10);

    // Spine
    for (let i = 0; i < 12; i++) {
        const y = 2.45 - i * 0.22;
        createSphere(`spine_${i}`, "Vertebral Column", [0, y, 0], 0.105);
    }

    // Clavicles
    createBone("clavicle_l", "Left Clavicle", [0, 2.45, 0], [-0.75, 2.38, 0], 0.075);
    createBone("clavicle_r", "Right Clavicle", [0, 2.45, 0], [0.75, 2.38, 0], 0.075);

    // Scapulae
    createSphere("scapula_l", "Left Scapula", [-0.78, 2.12, -0.05], 0.23);
    createSphere("scapula_r", "Right Scapula", [0.78, 2.12, -0.05], 0.23);

    // Sternum
    createBone("sternum", "Sternum", [0, 2.25, 0.18], [0, 1.15, 0.18], 0.095);

    // Ribs
    for (let i = 0; i < 6; i++) {
        const y = 2.25 - i * 0.18;
        const width = 0.8 - i * 0.035;

        createBone(
            `rib_l_${i}`,
            "Ribs",
            [0, y, 0.18],
            [-width, y - 0.06, 0],
            0.045
        );

        createBone(
            `rib_r_${i}`,
            "Ribs",
            [0, y, 0.18],
            [width, y - 0.06, 0],
            0.045
        );
    }

    // Pelvis
    createSphere("pelvis", "Pelvis", [0, -0.25, 0], 0.58);

    // Upper limbs
    createBone("humerus_l", "Left Humerus", [-0.78, 2.18, 0], [-1.0, 1.15, 0], 0.105);
    createBone("humerus_r", "Right Humerus", [0.78, 2.18, 0], [1.0, 1.15, 0], 0.105);

    createBone("radius_l", "Left Radius", [-1.0, 1.1, 0], [-1.05, 0.2, 0], 0.065);
    createBone("radius_r", "Right Radius", [1.0, 1.1, 0], [1.05, 0.2, 0], 0.065);

    createBone("ulna_l", "Left Ulna", [-1.05, 1.1, 0.04], [-1.1, 0.2, 0.04], 0.065);
    createBone("ulna_r", "Right Ulna", [1.05, 1.1, 0.04], [1.1, 0.2, 0.04], 0.065);

    createSphere("hand_l", "Left Hand", [-1.08, 0.05, 0], 0.14);
    createSphere("hand_r", "Right Hand", [1.08, 0.05, 0], 0.14);

    // Lower limbs
    createBone("femur_l", "Left Femur", [-0.32, -0.35, 0], [-0.42, -1.75, 0], 0.13);
    createBone("femur_r", "Right Femur", [0.32, -0.35, 0], [0.42, -1.75, 0], 0.13);

    createSphere("patella_l", "Left Patella", [-0.42, -1.8, 0.12], 0.12);
    createSphere("patella_r", "Right Patella", [0.42, -1.8, 0.12], 0.12);

    createBone("tibia_l", "Left Tibia", [-0.42, -1.82, 0], [-0.45, -3.25, 0], 0.09);
    createBone("tibia_r", "Right Tibia", [0.42, -1.82, 0], [0.45, -3.25, 0], 0.09);

    createBone("fibula_l", "Left Fibula", [-0.36, -1.82, 0], [-0.32, -3.25, 0], 0.055);
    createBone("fibula_r", "Right Fibula", [0.36, -1.82, 0], [0.32, -3.25, 0], 0.055);

    createSphere("foot_l", "Left Foot", [-0.42, -3.42, 0.12], 0.18);
    createSphere("foot_r", "Right Foot", [0.42, -3.42, 0.12], 0.18);
}

buildSkeleton();
async function loadAnatomyModel(url) {
    console.log("🦴 loadAnatomyModel called:", url);
    if (!url) return null;

    return new Promise((resolve, reject) => {
        console.log("🦴 Requesting skeleton:", url);
        gltfLoader.load(
            url,
            (gltf) => {
                loadedAnatomyModel = gltf.scene;
                resolve(loadedAnatomyModel);
            },
            undefined,
            (error) => {
                console.error("Anatomy model failed to load:", error);
                reject(error);
            }
        );
    });
}
async function initRealAnatomy() {
    console.log("🦴 initRealAnatomy() started");
    if (!MODEL_URL) return;

    try {
        const model = await loadAnatomyModel(MODEL_URL);

        model.position.set(0, 0, 0);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);

        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetHeight = 6.5;

        if (maxDimension > 0) {
            model.scale.setScalar(targetHeight / maxDimension);
        }

        const modelNames = [];

    model.traverse((object) => {
    if (!object.isMesh) return;

    object.userData.isRealAnatomy = true;

    object.userData.name =
        object.name ||
        object.parent?.name ||
        "Anatomical Structure";

    object.userData.modelKey = object.name;

        modelNames.push(object.name);

    object.userData.defaultMaterial = object.material;

    if (object.material) {
        object.material = object.material.clone();
    }

    object.castShadow = false;
    object.receiveShadow = false;

    clickable.push(object);
});

        SKELETON_CATALOG = buildSkeletonCatalog(modelNames);
        IDENTIFY_POOL = SKELETON_CATALOG.map((item) => item.key);

        console.log(
            "Skeleton catalog built:",
            SKELETON_CATALOG.length,
            "structures"
        );

        anatomy.add(model);

        // Hide the procedural prototype once the real model is ready.
        for (const mesh of boneMeshes.values()) {
            mesh.visible = false;
        }

        loadedAnatomyModel = model;

        console.log(
            "Real anatomy model loaded:",
            clickable.filter(
                (mesh) => mesh.userData.isRealAnatomy
            ).length,
            "meshes"
        );

    } catch (error) {
        console.error(
            "Real anatomy model could not be loaded. Keeping prototype.",
            error
        );
    }
}

initRealAnatomy();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let selected = null;

function clearSelection() {
    for (const mesh of clickable) {
        if (mesh.userData?.isRealAnatomy) {
            if (mesh.userData.defaultMaterial) {
                mesh.material = mesh.userData.defaultMaterial;
            }
        } else if (mesh.userData?.defaultMaterial) {
            mesh.material = mesh.userData.defaultMaterial;
        }
    }

    selected = null;
}

function selectBone(mesh) {
    if (!mesh || !mesh.userData) return;

    if (mesh.userData.isRealAnatomy) {
        clearSelection();

        selected = mesh;

        if (mesh.material) {
            mesh.material = selectedMaterial;
        }

        const key = mesh.userData.modelKey || mesh.name;
const data = getSkeletonData(key);

const name =
    data?.name ||
    mesh.userData.name ||
    mesh.name ||
    "Anatomical Structure";

structureName.textContent = name;

if (data) {
    structureInfo.textContent = data.description;

    structureMeta.innerHTML = `
        <span>🦴 ${data.system}</span>
        <span>📍 ${data.region}</span>
        <span>⚙️ ${data.function}</span>
    `;
} else {
    structureInfo.textContent =
        "Anatomical structure from the 3D anatomy model.";

    structureMeta.innerHTML = `
        <span>🧬 Anatomy Lab</span>
        <span>🔬 Explore Mode</span>
    `;
}

        return;
    }
    clearSelection();

    selected = mesh;
    mesh.material = selectedMaterial;

    structureName.textContent = mesh.userData.name;

    const descriptions = {
        "Skull": "The skull protects the brain and forms the framework of the head.",
        "Mandible": "The mandible is the lower jaw and the largest bone of the facial skeleton.",
        "Left Clavicle": "The clavicle connects the upper limb to the axial skeleton.",
        "Right Clavicle": "The clavicle connects the upper limb to the axial skeleton.",
        "Sternum": "The sternum is the flat bone forming the central part of the anterior thoracic wall.",
        "Ribs": "The ribs form the thoracic cage and help protect organs such as the heart and lungs.",
        "Vertebral Column": "The vertebral column supports the body and protects the spinal cord.",
        "Pelvis": "The pelvis supports the trunk and connects the axial skeleton with the lower limbs.",
        "Left Humerus": "The humerus is the long bone of the upper arm.",
        "Right Humerus": "The humerus is the long bone of the upper arm.",
        "Left Radius": "The radius is one of the two long bones of the forearm.",
        "Right Radius": "The radius is one of the two long bones of the forearm.",
        "Left Ulna": "The ulna is the forearm bone located on the medial side in anatomical position.",
        "Right Ulna": "The ulna is the forearm bone located on the medial side in anatomical position.",
        "Left Femur": "The femur is the longest and strongest bone in the human body.",
        "Right Femur": "The femur is the longest and strongest bone in the human body.",
        "Left Patella": "The patella is a sesamoid bone that protects the anterior knee and improves the leverage of the quadriceps.",
        "Right Patella": "The patella is a sesamoid bone that protects the anterior knee and improves the leverage of the quadriceps.",
        "Left Tibia": "The tibia is the larger weight-bearing bone of the leg.",
        "Right Tibia": "The tibia is the larger weight-bearing bone of the leg.",
        "Left Fibula": "The fibula is the slender lateral bone of the leg.",
        "Right Fibula": "The fibula is the slender lateral bone of the leg."
    };

    structureInfo.textContent =
        descriptions[mesh.userData.name] ||
        "An anatomical structure of the human skeleton.";

    structureMeta.innerHTML =
        `<span>🦴 Skeletal System</span><span>📍 ${getRegion(mesh.userData.name)}</span>`;
}

function getRegion(name) {
    if (name.includes("Skull") || name.includes("Mandible")) return "Head";
    if (name.includes("Clavicle") || name.includes("Scapula")) return "Shoulder";
    if (name.includes("Humerus") || name.includes("Radius") ||
        name.includes("Ulna") || name.includes("Hand")) return "Upper Limb";
    if (name.includes("Femur") || name.includes("Patella") ||
        name.includes("Tibia") || name.includes("Fibula") ||
        name.includes("Foot")) return "Lower Limb";
    if (name.includes("Rib") || name === "Sternum") return "Thorax";
    if (name === "Pelvis") return "Pelvis";
    return "Axial Skeleton";
}

function pointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster
    .intersectObjects(clickable, true)
    .filter((hit) => hit.object.userData?.isRealAnatomy);

    if (!hits.length) return;

    const mesh = hits[0].object;

    console.log(
        "Anatomy tap:",
        mesh.name,
        mesh.userData?.modelKey,
        mesh.userData?.name
    );

    if (identifyMode) {
        const key = mesh.userData.modelKey || mesh.name;

        identifyAttempts += 1;

        if (key === identifyTarget) {
            identifyScore += 1;
            identifyStreak += 1;
            identifyQuestions += 1;

            if (identifyStreak > identifyBestStreak) {
                identifyBestStreak = identifyStreak;
            }

            updateIdentifyStats();

            const correctData = getSkeletonData(identifyTarget);
            const correctName =
                correctData?.name ||
                identifyTarget ||
                "structure";

            identifyFeedback.textContent =
                `✦ Correct! You identified the ${correctName}.`;

            identifyNextBtn.classList.add("hidden");

            selectBone(mesh);

            if (identifyQuestions >= IDENTIFY_SESSION_LENGTH) {
                showIdentifyComplete();
                return;
            }

            setTimeout(() => {
                if (identifyMode && identifyTarget) {
                    chooseNextIdentifyTarget();
                }
            }, 900);
        } else {
            identifyStreak = 0;

            identifyFeedback.textContent =
                "◇ Not quite. Try another structure.";

            identifyNextBtn.classList.remove("hidden");

            updateIdentifyStats();
        }

        return;
    }



    selectBone(mesh);
}
renderer.domElement.addEventListener("pointerdown", pointerDown);


resetBtn.addEventListener("click", () => {
    camera.position.set(0, 1.0, 8.5);
    controls.target.set(0, 0.8, 0);
    controls.update();

    identifyMode = false;
    clearSelection();

    structureName.textContent = "Human Skeleton";
    structureInfo.textContent =
        "Explore the major bones of the human skeleton. Rotate the model and select a structure to begin.";

    structureMeta.innerHTML =
        "<span>🦴 Skeletal System</span><span>🔬 Explore Mode</span>";

});

closeBtn.addEventListener("click", () => {
    if (tg) {
        tg.close();
    } else {
        history.back();
    }
});

function resize() {

    const width = viewer.clientWidth;
    const height = viewer.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener("resize", resize);

loading.style.display = "none";

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();
identifyBtn.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
});

identifyBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    startIdentifyChallenge();
});

identifyExitBtn.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
});

identifyExitBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    exitIdentifyMode();
});
