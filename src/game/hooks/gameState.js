const SCENE_ORDER = [
    'Login',
    'CrossWord',
    'Pinch',
    'KeyBoard',
    'Stop',
    'Kanda',
    'Math',
    'Block',
    'Mario'
];

export const loadGameState = () => {
    const state = JSON.parse(localStorage.getItem('gameState')) || {};
    if (!state.current_scene) state.current_scene = SCENE_ORDER[0];
    if (!state.answer_scene) state.answer_scene = [];
    return state;
};

export const saveGameState = (state) => {
    localStorage.setItem('gameState', JSON.stringify(state));
};

export const getNextScene = (currentScene) => {
    const currentIndex = SCENE_ORDER.indexOf(currentScene);
    return SCENE_ORDER[currentIndex + 1] || SCENE_ORDER[0]; // 最後のシーンの場合は最初に戻る
};