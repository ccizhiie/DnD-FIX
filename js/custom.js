document.addEventListener('DOMContentLoaded', function() {
    var heroStart = document.querySelector('.hero-start');
    var bgImage = new Image();
    bgImage.src = '../assets/bg-start.png';

    bgImage.onload = function() {
        var aspectRatio = bgImage.height / bgImage.width;
        var newHeight = window.innerWidth * aspectRatio;
        heroStart.style.height = newHeight + 'px';
    }
});
