<template>
    <svg width="0" height="0" style="position:absolute;overflow:hidden">
        <defs>
            <filter :id="`avatar-color-${index}`" v-for="(group, index) in groups" :key="`filter-${index}`" color-interpolation-filters="sRGB">
                <feColorMatrix type="matrix"
                    :values="`${group.active.r/255} 0 0 0 0  0 ${group.active.g/255} 0 0 0  0 0 ${group.active.b/255} 0 0  0 0 0 1 0`"
                />
            </filter>
        </defs>
    </svg>
    <div class="editor-root">
        <div class="avatar-container">
            <img v-for="(group, index) in groups" :key="`group-${index}`"
                class="avatar"
                :src="group.getActiveFilepath()"
                :style="`z-index: ${group.index}; filter: url(#avatar-color-${index});`"
            >
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
        background-image: url(/avatar/bgc.jpg);
        width: 400px;
        height: 400px;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .avatar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
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
</style>