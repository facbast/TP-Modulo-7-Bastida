// Claves en español (Traducila exige keys en ES). Deben ser IDÉNTICAS
// a las cargadas en el Admin (incluidos espacios y puntos).
// El Admin guarda el salto de línea como texto '\n' literal, por eso
// las keys multilínea lo usan así y se decodifican solo al mostrar
// (ver ml() en services/translations.js).
const sceneMainMenu =
{
    instructions: 'La pelota rebota sola.\\nMuévela de izquierda a derecha\\npara subir por las plataformas.\\n\\nEsquiva los pinchos.\\nCada metro cuenta',
    controls: '← → o A / D para moverse\\nR para reiniciar',
    record: 'Récord: {0} m',
    play: 'Pulsa ESPACIO o clic para jugar'
};

const sceneGame =
{
    height: 'Altura: {0} m',
    record: 'Récord: {0} m',
    help: '← → o A D para moverte'
};

const sceneGameOver =
{
    title: '¡EXPLOTÓ!',
    subtitle: 'La pelota se pinchó',
    score: '{0} m',
    newRecord: '★ ¡NUEVO RÉCORD! ★',
    record: 'Récord: {0} m',
    hints: 'ESPACIO / clic: reintentar\\nM: menú'
};

export default
{
    sceneMainMenu,
    sceneGame,
    sceneGameOver
};
