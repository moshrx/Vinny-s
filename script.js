const MENU_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHhO3JUvfIE4p36flI6C60cfIXKAtcalmqLLn2xDlpCbOEO7uwmZEbHaZXLk1mXWkMCgJkitHZeRyW/pub?gid=0&single=true&output=csv';
const DEALS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHhO3JUvfIE4p36flI6C60cfIXKAtcalmqLLn2xDlpCbOEO7uwmZEbHaZXLk1mXWkMCgJkitHZeRyW/pub?gid=577437850&single=true&output=csv';

let menuData = [];

async function init() {
    try {
        const [menuRes, dealsRes] = await Promise.all([
            fetch(MENU_CSV),
            fetch(DEALS_CSV)
        ]);

        const menuText = await menuRes.text();
        const dealsText = await dealsRes.text();

        const menuRows = menuText.split('\n').slice(1);
        menuData = menuRows.map(row => {
            const [cat, name, price, desc, img, itemDeal] = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return { 
                category: cat?.trim(), 
                name: name?.replace(/"/g, ''), 
                price: price?.trim(), 
                description: desc?.replace(/"/g, ''), 
                image: img?.trim(),
                itemDeal: itemDeal?.trim() 
            };
        }).filter(i => i.name);

        const dealsRows = dealsText.split('\n').slice(1);
        const bannerDeals = dealsRows.map(row => row.split(',')[0].replace(/"/g, '').trim()).filter(Boolean);

        renderBanner(bannerDeals);
        renderFilters();
        renderMenu('All');
        
    } catch (err) {
        console.error("Redsoil Error: Fetch failed", err);
    }
}

function renderBanner(deals) {
    if (deals.length === 0) return;
    const tickerWrap = document.getElementById('ticker-wrap');
    const tickerContent = document.getElementById('ticker-content');
    tickerWrap.classList.remove('hidden');
    const tickerText = deals.map(d => `<span>🔥 ${d}</span>`).join('');
    tickerContent.innerHTML = tickerText + tickerText + tickerText + tickerText;
    document.getElementById('main-header').style.top = '38px';
}

function renderFilters() {
    const categories = ['All', ...new Set(menuData.map(i => i.category))].filter(Boolean);
    const filterBar = document.getElementById('filter-bar');
    
    filterBar.innerHTML = categories.map(cat => `
        <button onclick="handleFilterClick(this, '${cat}')" class="filter-btn px-8 py-2 rounded-full font-bold text-xs uppercase transition whitespace-nowrap bg-white border border-stone-200 text-stone-500 hover:bg-red-50">
            ${cat}
        </button>
    `).join('');

    // Set the "All" button as active by default
    if(filterBar.firstElementChild) {
        setActiveBtn(filterBar.firstElementChild);
    }
}

// Fixed: This function now handles both the filtering and the button styling
function handleFilterClick(btn, category) {
    renderMenu(category);
    setActiveBtn(btn);
}

function setActiveBtn(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-red-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-stone-500');
    });
    activeBtn.classList.add('bg-red-600', 'text-white', 'shadow-md');
    activeBtn.classList.remove('bg-white', 'text-stone-500');
}

function renderMenu(category) {
    const grid = document.getElementById('menu-grid');
    const filtered = category === 'All' ? menuData : menuData.filter(i => i.category === category);

    const html = filtered.map(item => `
        <div class="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-fade-in">
            ${item.itemDeal ? `<div class="absolute top-0 right-0 bg-yellow-400 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase z-10">Special</div>` : ''}
            
            <div class="w-24 h-24 rounded-2xl bg-stone-200 overflow-hidden flex-shrink-0 relative">
                <img 
                    src="${item.image || 'https://via.placeholder.com/150'}" 
                    loading="lazy" 
                    class="w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105" 
                    alt="${item.name}"
                    onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('animate-pulse')"
                >
            </div>

            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-lg leading-tight">${item.name}</h3>
                    <span class="text-green-700 font-bold bg-green-50 px-2 py-1 rounded-lg text-sm">${item.price}</span>
                </div>
                <p class="text-stone-500 text-xs mt-1 leading-snug">${item.description}</p>
                ${item.itemDeal ? `<p class="text-red-600 text-[10px] font-black mt-2 uppercase flex items-center">✨ ${item.itemDeal}</p>` : ''}
            </div>
        </div>
    `).join('');

    grid.innerHTML = html;
}

// Back to Top Logic
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopBtn.classList.remove('opacity-0', 'translate-y-10');
        backToTopBtn.classList.add('opacity-100', 'translate-y-0');
    } else {
        backToTopBtn.classList.add('opacity-0', 'translate-y-10');
        backToTopBtn.classList.remove('opacity-100', 'translate-y-0');
    }
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

init();