/* Rating stars debug */
console.log("Star rating fix script loaded");

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        const ratingElements = document.querySelectorAll('.product-rating');

        ratingElements.forEach(element => {
            const productElement = element.closest('.product-info');
            const productTitle = productElement ? productElement.querySelector('.product-title')?.textContent : 'Unknown';

            const stars = element.querySelectorAll('i.bi');
            const ratingCount = element.querySelector('.rating-count');

            console.log(`Product: ${productTitle}`);
            console.log(`- Stars found: ${stars.length}`);
            console.log(`- Star classes: ${Array.from(stars).map(s => s.className).join(', ')}`);
            console.log(`- Rating count: ${ratingCount?.textContent}`);
        });
    }, 1000);
});
