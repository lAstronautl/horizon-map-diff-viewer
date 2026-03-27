const params = new URLSearchParams(document.location.search);
const oldImageUrl = params.get("old");
const newImageUrl = params.get("new");

var slider;
var oldImage;
var newImage;
var mapZoomable;
var mapContainer;
var isDragging = false;

var measures = {
    position: { x: 0, y: 0 },
    start: { x: 0, y: 0 },
    zoom: 1,
    zoom_last: 1,
    zoom_limit: { min: 0.1, max: 5 },
    pinch: null,
    panning: false
};

var settings = {
    centerMap: true,
    oldOffset: { x: 0, y: 0 },
    newOffset: { x: 0, y: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
    initDiffCompare();
});

function initDiffCompare() {
    slider = document.getElementById("slider");
    oldImage = document.getElementById("old-image");
    newImage = document.getElementById("new-image");
    mapZoomable = document.getElementById("map_zoomable");
    mapContainer = document.getElementById("map_container");

    if (!slider || !oldImage || !newImage || !mapZoomable) {
        console.error("Diff compare elements not found");
        return;
    }

    if (!oldImageUrl || !newImageUrl) {
        document.getElementById("controls").style.display = "none";
        return;
    }

    oldImage.src = oldImageUrl;
    newImage.src = newImageUrl;

    let loaded = 0;

    oldImage.onload = () => {
        loaded++;
        if (loaded === 2) initDiff();
    };

    newImage.onload = () => {
        loaded++;
        if (loaded === 2) initDiff();
    };

    function initDiff() {
        const width = Math.max(oldImage.naturalWidth, newImage.naturalWidth);
        const height = Math.max(oldImage.naturalHeight, newImage.naturalHeight);

        mapZoomable.style.width = width + "px";
        mapZoomable.style.height = height + "px";

        applyImagePositions(width, height);

        oldImage.style.width = oldImage.naturalWidth + "px";
        oldImage.style.height = oldImage.naturalHeight + "px";
        newImage.style.width = newImage.naturalWidth + "px";
        newImage.style.height = newImage.naturalHeight + "px";

        oldImage.style.display = "block";
        newImage.style.display = "block";
        slider.style.display = "block";

        measures.position.x = -(width / 2);
        measures.position.y = -(height / 2);
        measures.zoom = 0.5;
        measures.position.x = measures.position.x * measures.zoom + window.innerWidth / 2;
        measures.position.y = measures.position.y * measures.zoom + window.innerHeight / 2;
        update_transform();

        const initialPercent = 50;
        slider.style.left = initialPercent + "%";
        newImage.style.clipPath = `inset(0 0 0 ${initialPercent}%)`;
        oldImage.style.clipPath = `inset(0 ${100 - initialPercent}% 0 0)`;

        initControls();
    }

    function applyImagePositions(containerWidth, containerHeight) {
        let oldOffsetX, oldOffsetY, newOffsetX, newOffsetY;

        if (settings.centerMap) {
            oldOffsetX = (containerWidth - oldImage.naturalWidth) / 2;
            oldOffsetY = (containerHeight - oldImage.naturalHeight) / 2;
            newOffsetX = (containerWidth - newImage.naturalWidth) / 2;
            newOffsetY = (containerHeight - newImage.naturalHeight) / 2;
        } else {
            oldOffsetX = 0;
            oldOffsetY = 0;
            newOffsetX = 0;
            newOffsetY = 0;
        }

        oldOffsetX += settings.oldOffset.x;
        oldOffsetY += settings.oldOffset.y;
        newOffsetX += settings.newOffset.x;
        newOffsetY += settings.newOffset.y;

        oldImage.style.left = oldOffsetX + "px";
        oldImage.style.top = oldOffsetY + "px";
        newImage.style.left = newOffsetX + "px";
        newImage.style.top = newOffsetY + "px";
    }

    function initControls() {
        const centerMapCheckbox = document.getElementById("center-map");
        const newOffsetXInput = document.getElementById("new-offset-x");
        const newOffsetYInput = document.getElementById("new-offset-y");
        const oldOffsetXInput = document.getElementById("old-offset-x");
        const oldOffsetYInput = document.getElementById("old-offset-y");
        const applyOffsetBtn = document.getElementById("apply-offset");
        const resetOffsetBtn = document.getElementById("reset-offset");
        const zoomInBtn = document.getElementById("zoom-in");
        const zoomOutBtn = document.getElementById("zoom-out");
        const resetZoomBtn = document.getElementById("reset-zoom");
        const resetSliderBtn = document.getElementById("reset-slider");

        centerMapCheckbox.addEventListener("change", (e) => {
            settings.centerMap = e.target.checked;
            const width = parseFloat(mapZoomable.style.width);
            const height = parseFloat(mapZoomable.style.height);
            applyImagePositions(width, height);
        });

        applyOffsetBtn.addEventListener("click", () => {
            settings.newOffset.x = parseInt(newOffsetXInput.value) || 0;
            settings.newOffset.y = parseInt(newOffsetYInput.value) || 0;
            settings.oldOffset.x = parseInt(oldOffsetXInput.value) || 0;
            settings.oldOffset.y = parseInt(oldOffsetYInput.value) || 0;
            const width = parseFloat(mapZoomable.style.width);
            const height = parseFloat(mapZoomable.style.height);
            applyImagePositions(width, height);
        });

        resetOffsetBtn.addEventListener("click", () => {
            settings.newOffset.x = 0;
            settings.newOffset.y = 0;
            settings.oldOffset.x = 0;
            settings.oldOffset.y = 0;
            newOffsetXInput.value = 0;
            newOffsetYInput.value = 0;
            oldOffsetXInput.value = 0;
            oldOffsetYInput.value = 0;
            const width = parseFloat(mapZoomable.style.width);
            const height = parseFloat(mapZoomable.style.height);
            applyImagePositions(width, height);
        });

        zoomInBtn.addEventListener("click", () => {
            update_zoom(null, null, 1.2);
        });

        zoomOutBtn.addEventListener("click", () => {
            update_zoom(null, null, 0.8);
        });

        resetZoomBtn.addEventListener("click", () => {
            const width = parseFloat(mapZoomable.style.width);
            const height = parseFloat(mapZoomable.style.height);
            measures.position.x = -(width / 2);
            measures.position.y = -(height / 2);
            measures.zoom = 0.5;
            measures.position.x = measures.position.x * measures.zoom + window.innerWidth / 2;
            measures.position.y = measures.position.y * measures.zoom + window.innerHeight / 2;
            update_transform();
        });

        resetSliderBtn.addEventListener("click", () => {
            const initialPercent = 50;
            slider.style.left = initialPercent + "%";
            newImage.style.clipPath = `inset(0 0 0 ${initialPercent}%)`;
            oldImage.style.clipPath = `inset(0 ${100 - initialPercent}% 0 0)`;
        });
    }

    function get_event_location(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.clientX && e.clientY) {
            return { x: e.clientX, y: e.clientY };
        }
        return { x: 0, y: 0 };
    }

    function update_zoom(zoom_pos, e_pos, flat) {
        if (!zoom_pos) {
            zoom_pos = {
                x: Math.round((window.innerWidth / 2 - measures.position.x) / measures.zoom),
                y: Math.round((window.innerHeight / 2 - measures.position.y) / measures.zoom)
            };
        }
        if (!e_pos) {
            e_pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        }

        if (flat) {
            measures.zoom *= flat;
        }

        measures.zoom = parseFloat(measures.zoom.toFixed(2));
        measures.zoom = measures.zoom > measures.zoom_limit.max ? measures.zoom_limit.max : measures.zoom;
        measures.zoom = measures.zoom < measures.zoom_limit.min ? measures.zoom_limit.min : measures.zoom;

        measures.position = {
            x: Math.round(e_pos.x - zoom_pos.x * measures.zoom),
            y: Math.round(e_pos.y - zoom_pos.y * measures.zoom)
        };

        update_transform();
    }

    function update_transform() {
        if (!mapZoomable) return;

        if (measures.zoom >= 1) {
            mapZoomable.style.imageRendering = "pixelated";
            oldImage.style.imageRendering = "pixelated";
            newImage.style.imageRendering = "pixelated";
        } else {
            mapZoomable.style.imageRendering = "auto";
            oldImage.style.imageRendering = "auto";
            newImage.style.imageRendering = "auto";
        }

        mapZoomable.style.transform = `translate(${measures.position.x}px, ${measures.position.y}px) scale(${measures.zoom})`;
    }

    function on_mousedown(e) {
        e.preventDefault();
        const loc = get_event_location(e);
        measures.start = {
            x: loc.x - measures.position.x,
            y: loc.y - measures.position.y
        };
        measures.panning = true;
    }

    function on_mouseup() {
        measures.panning = false;
        measures.pinch = null;
        measures.zoom_last = measures.zoom;
    }

    function on_mousemove(e) {
        e.preventDefault();
        const loc = get_event_location(e);

        if (!measures.panning) return;

        measures.position = {
            x: loc.x - measures.start.x,
            y: loc.y - measures.start.y
        };

        update_transform();
    }

    function on_mousescroll(e, pinch) {
        if (measures.panning) return;
        e.preventDefault();

        const loc = get_event_location(e);
        const zoom_position = {
            x: Math.round((loc.x - measures.position.x) / measures.zoom),
            y: Math.round((loc.y - measures.position.y) / measures.zoom)
        };

        if (pinch) {
            measures.zoom = measures.zoom_last * pinch;
        } else {
            const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
            measures.zoom *= (delta > 0) ? 1.2 : 0.8;
        }

        update_zoom(zoom_position, loc);
    }

    function on_keydown(e) {
        switch (e.key) {
            case "-":
            case "_":
                update_zoom(null, null, 0.6);
                break;
            case "=":
            case "+":
                update_zoom(null, null, 1.5);
                break;
            case "h":
            case "a":
            case "ArrowLeft":
                measures.position.x += 75 * measures.zoom;
                update_transform();
                break;
            case "k":
            case "w":
            case "ArrowUp":
                measures.position.y += 75 * measures.zoom;
                update_transform();
                break;
            case "j":
            case "s":
            case "ArrowDown":
                measures.position.y -= 75 * measures.zoom;
                update_transform();
                break;
            case "l":
            case "d":
            case "ArrowRight":
                measures.position.x -= 75 * measures.zoom;
                update_transform();
                break;
            case "H":
            case "A":
                measures.position.x += 150 * measures.zoom;
                update_transform();
                break;
            case "J":
            case "W":
                measures.position.y += 150 * measures.zoom;
                update_transform();
                break;
            case "K":
            case "S":
                measures.position.y -= 150 * measures.zoom;
                update_transform();
                break;
            case "L":
            case "D":
                measures.position.x -= 150 * measures.zoom;
                update_transform();
                break;
            default:
                return;
        }
        e.preventDefault();
    }

    function on_touch(e, touch_handler) {
        if (e.touches.length === 1) {
            touch_handler(e);
        } else if (e.type === "touchmove" && e.touches.length === 2) {
            measures.panning = false;
            on_pinch(e);
        }
    }

    function on_pinch(e) {
        e.preventDefault();
        const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
        const current_distance = Math.sqrt(
            Math.pow(touch1.x - touch2.x, 2) + Math.pow(touch1.y - touch2.y, 2)
        );

        if (measures.pinch === null) {
            measures.pinch = current_distance;
        } else {
            const scale = current_distance / measures.pinch;
            update_zoom(null, {
                x: (touch1.x + touch2.x) / 2,
                y: (touch1.y + touch2.y) / 2
            }, scale);
            measures.pinch = current_distance;
        }
    }

    document.addEventListener("keydown", on_keydown);

    mapZoomable.addEventListener("mousedown", on_mousedown);
    window.addEventListener("mouseup", on_mouseup);
    mapZoomable.addEventListener("mousemove", on_mousemove);

    mapZoomable.addEventListener("wheel", on_mousescroll);

    mapZoomable.addEventListener("touchstart", (e) => on_touch(e, on_mousedown));
    window.addEventListener("touchend", on_mouseup);
    window.addEventListener("touchmove", (e) => on_touch(e, on_mousemove));

    slider.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.stopPropagation();
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const rect = mapZoomable.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;

        slider.style.left = percent + "%";
        newImage.style.clipPath = `inset(0 0 0 ${percent}%)`;
        oldImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    });

    slider.addEventListener("touchstart", (e) => {
        isDragging = true;
        e.stopPropagation();
    });

    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const rect = mapZoomable.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percent = (x / rect.width) * 100;

        slider.style.left = percent + "%";
        newImage.style.clipPath = `inset(0 0 0 ${percent}%)`;
        oldImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    });
}
