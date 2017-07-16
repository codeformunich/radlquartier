var App = (function(window, document, d3) {
    var selctedDistrict = 0,
        disrticts = null;

    d3.json('data/districts.json', function(error, districtsData) {
        districts = districtsData;
    });

    function selectNewDistrict(id) {
        console.log({ type: 'selectNewDistrict', id: id, context: this });

        if (id !== 0) {
            $('#detailCollapse').collapse('show');

            selctedDistrict = id;

            Text.loadDistrict(id);
            Chart.loadDistrict(id);
            Hexmap.loadDistrict(id);

            setNavBar();
        }
        else {
            $('#detailCollapse').collapse('hide');

            selctedDistrict = 0;
        }
    }

    function setNavBar() {
        var index,
            previousButton,
            nextButton,
            previousDistrict = 0,
            nextDistrict = 1;

        if(selctedDistrict === 0 || districts === null || districts === undefined) {
            return;
        }

        index = districts.findIndex( function(district) {
            return district.id === selctedDistrict;
        });
        if (index === 0) {
            previousDistrict = 0;
            nextDistrict = 1;
        }
        else if (index === 27) {
            previousDistrict = 26;
            nextDistrict = 27;
        }
        else {
            previousDistrict = index - 1;
            nextDistrict = index + 1;
        }

        previousButton = $('#previousbutton');
        nextButton = $('#nextbutton');

        previousButton.val(districts[previousDistrict].id);
        previousButton.html('<span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span> ' + districts[previousDistrict].name);

        nextButton.val(districts[nextDistrict].id);
        nextButton.html(districts[nextDistrict].name + ' <span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span>');
    }

    function clickedNextDistrict(e) {
        console.log({ type: 'clickedPreviousDistrict', event: e, context: this });

        var id = +e.currentTarget.value;

        selectNewDistrict(id);
    }

    function clickedUp(e) {
        console.log({ type: 'clickedUp', event: e, context: this });
    }

    $(document).ready(function() {
        window.addEventListener('resize', Chart.render);
        window.addEventListener('resize', Heatmap.render);

        $("#previousbutton").click(clickedNextDistrict);
        $("#nextbutton").click(clickedNextDistrict);
        $("#upbutton").click(clickedUp);
    });

    return {
        selectNewDistrict : selectNewDistrict
    };
})(window, document, d3);