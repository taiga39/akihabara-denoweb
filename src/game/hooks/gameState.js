export const saveGameState = (state) => {
    localStorage.setItem('gameState', JSON.stringify(state));
};

export const loadGameState = () => {
    const savedState = localStorage.getItem('gameState');
    return savedState ? JSON.parse(savedState) : {
        current_scene: 'Login',
        answer_scene: []
    };
};