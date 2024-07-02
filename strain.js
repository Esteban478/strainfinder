const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const strainName = urlParams.get('name');
const noInfoText = 'No information available for this strain.'
document.title = strainName;

const fetchStrainData = () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            const strain = data.find(strain => strain.name === strainName);
            if (strain) {
                createHtmlElements(strain);
            } else {
                console.error('Strain not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
fetchStrainData();

const createHtmlElements = (strain) => {
    // let's do some destructuring
    const { img_url, name, type, thc_level, most_common_terpene, description, effects } = strain;
    const { positives, negatives, helps_with } = effects;

    const strainImg = document.querySelector('#strain-img');
    const strainNameElement = document.querySelector('#strain-name');
    const strainTypeElement = document.querySelector('#strain-type');
    const strainThcElement = document.querySelector('#strain-thc');
    const strainCommonTerpeneElement = document.querySelector('#strain-common-terpene');
    const strainDescriptionElement = document.querySelector('#strain-description');
    const strainEffectsPositivesList = document.querySelector('#strain-positives-list');
    const strainEffectsNegativesList = document.querySelector('#strain-negatives-list');
    const strainEffectsHelpsWithList = document.querySelector('#strain-helps-with-list');
    const strainShoppingLink = document.querySelector('.strain-shopping-link');
    const strainShoppingLinkDE = document.querySelector('.strain-shopping-link.de');
    strainImg.src = img_url;
    strainNameElement.textContent = name;
    strainTypeElement.textContent = `Type: ${type ? type : 'N/A'}`;
    strainThcElement.textContent = `THC: ${thc_level ? thc_level : 'N/A'}`;
    strainCommonTerpeneElement.textContent = `Main terpene: ${most_common_terpene ? most_common_terpene : 'N/A'}`;
    strainDescriptionElement.textContent = description;
    strainShoppingLink.href = `https://seedsupreme.com/catalogsearch/result/?q=${name}`;
    strainShoppingLink.textContent = `Shop ${name} at Seedsupreme`;
    strainShoppingLinkDE.href = `https://www.hanfsamenladen.com/search/${name};`
    strainShoppingLinkDE.textContent = `Kaufe ${name} im Hanfsamenladen`;

    // only display if object not empty, otherwise display message "no information available"
    if (!Object.keys(positives).length === 0) {
        for (let effect in positives) {
            strainEffectsPositivesList.appendChild(createEffectsListItem(effect));
        }
    } else {
        strainEffectsPositivesList.textContent = noInfoText;
    }
    if (!Object.keys(negatives).length === 0) {
        for (let effect in negatives) {
            strainEffectsNegativesList.appendChild(createEffectsListItem(effect));
        }
    } else {
        strainEffectsNegativesList.textContent = noInfoText;
    }
    if (!Object.keys(helps_with).length === 0) {
        for (let effect in helps_with) {
            strainEffectsHelpsWithList.appendChild(createEffectsListItem(effect));
        }
    } else {
        strainEffectsHelpsWithList.textContent = noInfoText;
    }
}

const createEffectsListItem = (effect) => {
    const effectElement = document.createElement('li');
    effectElement.textContent = `${effect.replace(/_/g, ' ')}`;
    return effectElement;
}