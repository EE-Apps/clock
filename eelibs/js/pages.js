class PagesManager {
    constructor(parameters) {
        
    }

    createBtnList(options, activeBtn = 'none') {
        const container = document.createElement('div')
        container.className = 'btnsList';
        options.forEach((btn) => {
            const el = document.createElement('button');
            const name = btn.name || btn.id || '';
            const id = btn.id || btn.name;

            el.innerHTML = `<div class="imgcont"><img src="${btn.img || 'img/ui/check/checked.svg'}"></div>${name}`;
            el.dataset.where = id;

            el.addEventListener('click', () => {
                // Fix: Get all buttons in container and remove active class
                container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                el.classList.add('active');
            });
            container.appendChild(el);
        })
        return(container);
    }
}

// Initialize immediately and make globally available
// RENAMED: window.pagesManager instead of window.pages to avoid conflict with pages array
console.log('Инициализация PagesManager...');
window.pagesManager = new PagesManager();
console.log('PagesManager инициализирован:', window.pagesManager);

// Export for module usage
export default PagesManager;
export { PagesManager };

// Dispatch event to signal that pagesManager is ready
window.dispatchEvent(new CustomEvent('pagesManagerReady'));

// Optional: Test after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - testing createBtnList...');
    console.log(window.pagesManager.createBtnList([
        {name:'all', id:'all', img:'img/ui/text.svg'}, 
        {name:'ы', id:'ы', img:'img/ui/color.svg'}
    ], 'ы'));
});
