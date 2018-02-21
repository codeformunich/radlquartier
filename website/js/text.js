var Text = (function(window, d3) {
    var districts = null,
        description,
        link = '<a href="https://www.mvg.de/services/kontakt/kundendialog/lobundtadelformular12.html" target="_blank">hier</a>';


    d3.json('data/district_text.json', function(error, districtsData) {
        districts = districtsData;
    });

    function loadDistrict(id) {
        if (districts === null || districts === undefined ) { return; }

    	var selectedDistrict = districts.find( function(district) {
            return district.id === id;
        });
        $("#textH4").text(selectedDistrict.name);

        description = selectedDistrict.description;
        if (description.includes("[hier]")) {
            description = description.replace("[hier]", link);
        }
        $("#textP").html(description);

        $("#tdStationCount").text(selectedDistrict.stationCount);
        $("#tdArea").text(selectedDistrict.area + " km²");
        $("#tdInhabitants").text(selectedDistrict.inhabitants);
        $("#tdAreaMvg").text(selectedDistrict.areaMvg ? "ja" : "nein");
    }

    return {
        loadDistrict: loadDistrict
    };
})(window, d3);