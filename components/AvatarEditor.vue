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
    <div class="avatar-container">
        <img v-for="(group, index) in groups" :key="`group-${index}`"
            class="avatar"
            :src="group.getActiveFilepath()"
            :style="`z-index: ${group.index}; filter: url(#avatar-color-${index});`"
        >
    </div>
    <div class="avatar-config">
        <div style="border-style: double;" v-for="(group, index) in groups" :key="`group-${index}`">
            <p>{{ group.getName() }}:</p>
            <button v-for="(feature, index) in group.members" :key="`feature-${index}`" @click="group.activate(feature)">{{ feature.name }}</button>

            <p>Color:</p>

            <button v-for="(color, index) in colors" :key="`color-${index}`" @click="group.active.r = color.r; group.active.g = color.g; group.active.b = color.b;">{{ color.name }}</button>

            R:<input type="range" v-model.number="group.active.r" min="0" max="255">
            G:<input type="range" v-model.number="group.active.g" min="0" max="255">
            B:<input type="range" v-model.number="group.active.b" min="0" max="255">
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
    .avatar-container {
        background-image: url(/avatar/bgc.jpg); 
        width: 70%; 
        height: 70%;
        position: relative;
    }

    .avatar {
        position: absolute; /* Allows images to overlap */
        top: 0; /* Aligns images to the top */
        left: 0; /* Aligns images to the left */
    }
</style>