function compare() {
    const slider = document.getElementById("slider");
    const newMap = document.getElementById("new-image");
    const oldMap = document.getElementById("old-image");
    const container = document.querySelector(".map-compare");

    if (!slider || !newMap || !oldMap || !container) {
        return;
    }

    // Ждём загрузки изображений
    if (!newMap.complete || !newMap.naturalWidth) {
        newMap.onload = compare;
        return;
    }

    // Устанавливаем размеры контейнера по изображению
    container.style.width = newMap.naturalWidth + "px";
    container.style.height = newMap.naturalHeight + "px";

    let isDragging = false;

    // Инициализация - ставим слайдер на середину
    const initialPercent = 50;
    slider.style.left = initialPercent + "%";
    newMap.style.clipPath = `inset(0 0 0 ${initialPercent}%)`;
    oldMap.style.clipPath = `inset(0 ${100 - initialPercent}% 0 0)`;

    slider.addEventListener("mousedown", () => {
        isDragging = true;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left;

        x = Math.max(0, Math.min(x, rect.width));

        const percent = (x / rect.width) * 100;

        slider.style.left = percent + "%";
        newMap.style.clipPath = `inset(0 0 0 ${percent}%)`;
        oldMap.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    });

    // Touch support
    slider.addEventListener("touchstart", () => {
        isDragging = true;
    });

    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;

        const rect = container.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;

        x = Math.max(0, Math.min(x, rect.width));

        const percent = (x / rect.width) * 100;

        slider.style.left = percent + "%";
        newMap.style.clipPath = `inset(0 0 0 ${percent}%)`;
        oldMap.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    });
}
