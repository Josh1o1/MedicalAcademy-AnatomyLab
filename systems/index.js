import { skeletalSystem } from "./skeletal.js";

export const ANATOMY_SYSTEMS = {
    skeletal: skeletalSystem,

    muscular: {
        id: "muscular",
        name: "Muscular System",
        shortName: "Muscular",
        icon: "💪",
        description:
            "Explore the muscles responsible for movement and stability.",
        available: false
    },

    nervous: {
        id: "nervous",
        name: "Nervous System",
        shortName: "Nervous",
        icon: "🧠",
        description:
            "Explore the brain, spinal cord, and peripheral nervous system.",
        available: false
    },

    cardiovascular: {
        id: "cardiovascular",
        name: "Cardiovascular System",
        shortName: "Cardiovascular",
        icon: "❤️",
        description:
            "Explore the heart and vascular network that circulates blood.",
        available: false
    },

    respiratory: {
        id: "respiratory",
        name: "Respiratory System",
        shortName: "Respiratory",
        icon: "🫁",
        description:
            "Explore the organs and passages involved in respiration.",
        available: false
    },

    digestive: {
        id: "digestive",
        name: "Digestive System",
        shortName: "Digestive",
        icon: "🍽️",
        description:
            "Explore the organs responsible for digestion and absorption.",
        available: false
    },

    urinary: {
        id: "urinary",
        name: "Urinary System",
        shortName: "Urinary",
        icon: "🩺",
        description:
            "Explore the kidneys and urinary tract.",
        available: false
    },

    endocrine: {
        id: "endocrine",
        name: "Endocrine System",
        shortName: "Endocrine",
        icon: "🧪",
        description:
            "Explore the hormone-producing glands of the body.",
        available: false
    }
};
