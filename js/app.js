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
            
            var target = $('#detailCollapse');
            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1050); // 500 (0.5sek) legt Geschwindkeit fest
            }

        } else {
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
         var target = $('#top');
            if (target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1050); // 500 (0.5sek) legt Geschwindkeit fest
    }
}

    $(document).ready(function() {
        window.addEventListener('resize', Chart.render);
        window.addEventListener('resize', Heatmap.render);

        $("#previousbutton").click(clickedPreviousDistrict);
        $("#nextbutton").click(clickedNextDistrict);
        $("#upbutton").click(clickedUp);
    });

    return {
        selectNewDistrict: selectNewDistrict
    };
})(window, document, d3);