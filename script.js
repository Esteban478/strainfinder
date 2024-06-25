setTimeout(() => {
    console.log(strainData.map(strain => restructureData(strain)));
}, 2000);


const metadata = {
    positives: [
        "relaxed", "happy", "euphoric", "uplifted", "sleepy",
        "creative", "energetic", "focused", "giggly", "talkative",
        "tingly", "aroused", "hungry"
    ],
    negatives: [
        "dry_mouth", "dry_eyes", "dizzy", "paranoid", "anxious", "headache"
    ],
    helps_with: [
        "stress", "pain", "depression", "anxiety", "insomnia", "pms", "fatigue", "inflammation",
        "cramps", "eye_pressure", "muscle_spasms", "lack_of_appetite",
        "migraines", "nausea", "arthritis", "cancer", "fibromyalgia",
        "gastrointestinal_disorder", "ptsd", "seizures", "spasticity",
        "spinal_cord_injury", "epilepsy", "phantom_limb_pain",
        "alzheimer's", "add/adhd", "anorexia", "asthma",
        "bipolar_disorder", "crohn's_disease", "hiv/aids",
        "hypertension", "muscular_dystrophy", "multiple_sclerosis",
        "parkinson's", "tinitis", "tourette's_syndrome"
    ]
};

const restructureData = (strain) => {
    const randomNum = Math.floor(Math.random() * 20) + 1;
    const categorizedStrain = {
        name: strain.name,
        img_url: strain.img_url ? strain.img_url : `./assets/strain-${randomNum}.jpg`,
        type: strain.type,
        thc_level: strain.thc_level,
        most_common_terpene: strain.most_common_terpene,
        description: strain.description,
        effects: {
            positives: {},
            negatives: {},
            helps_with: {}
        }
    };

    for (const key in strain) {
        const value = strain[key];
        if (value !== "0%" && typeof value === "string") {
            if (metadata.positives.includes(key)) {
                categorizedStrain.effects.positives[key] = value;
            } else if (metadata.negatives.includes(key)) {
                categorizedStrain.effects.negatives[key] = value;
            } else if (metadata.helps_with.includes(key)) {
                categorizedStrain.effects.helps_with[key] = value;
            }
        }
    }
    return categorizedStrain;
}