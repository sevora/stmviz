/*
 * This script is for orientation checks.
 * Makes sure that the device is in landscape.
 */
const mainGridDOM = document.getElementById('main-grid');
const orientationWarningDOM = document.getElementById('orientation-warning');

/*
 * This hides the main grid and displays a message
 * if the orientation is wrong.
 */
function mainGridOrientationCheck() {
    if (window.innerHeight >= window.innerWidth) {
        mainGridDOM.style.display = 'none';
        orientationWarningDOM.style.display = 'block';
        return;
    } 
    mainGridDOM.style.removeProperty('display');
    orientationWarningDOM.style.removeProperty('display');
}

window.addEventListener('resize', function() { mainGridOrientationCheck(); });

mainGridOrientationCheck();
