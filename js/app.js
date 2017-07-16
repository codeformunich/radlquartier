var App = (function(window, document, d3) {
    var selctedDistrict = 0;

    function selectNewDistrict(id) {
        console.log({ type: 'selectNewDistrict', id: id, context: this });

        if (id !== null) {
            $('#detailCollapse').collapse('show');

            selctedDistrict = id;

            Text.loadDistrict(id);
            Chart.loadDistrict(id);
            Hexmap.loadDistrict(id);
        }
        else {
            $('#detailCollapse').collapse('hide');

            selctedDistrict = 0;
        }
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