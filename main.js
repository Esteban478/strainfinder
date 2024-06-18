let strainData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('https://strainsapi.netlify.app/strains.json')
        .then(response => response.json())
        .then(data => {
            strainData = data;
        })
        .catch(error => console.error('Error fetching data:', error));
});

const searchInput = document.querySelector('#search');

searchInput.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    if (searchText === '') {
        // Clear previous results
        const resultContainer = document.querySelector('.result-container');
        resultContainer.innerHTML = '';
        return;
    }
    const filteredData = strainData.filter(strain => {
        // return (strain.name && typeof strain.name === 'string' && strain.name.toLowerCase().includes(searchText)) ||
        //     (strain.description && typeof strain.description === 'string' && strain.description.toLowerCase().includes(searchText));
        return (strain.name && typeof strain.name === 'string' && strain.name.toLowerCase().includes(searchText));
    });

    const resultContainer = document.querySelector('.result-container');
    resultContainer.innerHTML = ''; // Clear previous results

    filteredData.forEach(strain => {
        const card = document.createElement('div');
        card.classList.add('card');

        const image = document.createElement('img');
        const randomNum = Math.floor(Math.random() * 20) + 1;
        image.src = strain.img_url ? strain.img_url : `./assets/strain-${randomNum}.png`;
        image.width = 250;
        card.appendChild(image);

        const name = document.createElement('h3');
        name.textContent = strain.name;
        card.appendChild(name);

        const type = document.createElement('p');
        type.textContent = `Type: ${strain.type}`;
        card.appendChild(type);

        const thcContent = document.createElement('p');
        thcContent.textContent = strain.thc_level ? `THC: ${strain.thc_level}` : 'THC: N/A';
        card.appendChild(thcContent);

        const description = document.createElement('p');
        description.classList.add('description');
        description.textContent = strain.description;
        card.appendChild(description);

        resultContainer.appendChild(card);
    });
});