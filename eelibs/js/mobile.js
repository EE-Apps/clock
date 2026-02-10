const mql = window.matchMedia("(orientation: landscape)");

const handleOrientation = (e) => {
    if (e.matches) {
        console.log("Сейчас горизонтально");
        window.isMobile = false; // Но помни: на ПК тоже бывает landscape!
    } else {
        console.log("Сейчас вертикально");
        window.isMobile = true;
    }
};

// Слушаем изменения
mql.addEventListener('change', handleOrientation);

// Первая проверка
handleOrientation(mql);
!isMobile ? document.getElementById('nav').classList.toggle('active') : null;