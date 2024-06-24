const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const strainName = urlParams.get('name');
document.title = strainName;

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

const fetchStrainData = () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            const strain = data.find(strain => strain.name === strainName);
            if (strain) {
                console.log('Strain found:', strain);
                createHtmlElements(categorizeStrain(strain));
            } else {
                console.error('Strain not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
fetchStrainData();

const categorizeStrain = (strain) => {
    const categorizedStrain = {
        name: strain.name,
        img_url: strain.img_url,
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
    console.log(categorizedStrain)
    return categorizedStrain;
}

const createHtmlElements = (strain) => {
    const strainImg = document.getElementById('strain-img');
    const strainNameElement = document.getElementById('strain-name');
    const strainTypeElement = document.getElementById('strain-type');
    const strainThcElement = document.getElementById('strain-thc');
    const strainCommonTerpeneElement = document.getElementById('strain-common-terpene');
    const strainDescriptionElement = document.getElementById('strain-description');
    const strainEffectsPositivesList = document.getElementById('strain-positives-list');
    const strainEffectsNegativesList = document.getElementById('strain-negatives-list');
    const strainEffectsHelpsWithList = document.getElementById('strain-helps-with-list');
    strainImg.src = strain.img_url;
    strainNameElement.textContent = strain.name;
    strainTypeElement.textContent = `Type: ${strain.type}`;
    strainThcElement.textContent = `THC: ${strain.thc_level}`;
    strainCommonTerpeneElement.textContent = `Common terpene: ${strain.most_common_terpene}`;
    strainDescriptionElement.textContent = strain.description;
    // maybe we want only the three top effects here 
    for (const effect in strain.effects.positives) {
        const effectElement = document.createElement('li');
        effectElement.textContent = `${effect}: ${strain.effects.positives[effect]}`;
        strainEffectsPositivesList.appendChild(effectElement);
    }
    for (const effect in strain.effects.negatives) {
        const effectElement = document.createElement('li');
        effectElement.textContent = `${effect}: ${strain.effects.negatives[effect]}`;
        strainEffectsNegativesList.appendChild(effectElement);
    }
    for (const effect in strain.effects.helps_with) {
        const effectElement = document.createElement('li');
        effectElement.textContent = `${effect}: ${strain.effects.helps_with[effect]}`;
        strainEffectsHelpsWithList.appendChild(effectElement);
    }
}