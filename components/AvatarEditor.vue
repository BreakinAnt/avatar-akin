<template>
    <div class="editor-root">
        <div class="avatar-container" tabindex="0" title="Right-click → Copy Image for full picture" @copy.prevent="exportAvatar('copy')">
            <canvas ref="avatarCanvas" class="avatar-canvas"></canvas>
        </div>

        <div class="avatar-export">
            <button class="export-btn" @click="exportAvatar('download')">⬇ Download</button>
            <button class="export-btn" @click="exportAvatar('copy')">⎘ Copy</button>
        </div>

        <div class="avatar-config">
            <div class="group-card" v-for="(group, index) in groups" :key="`group-${index}`">
                <p class="group-title">{{ group.getName() }}</p>

                <div class="feature-row">
                    <button
                        v-for="(feature, index) in group.members" :key="`feature-${index}`"
                        :class="['feature-btn', { active: group.active === feature }]"
                        @click="group.activate(feature)">
                        {{ feature.name }}
                    </button>
                </div>

                <p class="section-label">Color</p>

                <div class="color-row">
                    <button
                        v-for="(color, index) in colors" :key="`color-${index}`"
                        class="color-swatch"
                        :title="color.name"
                        :style="`background: rgb(${color.r}, ${color.g}, ${color.b})`"
                        @click="group.active.r = color.r; group.active.g = color.g; group.active.b = color.b;">
                    </button>
                </div>

                <div class="slider-row">
                    <span class="slider-label r">R</span>
                    <input type="range" v-model.number="group.active.r" min="0" max="255">
                    <span class="slider-val">{{ group.active.r }}</span>
                </div>
                <div class="slider-row">
                    <span class="slider-label g">G</span>
                    <input type="range" v-model.number="group.active.g" min="0" max="255">
                    <span class="slider-val">{{ group.active.g }}</span>
                </div>
                <div class="slider-row">
                    <span class="slider-label b">B</span>
                    <input type="range" v-model.number="group.active.b" min="0" max="255">
                    <span class="slider-val">{{ group.active.b }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import data from '@assets/avatar-data.json';
    import {Group} from '@assets/Group.js';
    import {Feature} from '@assets/Feature.js';
    import {Avatar} from '@assets/Avatar.js';

    const avatar = new Avatar();
    const groups = ref(avatar.groups);
    const colors = ref(data.color_options);
    const avatarCanvas = ref(null);
    let renderToken = 0;

    const imageCache = new Map();

    function loadImage(src) {
        if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => { imageCache.set(src, img); resolve(img); };
            img.onerror = reject;
            img.src = src;
        });
    }

    async function drawAvatar(canvas, snapshot) {
        if (!canvas) return;
        const token = ++renderToken;

        // Fetch all images concurrently — cached after first load, so instant on rerenders
        const [bg, ...layerImgs] = await Promise.all([
            loadImage('/avatar/bgc.jpg'),
            ...snapshot.map(layer => loadImage(layer.src)),
        ]);
        if (token !== renderToken) return;

        // Only resize if dimensions actually changed (resizing clears the canvas)
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        // Draw everything synchronously in one pass — no awaits, no partial frames
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bg, 0, 0, w, h);

        for (let i = 0; i < snapshot.length; i++) {
            const layer = snapshot[i];
            const tmp = document.createElement('canvas');
            tmp.width = w;
            tmp.height = h;
            const tmpCtx = tmp.getContext('2d');
            tmpCtx.drawImage(layerImgs[i], 0, 0, w, h);

            const imgData = tmpCtx.getImageData(0, 0, w, h);
            const d = imgData.data;
            for (let j = 0; j < d.length; j += 4) {
                d[j]     = d[j]     * layer.r / 255 | 0;
                d[j + 1] = d[j + 1] * layer.g / 255 | 0;
                d[j + 2] = d[j + 2] * layer.b / 255 | 0;
            }
            tmpCtx.putImageData(imgData, 0, 0);
            ctx.drawImage(tmp, 0, 0);
        }
    }

    watchEffect(() => {
        const snapshot = groups.value
            .filter(g => g.active)
            .sort((a, b) => a.index - b.index)
            .map(g => ({ src: g.getActiveFilepath(), r: g.active.r, g: g.active.g, b: g.active.b }));
        drawAvatar(avatarCanvas.value, snapshot);
    });

    async function exportAvatar(mode = 'download') {
        const canvas = avatarCanvas.value;
        if (!canvas) return;
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        if (mode === 'copy') {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'avatar.png';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    data.character.forEach((type, index) => {
        const group = new Group(type.name, index);

        type.contents.forEach((content, index) => {
            const feature = new Feature(content.name, content.filename, content.r, content.g, content.b);
            group.add(feature);
            if(index == 0){
                group.activate(feature);
            }
        });

        avatar.add(group);
    });
</script>

<style>
    .editor-root {
        display: flex;
        gap: 24px;
        padding: 24px;
        font-family: sans-serif;
        align-items: flex-start;
    }

    .avatar-container {
        width: 400px;
        height: 400px;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        outline: none;
        cursor: pointer;
    }

    .avatar-container:focus {
        box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 3px rgba(49, 130, 206, 0.5);
    }

    .avatar-canvas {
        display: block;
        width: 100%;
        height: 100%;
    }

    .avatar-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        max-height: 500px;
        overflow-y: auto;
    }

    .group-card {
        background: white;
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .group-title {
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #888;
        margin: 0 0 10px 0;
    }

    .section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #bbb;
        margin: 14px 0 6px 0;
    }

    .feature-row, .color-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .feature-btn {
        padding: 5px 14px;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        background: white;
        cursor: pointer;
        font-size: 13px;
        color: #444;
        transition: all 0.15s;
    }

    .feature-btn:hover { border-color: #aaa; }

    .feature-btn.active {
        background: #222;
        color: white;
        border-color: #222;
    }

    .color-swatch {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.15s;
    }

    .color-swatch:hover { transform: scale(1.25); }

    .slider-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
    }

    .slider-label {
        width: 12px;
        font-size: 12px;
        font-weight: 700;
    }

    .slider-label.r { color: #e53e3e; }
    .slider-label.g { color: #38a169; }
    .slider-label.b { color: #3182ce; }

    .slider-row input[type="range"] { flex: 1; }

    .slider-val {
        width: 28px;
        text-align: right;
        font-size: 12px;
        color: #999;
    }

    .avatar-export {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }

    .export-btn {
        flex: 1;
        padding: 8px 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        font-size: 13px;
        color: #444;
        transition: all 0.15s;
    }

    .export-btn:hover {
        background: #222;
        color: white;
        border-color: #222;
    }
</style>