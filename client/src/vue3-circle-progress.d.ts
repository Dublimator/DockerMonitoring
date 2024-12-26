declare module 'vue3-circle-progress' {
    import { DefineComponent } from 'vue';

    const CircleProgress: DefineComponent<{}, {}, any>;
    export default CircleProgress;
}

declare module '*.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}