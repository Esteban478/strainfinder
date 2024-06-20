let strainData = [];
const introductionText = document.querySelector('.introduction-text');

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            strainData = data;
            introductionText.classList.add('show');
        })
        .catch(error => console.error('Error fetching data:', error));
});
const searchInput = document.querySelector('#search');
let timeoutId;

// Debounce function
const debounce = (func, delay) => {
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

const filterData = (searchText, strainData) => {
    if (!searchText) return null;
    return strainData.filter(strain => {
        return (strain.name && typeof strain.name === 'string' && strain.name.toLowerCase().includes(searchText)) ||
            (strain.thc_level && typeof strain.thc_level === 'string' && strain.thc_level.toLowerCase().includes(searchText));
    });
}

const createCard = (strain) => {
    const card = document.createElement('div');
    card.classList.add('card', 'hidden');
    const name = document.createElement('h5');
    name.classList.add('card-header');
    name.textContent = strain.name;
    card.appendChild(name);

    const image = document.createElement('img');
    image.classList.add('card-img-top');
    const randomNum = Math.floor(Math.random() * 20) + 1;
    image.src = strain.img_url ? strain.img_url : `./assets/strain-${randomNum}.png`;
    image.width = 240;
    card.appendChild(image);

    const cardContent = document.createElement('div');
    cardContent.classList.add('card-body');
    card.appendChild(cardContent);

    const subTitle = document.createElement('h5');
    subTitle.classList.add('card-subtitle');
    cardContent.appendChild(subTitle);

    const thcContent = document.createElement('span');
    thcContent.textContent = strain.thc_level ? `THC: ${strain.thc_level}` : 'THC: N/A';
    subTitle.appendChild(thcContent);

    const type = document.createElement('span');
    type.textContent = `Type: ${strain.type}`;
    subTitle.appendChild(type);

    const description = document.createElement('p');
    description.classList.add('card-text', 'description');
    description.textContent = strain.description;
    cardContent.appendChild(description);
    return card;
}

searchInput.addEventListener('input', (event) => {
    debounce(() => {
        let searchText = event.target.value.toLowerCase();
        let resultContainer = document.querySelector('.result-container');
        resultContainer.innerHTML = '';
        introductionText.style.display = 'none';

        if (searchText === '') {
            // Clear previous results
            resultContainer = document.querySelector('.result-container');
            resultContainer.innerHTML = '';
            introductionText.style.display = 'block';
            return;
        }
        let filteredData = filterData(searchText, strainData);
        filteredData.forEach(strain => {
            const card = createCard(strain);
            resultContainer.appendChild(card);
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show')
                } else {
                    entry.target.classList.remove('show')
                }
            })
        })
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach((el) => observer.observe(el))
    }, 250)();
});