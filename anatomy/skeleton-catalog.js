const BEGINNER_PATTERNS = [
    /^Femur\./,
    /^Tibia\./,
    /^Fibula\./,
    /^Patella\./,
    /^Humerus\./,
    /^Radius\./,
    /^Ulna\./,
    /^Clavicle\./,
    /^Scapula\./,
    /^Hip bone\./,
    /^Mandible$/,
    /^Frontal bone$/,
    /^Parietal bone\./,
    /^Temporal bone\./,
    /^Occipital bone$/,
    /^Maxilla\./,
    /^Zygomatic bone\./,
    /^Sternum$/,
    /^Body of sternum$/,
    /^Manubrium of sternum$/,
    /^Xiphoid process$/,
    /^(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth) rib\./,
    /^Atlas \(C1\)$/,
    /^Axis \(C2\)$/,
    /^Sacrum$/,
    /^Coccyx$/,
];

const INTERMEDIATE_PATTERNS = [
    /metatarsal bone/,
    /metacarpal bone/,
    /phalanx/,
    /Calcaneus\./,
    /Cuboid bone\./,
    /Cuneiform bone\./,
    /Navicular bone\./,
    /Talus\./,
    /Capitate bone\./,
    /Hamate bone\./,
    /Lunate bone\./,
    /Pisiform bone\./,
    /Scaphoid bone\./,
    /Trapezium bone\./,
    /Trapezoid bone\./,
    /Triquetrum bone\./,
    /^Vertebra[ _][CTL]/,
    /^Vertebra[ _]C/,
    /rib\./,
    /Costal cartilage/,
    /^Hyoid bone$/,
    /^Vomer$/,
    /Palatine bone/,
    /Nasal bone/,
    /Lacrimal bone/,
    /Inferior nasal concha/,
    /Sphenoid bone/,
];

const ADVANCED_PATTERNS = [
    /ethmoid/i,
    /sinus/i,
    /cartilage/i,
    /tooth/i,
    /canine/i,
    /incisor/i,
    /molar/i,
    /premolar/i,
    /Arytenoid/i,
    /Corniculate/i,
    /Cricoid/i,
    /Thyroid cartilage/i,
    /nasal septal cartilage/i,
    /alar cartilage/i,
];

function matchesAny(name, patterns) {
    return patterns.some((pattern) => pattern.test(name));
}

export function classifySkeletonStructure(name) {
    if (!name) {
        return {
            difficulty: "advanced",
            category: "Other",
        };
    }

    if (matchesAny(name, ADVANCED_PATTERNS)) {
        return {
            difficulty: "advanced",
            category: getCategory(name),
        };
    }

    if (matchesAny(name, BEGINNER_PATTERNS)) {
        return {
            difficulty: "beginner",
            category: getCategory(name),
        };
    }

    if (matchesAny(name, INTERMEDIATE_PATTERNS)) {
        return {
            difficulty: "intermediate",
            category: getCategory(name),
        };
    }

    return {
        difficulty: "advanced",
        category: getCategory(name),
    };
}

function getCategory(name) {
    if (
        /Femur|Tibia|Fibula|Patella|Hip bone|Humerus|Radius|Ulna|Clavicle|Scapula/.test(name)
    ) {
        return "Major Limb Bones";
    }

    if (/metacarpal|phalanx of .*hand|Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum/.test(name)) {
        return "Hand";
    }

    if (/metatarsal|phalanx of .*foot|Calcaneus|Cuboid|Cuneiform|Navicular|Talus|Sesamoid/.test(name)) {
        return "Foot";
    }

    if (
        /skull|Mandible|Maxilla|Frontal|Parietal|Temporal|Occipital|Ethmoid|Sphenoid|Zygomatic|Nasal|Lacrimal|Palatine|Vomer|concha/i.test(name)
    ) {
        return "Skull";
    }

    if (/rib|sternum|Costal cartilage/i.test(name)) {
        return "Thoracic Cage";
    }

    if (/Vertebra[ _]|Atlas|Axis|Sacrum|Coccyx/i.test(name)) {
        return "Vertebral Column";
    }

    if (/tooth|canine|incisor|molar|premolar/i.test(name)) {
        return "Teeth";
    }

    if (/cartilage|Hyoid/i.test(name)) {
        return "Other Skeletal Structures";
    }

    return "Other";
}

export function buildSkeletonCatalog(names) {
    return names.map((name) => {
        const classification = classifySkeletonStructure(name);

        return {
            key: name,
            name,
            difficulty: classification.difficulty,
            category: classification.category,
        };
    });
}

export function difficultyLabel(difficulty) {
    switch (difficulty) {
        case "beginner":
            return "🌱 Beginner";

        case "intermediate":
            return "🔬 Intermediate";

        case "advanced":
            return "🧠 Advanced";

        default:
            return "🧬 Anatomy";
    }
}
