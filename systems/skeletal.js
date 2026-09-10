import {
    getSkeletonData,
} from "../anatomy/skeleton-data.js";

import {
    buildSkeletonCatalog,
} from "../anatomy/skeleton-catalog.js";

export const skeletalSystem = {
    id: "skeletal",
    name: "Skeletal System",
    shortName: "Skeletal",
    icon: "🦴",
    available: true,

    modelUrl: "./assets/anatomy/skeleton.glb",

    description:
        "Explore the bones and structural framework of the human body.",

    getData(key) {
        return getSkeletonData(key);
    },

    buildCatalog(modelNames) {
        return buildSkeletonCatalog(modelNames);
    },

    getDefaultTitle() {
        return "Human Skeleton";
    },

    getDefaultDescription() {
        return (
            "Explore the major bones of the human skeleton. " +
            "Rotate the model and select a structure to begin."
        );
    },

    getDefaultMeta() {
        return `
            <span>🦴 Skeletal System</span>
            <span>🔬 Explore Mode</span>
        `;
    }
};
