# VoltMap
An interactive visualisation of both age distribution and voting results in the Netherlands.

## Guide to make your own map
First, you must set the right country. Open `js/map.js` and at the top you find:
~~~~
//Set the country that is displayed
country = 'nl';
//For some countries (DE, NL), a more detailed map is also available. If you want to use it, put this variable to true.
detailedMap = true;
~~~~
Set variable `country` to the right country code. `detailedMap` should generally be set to true, except if a more detailed map is available for your country. Currently, that is only for Netherlands, Germany and Norway.

Open `index.html` and find element `<textarea id="csv" style="display:none;"></textarea>`. Replace its contents with your own CSV data. Make sure the column of the region name is called `name`.


