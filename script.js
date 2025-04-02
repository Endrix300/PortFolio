document.addEventListener("DOMContentLoaded", function() {


    const resultsContainer = document.getElementById('results');
    const mylist = document.getElementById('cardList');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('search');
    const animeinfos = document.getElementById('anime');
    const returnIcon = document.getElementById('return');
    const headinfos = document.getElementById('headinfos');
    const listWatch = document.getElementById('listWatch');
    const listWatchbis = document.getElementById('listWatchbis');
    const listFavoris = document.getElementById('listFavoris');
    const listVus = document.getElementById('listVus');
    const listBest = document.getElementById('listBest');
    const watchlisttitle = document.getElementById('watchlisttitle');
    const watchlistbistitle = document.getElementById('watchlistbistitle');
    const favoristitle = document.getElementById('favoristitle');
    const vustitle = document.getElementById('vustitle');
    const besttitle = document.getElementById('besttitle');
    const sideBar = document.getElementById('sideBar');
    const bar1 = document.getElementById('bar1');
    const bar2 = document.getElementById('bar2');
    const bar3 = document.getElementById('bar3');
    const categoriesTitle = document.getElementById('categories-title');
    const arrowleft = document.getElementById('arrow-left');
    const arrowright = document.getElementById('arrow-right');
    const categoriesnav = document.getElementById('categories-nav');
    const genrebar = document.getElementById('genre-bars');
    const genrelist = document.getElementById('genres-list');
    const pagenumber = document.getElementById('page-number');
    const pageleft = document.getElementById('page-left');
    const pageright = document.getElementById('page-right');
    const pagenav = document.getElementById('page-nav');

    let byresult = false;
    let bycatalogue = false;
    let byplanning = false;
    let byrecommandation = false;
    let byaccueil = true;
    let watchList = [];
    let watchListbis = [];
    let favList = [];
    let vusList = [];
    let bestList = [];
    
    const fetchAnimeInfo = async (anime) => {
        if (!anime.id) {
            console.error("L'ID de l'anime est manquant.");
            return;
        }
     
        const response = await fetch(`https://api.jikan.moe/v4/anime/${anime.id}`);
        const data = await response.json();
        console.log("Données API:", data); // Vérifiez les données retournées par l'API
        return data;
    };
     
    let catalogueapi = "https://api.jikan.moe/v4/anime";
    let selectedGenres = []; // Liste des genres sélectionnés

    const fetchGenres = async () => {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/genres/anime`);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const genreContainer = document.getElementById('genre-container');

                data.data.forEach((genreData) => {
                    // Conteneur pour un genre
                    const genre = document.createElement('div');
                    genre.className = 'genre';


                    // Checkbox pour le genre
                    const check = document.createElement('input');
                    check.type = 'checkbox';
                    check.value = genreData.mal_id;

                    genre.onclick = function() {
                        if(check.checked == false){
                            check.checked = true
                            selectedGenres.push(check.value);
                        }else{
                            check.checked = false
                            selectedGenres = selectedGenres.filter(id => id !== check.value);
                        }
                        updateCatalogueApi();
                    };
                    

                    // Nom du genre
                    const name = document.createElement('span');
                    name.textContent = genreData.name;

                    // Ajouter les éléments dans le conteneur
                    genre.appendChild(check);
                    genre.appendChild(name);

                    // Ajouter le genre au conteneur principal
                    genreContainer.appendChild(genre);
                });
            } else {
                console.error('Aucun genre trouvé.');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des genres :', error);
        }
    };

    // Met à jour le lien catalogue API
    const updateCatalogueApi = () => {
        if (selectedGenres.length > 0) {
            const genresParam = selectedGenres.join(',');
            catalogueapi = `https://api.jikan.moe/v4/anime?page=${page}&genres=${genresParam}`;
        } else {
            catalogueapi = `https://api.jikan.moe/v4/anime?page=${page}`;
        }
        console.log('Lien API mis à jour :', catalogueapi);
    };

    const translateText = async (text, targetLang) => {
        const maxChars = 500;
        let translatedText = '';
        const segments = [];
        for (let i = 0; i < text.length; i += maxChars) {
            segments.push(text.slice(i, i + maxChars));
        }
        for (const segment of segments) {
            try {
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(segment)}&langpair=en|${targetLang}`);
                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                translatedText += data.responseData.translatedText;
            } catch (error) {
                console.error('Erreur lors de la traduction:', error);
                return null;
            }
        }
        return translatedText;
    };

    const createResultItem = (anime) => {
        const animeItem = document.createElement('div');
        animeItem.className = 'result-item';
        
        // Image de l'anime
        const animeImage = document.createElement('img');
        const imageUrl = anime.image || 'assets/Background.png';  // URL de l'image ou image par défaut
        animeImage.src = imageUrl;
        animeImage.alt = anime.title;
        animeImage.className = 'card-result';
        
        // Nom de l'anime
        const animeName = document.createElement('span');
        animeName.textContent = anime.title;
        animeName.className = 'dynamic-text';
        
        // Truncate title if it's too long
        if (anime.title.length > 20) {
            animeName.textContent = anime.title.slice(0, 17) + '...';
        }
    
        // Ajouter l'image et le nom à l'élément
        animeItem.appendChild(animeImage);
        animeItem.appendChild(animeName);
        
        // Ajouter un événement de clic pour afficher les infos détaillées
        animeItem.addEventListener('click', () => {
            displayAnimeInfo(anime);
        });
    
        return animeItem;
    };
    
    

    const displayAnimeInfo = async (anime) => {
        resultsContainer.classList.remove('flex');
        resultsContainer.classList.add('hidden');
        animeinfos.classList.remove('hidden');
        mylist.classList.add('hidden');
        genrelist.classList.add('hidden')
        genrelist.classList.remove('flex')
        categoriesnav.classList.add('hidden');
        categoriesnav.classList.remove('flex');
        pagenav.classList.add('hidden');
        pagenav.classList.remove('flex');
        animeinfos.innerHTML = '';
        headinfos.innerHTML = '';
        animeinfos.appendChild(headinfos);
        headinfos.appendChild(returnIcon);
    
        const nameinfos = document.createElement('h2');
        nameinfos.textContent = anime.title;
    
        const divanime = document.createElement('div');
        divanime.className = 'anime-infos';
    
        const imginfos = document.createElement('img');
        imginfos.src = anime.image;
        imginfos.alt = anime.title;
        imginfos.className = 'image-infos';
    
        const divsynopsis = document.createElement('div');
        divsynopsis.className = 'synopsis';
    
        const divbutton = document.createElement('div');
        divbutton.className = 'button-infos';
    
        const createButton = (text, iconClass, list, listElement, defaultColor, activeColor) => {
            const button = document.createElement('button');
            const buttonText = document.createElement('span');
            buttonText.textContent = text;
            button.className = iconClass;
            button.appendChild(buttonText);
        
            // Vérifier si l'anime est déjà dans la liste
            const animeIndex = list.findIndex(item => item.id === anime.id);
            button.style.backgroundColor = animeIndex === -1 ? defaultColor : activeColor;
    
            // Fonction pour mettre à jour la couleur du bouton
            const updateButtonColor = () => {
                const animeIndex = list.findIndex(item => item.id === anime.id);
                button.style.backgroundColor = animeIndex === -1 ? defaultColor : activeColor;
            };
    
            // Appel initial pour définir la couleur correcte
            updateButtonColor();
        
            button.onclick = function () {
                const existingIndex = list.findIndex(item => item.id === anime.id);
                
                if (existingIndex === -1) {
                    // Ajouter l'anime à la liste avec un élément DOM valide
                    const animeItem = createResultItem(anime);
                    listElement.appendChild(animeItem);
            
                    // Ajouter l'anime avec son élément DOM
                    list.push({ 
                        id: anime.id, 
                        title: anime.title, 
                        image: anime.image, 
                        element: animeItem // Enregistrez le Node valide
                    });
            
                    button.style.backgroundColor = activeColor;
                } else {
                    // Récupérer l'élément de la liste
                    const { element } = list[existingIndex];
            
                    // Vérifiez si l'élément est un Node valide
                    if (element && element instanceof Node) {
                        listElement.removeChild(element);  // Supprimez l'élément DOM
                        list.splice(existingIndex, 1);  // Supprimez l'élément de la liste
                        button.style.backgroundColor = defaultColor;
                    } else {
                        console.error("L'élément à supprimer n'est pas un Node valide:", element);
                    }
                }
            
                updateButtonColor(); // Mise à jour de la couleur après le clic        
            };            
            
                // Ajout des événements hover pour inverser les couleurs en fonction de la présence dans la liste
                button.addEventListener('mouseenter', () => {
                    const animeIndex = list.findIndex(item => item.id === anime.id);
                    button.style.backgroundColor = animeIndex === -1 ? activeColor : defaultColor;
                });
    
                button.addEventListener('mouseleave', () => {
                    updateButtonColor(); // Rétablit la couleur d'origine en fonction de la liste
                });
    
                return button;
            };
    
        const watchlistinfos = createButton("WATCHLIST", "fa-solid fa-tv", watchList, listWatch, "#0057b348", "#0057b3c3");
        const watchlistbisinfos = createButton("WATCHLIST-2", "fa-solid fa-tv", watchListbis, listWatchbis, "#ff008848", "#ff0088");
        const favorisinfos = createButton("FAVORIS", "fa-regular fa-star", favList, listFavoris, "#fdd30048", "#fdd300c3");
        const vusinfos = createButton("VUS", "fa-regular fa-eye", vusList, listVus, "#00c61448", "#00c614c3");
        const bestinfos = createButton("BEST", "fa-regular fa-star", bestList, listBest, "#8800ff48", "#8800ffc3");
    
        const response = await fetchAnimeInfo(anime);
        if (response && response.data) {
            const data = response.data;
            const genres = data.genres?.map(g => g.name).join(', ') || "Genres non disponibles";
            const synopsis = data.synopsis || "Synopsis non disponible";

            const translatedSynopsis = await translateText(synopsis, 'fr');
            const synopsisinfos = document.createElement('span');
            synopsisinfos.textContent = translatedSynopsis || synopsis;

            const genreinfos = document.createElement('span');
            genreinfos.textContent = genres;

            headinfos.appendChild(nameinfos);
            animeinfos.appendChild(divanime);
            divanime.appendChild(imginfos);
            divanime.appendChild(divsynopsis);
            divsynopsis.appendChild(divbutton);
            divbutton.appendChild(watchlistinfos);
            divbutton.appendChild(watchlistbisinfos);
            divbutton.appendChild(favorisinfos);
            divbutton.appendChild(vusinfos);
            divbutton.appendChild(bestinfos);
            divsynopsis.appendChild(synopsisinfos);
            divsynopsis.appendChild(genreinfos);
        } else {
            console.error("Les données de l'anime sont manquantes ou incorrectes.");
        }
    };
    


    
    const updateAnimeCount = () => {
        const numberWatchlist = watchList.length; // Assurez-vous que `listBest` est défini et contient un tableau.
        watchlisttitle.textContent = `WATCHLIST (${numberWatchlist})`;
        const numberWatchlistbis = watchListbis.length; // Assurez-vous que `listBest` est défini et contient un tableau.
        watchlistbistitle.textContent = `WATCHLIST-2 (${numberWatchlistbis})`;
        const numberFavoris = favList.length; // Assurez-vous que `listBest` est défini et contient un tableau.
        favoristitle.textContent = `FAVORIS (${numberFavoris})`;
        const numberVus = vusList.length; // Assurez-vous que `listBest` est défini et contient un tableau.
        vustitle.textContent = `VUS (${numberVus})`;
        const numberBest = bestList.length; // Assurez-vous que `listBest` est défini et contient un tableau.
        besttitle.textContent = `BEST (${numberBest})`;
    };
    

    const performSearch = async () => {
        document.documentElement.classList.remove('no-scroll');
        const query = searchInput.value;
        resultsContainer.innerHTML = '';
        categoriesnav.classList.add('hidden');
        categoriesnav.classList.remove('flex');
        pagenav.classList.add('hidden')
        pagenav.classList.remove('flex')
        genrebar.classList.remove('visible');

        if (query) {
            try {
                const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=25`);
                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    genrelist.classList.add('hidden');
                    genrelist.classList.remove('flex');
                    resultsContainer.classList.remove('hidden');
                    resultsContainer.classList.add('flex');
                    animeinfos.classList.add('hidden');
                    document.getElementById('catalogue').style ='background-color: #0057b300;';
                    document.getElementById('recommandation').style ='background-color: #0057b300;';
                    document.getElementById('planning').style ='background-color: #0057b300;';
                    document.getElementById('catalogue1').style ='background-color: #0057b300;';
                    document.getElementById('recommandation1').style ='background-color: #0057b300;';
                    document.getElementById('planning1').style ='background-color: #0057b300;';
                    byresult = true;
                    bycatalogue = false;
                    byplanning = false;
                    byrecommandation = false;
                    byaccueil = false;
                    data.data.forEach(anime => {
                        const animeItem = createResultItem({
                            id: anime.mal_id,
                            title: anime.title,
                            image: anime.images.jpg.image_url,
                        });
                        resultsContainer.appendChild(animeItem);
                    });
                    mylist.classList.add('hidden');
                } else {
                    resultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                resultsContainer.innerHTML = '<p>Une erreur est survenue lors de la recherche.</p>';
            }
        } else {
            resultsContainer.innerHTML = '<p>Veuillez entrer un nom d\'anime.</p>';
        }
    };



    const displayCatalogue = async (url, type) => {
        resultsContainer.innerHTML = '';
        document.documentElement.classList.remove('no-scroll');
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('flex');
        animeinfos.classList.add('hidden');
        mylist.classList.add('hidden');
        genrebar.classList.remove('visible');
        searchInput.value = '';
        sideBar.classList.remove('visible');
        bar1.classList.remove('bar1');
        bar2.classList.remove('bar2');
        bar3.classList.remove('bar3');
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.data && data.data.length > 0) {
                data.data.forEach(item => {
                    // Si c'est un catalogue
                    if (type == 'catalogue') {
                        genrelist.classList.remove('hidden');
                        genrelist.classList.add('flex');
                        arrowleft.classList.add('hidden');
                        arrowright.classList.add('hidden');
                        pagenav.classList.add('flex')
                        pagenav.classList.remove('hidden')
                        categoriesnav.classList.add('hidden');
                        categoriesnav.classList.remove('flex');
                        pagenumber.textContent = page
                        document.getElementById('catalogue').style ='background-color: #0057b366;';
                        document.getElementById('recommandation').style ='background-color: #0057b300;';
                        document.getElementById('planning').style ='background-color: #0057b300;';
                        document.getElementById('catalogue1').style ='background-color: #0057b366;';
                        document.getElementById('recommandation1').style ='background-color: #0057b300;';
                        document.getElementById('planning1').style ='background-color: #0057b300;';
                        byresult = false;
                        bycatalogue = true;
                        byplanning = false;
                        byrecommandation = false;
                        byaccueil = false;
                        const animeItem = createResultItem({
                            id: item.mal_id || "ID inconnu",
                            title: item.title || "Titre non disponible",
                            image: item.images?.jpg?.image_url || "default-image.jpg",
                        });
                        resultsContainer.appendChild(animeItem);

                    } if(type == 'recommandation') {
                        // Appeler la fonction pour récupérer et afficher les genres
                        genrelist.classList.add('hidden');
                        genrelist.classList.remove('flex');
                        arrowleft.classList.add('hidden');
                        arrowright.classList.add('hidden');
                        categoriesnav.classList.add('hidden');
                        categoriesnav.classList.remove('flex');
                        pagenav.classList.add('hidden')
                        pagenav.classList.remove('flex')
                        byresult = false;
                        bycatalogue = false;
                        byplanning = false;
                        byrecommandation = true;
                        byaccueil = false;
                        document.getElementById('catalogue').style ='background-color: #0057b300;';
                        document.getElementById('recommandation').style ='background-color: #0057b366;';
                        document.getElementById('planning').style ='background-color: #0057b300;';
                        document.getElementById('catalogue1').style ='background-color: #0057b300;';
                        document.getElementById('recommandation1').style ='background-color: #0057b366;';
                        document.getElementById('planning1').style ='background-color: #0057b300;';
                        // Si ce sont des recommandations
                        item.entry.forEach(anime => {
                            const animeItem = createResultItem({
                                id: anime.mal_id || "ID inconnu",
                                title: anime.title || "Titre non disponible",
                                image: anime.images?.jpg?.image_url || "default-image.jpg",

                            });
                            resultsContainer.appendChild(animeItem);
                        });
                    } if(type == 'planning'){
                        genrelist.classList.add('hidden');
                        genrelist.classList.remove('flex');
                        arrowleft.classList.remove('hidden');
                        arrowright.classList.remove('hidden');
                        categoriesnav.classList.remove('hidden');
                        categoriesnav.classList.add('flex');
                        pagenav.classList.add('hidden')
                        pagenav.classList.remove('flex')
                        document.getElementById('catalogue').style ='background-color: #0057b300;';
                        document.getElementById('recommandation').style ='background-color: #0057b300;';
                        document.getElementById('planning').style ='background-color: #0057b366;';
                        document.getElementById('catalogue1').style ='background-color: #0057b300;';
                        document.getElementById('recommandation1').style ='background-color: #0057b300;';
                        document.getElementById('planning1').style ='background-color: #0057b366;';
                        byresult = false;
                        bycatalogue = false;
                        byplanning = true;
                        byrecommandation = false;
                        byaccueil = false;
                        categoriesTitle.textContent = daysfr[day]
                        const animeItem = createResultItem({
                            id: item.mal_id || "ID inconnu",
                            title: item.title || "Titre non disponible",
                            image: item.images?.jpg?.image_url || "default-image.jpg",
                        });
                        resultsContainer.appendChild(animeItem);
                    }
                });
            } else {
                resultsContainer.innerHTML = '<p>Aucun anime trouvé.</p>';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données :', error);
            resultsContainer.innerHTML = '<p>Une erreur est survenue lors de la récupération des données.</p>';
        }
    };



    const daysfr = {
        0 : 'Dimanche',
        1 : 'Lundi',
        2 : 'Mardi',
        3 : 'Mercredi',
        4 : 'Jeudi',
        5 : 'Vendredi',
        6 : 'Samedi',
        7 : 'Inconnu',
        8 : 'Autres',
    }
    const daysen = {
        0 : 'Sunday',
        1 : 'Monday',
        2 : 'Tuesday',
        3 : 'Wednesday',
        4 : 'Thursday',
        5 : 'Friday',
        6 : 'Saturday',
        7 : 'Unknown',
        8 : 'Other',
    }
    const birthday = new Date();
    let day = birthday.getDay();
    
    
    document.getElementById('arrow-left').onclick = function() {
        if(day == 1){
            day = 9
        }if(day == 7){
            day = 1
        }if(day == 0){
            day = 7
        }
        day -= 1;
        categoriesTitle.textContent = daysfr[day]
        displayCatalogue(`https://api.jikan.moe/v4/schedules?filter=${daysen[day]}`, 'planning')
    };

    document.getElementById('arrow-right').onclick = function() {
        if(day == 6){
            day = -1
        }if(day == 0){
            day = 6
        }if(day == 8){
            day = 0
        }
        day += 1;
        categoriesTitle.textContent = daysfr[day]
        displayCatalogue(`https://api.jikan.moe/v4/schedules?filter=${daysen[day]}`, 'planning')
    };

    let page = 1;
    document.getElementById('page-left').onclick = function() {
        if(page > 1){
            page -=1
        }
        updateCatalogueApi();
        displayCatalogue(catalogueapi, 'catalogue');
    };

    document.getElementById('page-right').onclick = async function () {
        const fetchlimitpage = async () => {
            try {
                // Requête vers l'API
                const response = await fetch(catalogueapi);
                const data = await response.json();
    
                // Vérification et extraction du nombre total de pages
                if (data.pagination && data.pagination.last_visible_page) {
                    return data.pagination.last_visible_page;
                } else {
                    console.error('Aucune information sur la pagination trouvée.');
                    return 1; // Valeur par défaut si non disponible
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
                return 1; // Valeur par défaut en cas d'erreur
            }
        };
    
        // Récupérer la limite de pages via l'API
        const totalPages = await fetchlimitpage();
    
        // Mettre à jour la page si on est dans la limite
        if (page < totalPages) {
            page += 1;
        }
    
        // Mettre à jour l'API et afficher les résultats
        updateCatalogueApi();
        displayCatalogue(catalogueapi, 'catalogue');
    };
    
    // Ajouter des gestionnaires d'événements pour les clics
    document.getElementById('catalogue').onclick = () => displayCatalogue(catalogueapi, 'catalogue');
    document.getElementById('recommandation').onclick = () => displayCatalogue('https://api.jikan.moe/v4/recommendations/anime', 'recommandation');
    document.getElementById('planning').onclick = () => displayCatalogue(`https://api.jikan.moe/v4/schedules?filter=${daysen[day]}&limit=25`, 'planning');
    document.getElementById('catalogue1').onclick = () => displayCatalogue(catalogueapi, 'catalogue');
    document.getElementById('recommandation1').onclick = () => displayCatalogue('https://api.jikan.moe/v4/recommendations/anime', 'recommandation');
    document.getElementById('planning1').onclick = () => displayCatalogue(`https://api.jikan.moe/v4/schedules?filter=${daysen[day]}&limit=25`, 'planning');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            performSearch();
            searchInput.blur(); // Retire le focus de l'input
            searchInput.value = '';
        }
    });


    const returntoaccueil = async () => {
        // Réinitialisation de l'interface
        genrelist.classList.add('hidden');
        genrelist.classList.remove('flex');
        resultsContainer.classList.remove('flex');
        resultsContainer.classList.add('hidden');
        mylist.classList.remove('hidden');
        animeinfos.classList.add('hidden');
        categoriesnav.classList.add('hidden');
        categoriesnav.classList.remove('flex');
        pagenav.classList.add('hidden');
        pagenav.classList.remove('flex');
    
        document.getElementById('catalogue').style.backgroundColor = '#0057b300';
        document.getElementById('recommandation').style.backgroundColor = '#0057b300';
        document.getElementById('planning').style.backgroundColor = '#0057b300';
    
        // Réinitialisation des variables
        byresult = false;
        bycatalogue = false;
        byplanning = false;
        byrecommandation = false;
        byaccueil = true;
    
        searchInput.value = '';
        sideBar.classList.remove('visible');
        document.documentElement.classList.remove('no-scroll');

        loadListsFromGitHub();

        location.reload();
    };
    
    

    document.getElementById('accueil').onclick = function() {
        returntoaccueil();
    };
    document.getElementById('accueil1').onclick = function() {
        returntoaccueil();
    };


    document.getElementById('filtrebtn').onclick = function() {
        genrebar.classList.toggle('visible');
        // Appeler la fonction pour peupler les genres
        fetchGenres();
        // Activer ou désactiver le scroll en fonction de la visibilité
        if (genrebar.classList.contains('visible')) {
            document.documentElement.classList.add('no-scroll'); // Désactiver le scroll
        } else {
            document.documentElement.classList.remove('no-scroll'); // Réactiver le scroll
            displayCatalogue(catalogueapi, 'catalogue');
        }
    };


    document.getElementById('hamburger').onclick = function() {
        sideBar.classList.toggle('visible');
        genrebar.classList.remove('visible');
        bar1.classList.toggle('bar1')
        bar2.classList.toggle('bar2')
        bar3.classList.toggle('bar3')
        // Activer ou désactiver le scroll en fonction de la visibilité
        if (sideBar.classList.contains('visible')) {
            document.documentElement.classList.add('no-scroll'); // Désactiver le scroll
        } else {
            document.documentElement.classList.remove('no-scroll'); // Réactiver le scroll
        }
    };


    document.getElementById('return').onclick = function() {
        if (byresult) {
            resultsContainer.classList.add('flex');
            resultsContainer.classList.remove('hidden');
            animeinfos.classList.add('hidden');
        }if(byaccueil) {
            mylist.classList.remove('hidden');
            animeinfos.classList.add('hidden');
            categoriesnav.classList.add('hidden');
            categoriesnav.classList.remove('flex');
        }if(bycatalogue){
            resultsContainer.classList.add('flex');
            resultsContainer.classList.remove('hidden');
            animeinfos.classList.add('hidden');
            genrelist.classList.remove("hidden")
            genrelist.classList.add("flex")
            pagenav.classList.add('flex')
            pagenav.classList.remove('hidden')
        }if(byplanning){
            resultsContainer.classList.add('flex');
            resultsContainer.classList.remove('hidden');
            animeinfos.classList.add('hidden');
            categoriesnav.classList.remove('hidden');
            categoriesnav.classList.add('flex');
        }if(byrecommandation){
            resultsContainer.classList.add('flex');
            resultsContainer.classList.remove('hidden');
            animeinfos.classList.add('hidden');
        }
    };
    
    const targetWidth = 1000;

    window.addEventListener('resize', () => {
        // Vérifie si la largeur de la fenêtre atteint ou est inférieure à la taille cible
        if (window.innerWidth <= targetWidth) {
            // Masque 'ordi' et affiche 'phone'
            document.getElementById('ordi').classList.remove('block');
            document.getElementById('ordi').classList.add('hidden');
            document.getElementById('phone').classList.remove('hidden');
            // Change la feuille de style
            document.getElementById('style').setAttribute("href", "stylephone.css");
    
            if (bycatalogue) {
                console.log('vrai');
                document.getElementById('catalogue1').style.backgroundColor = '#0057b366';
                document.getElementById('recommandation1').style.backgroundColor = '#0057b300';
                document.getElementById('planning1').style.backgroundColor = '#0057b300';
            } else if (byplanning) {
                document.getElementById('catalogue1').style.backgroundColor = '#0057b300';
                document.getElementById('recommandation1').style.backgroundColor = '#0057b300';
                document.getElementById('planning1').style.backgroundColor = '#0057b366';
            } else if (byrecommandation) {
                document.getElementById('catalogue1').style.backgroundColor = '#0057b300';
                document.getElementById('recommandation1').style.backgroundColor = '#0057b366';
                document.getElementById('planning1').style.backgroundColor = '#0057b300';
            } else {
                document.getElementById('catalogue1').style.backgroundColor = '#0057b300';
                document.getElementById('recommandation1').style.backgroundColor = '#0057b300';
                document.getElementById('planning1').style.backgroundColor = '#0057b300';
            }
        } else {
            // Affiche 'ordi' et masque 'phone'
            document.getElementById('ordi').classList.add('block');
            document.getElementById('ordi').classList.remove('hidden');
            document.getElementById('phone').classList.add('hidden');
            // Change la feuille de style
            document.getElementById('style').setAttribute("href", "styleordi.css");
    
            if (bycatalogue) {
                document.getElementById('catalogue').style.backgroundColor = '#0057b366';
                document.getElementById('recommandation').style.backgroundColor = '#0057b300';
                document.getElementById('planning').style.backgroundColor = '#0057b300';
            } else if (byplanning) {
                document.getElementById('catalogue').style.backgroundColor = '#0057b300';
                document.getElementById('recommandation').style.backgroundColor = '#0057b300';
                document.getElementById('planning').style.backgroundColor = '#0057b366';
            } else if (byrecommandation) {
                document.getElementById('catalogue').style.backgroundColor = '#0057b300';
                document.getElementById('recommandation').style.backgroundColor = '#0057b366';
                document.getElementById('planning').style.backgroundColor = '#0057b300';
            } else {
                document.getElementById('catalogue').style.backgroundColor = '#0057b300';
                document.getElementById('recommandation').style.backgroundColor = '#0057b300';
                document.getElementById('planning').style.backgroundColor = '#0057b300';
            }
        }
    });
    
    
    // Applique la vérification lors du chargement initial
    if (window.innerWidth <= targetWidth) {
        document.getElementById('ordi').classList.add('hidden');
        document.getElementById('phone').classList.remove('hidden');
        document.getElementById('style').setAttribute("href", "stylephone.css");
    }

});
