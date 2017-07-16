var App = (function(window, document, d3) {

    function selectNewDistrict(id) {
        console.log({ type: 'selectNewDistrict', id: id, context: this });
    }

    function clickedPreviousDistrict(e) {
        console.log({ type: 'clickedPreviousDistrict', event: e, context: this });
    }

    function clickedNextDistrict(e) {
        console.log({ type: 'clickedNextDistrict', event: e, context: this });
    }

    function clickedUp(e) {
        console.log({ type: 'clickedUp', event: e, context: this });
    }

    $(document).ready(function() {
        window.addEventListener('resize', Chart.render);
        window.addEventListener('resize', Heatmap.render);

        $("#previousbutton").click(clickedPreviousDistrict);
        $("#nextbutton").click(clickedNextDistrict);
        $("#upbutton").click(clickedUp);
    });

    return {
        selectNewDistrict : selectNewDistrict
    };
})(window, document, d3);