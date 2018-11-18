# VoltMap
An interactive visualisation of both age distribution and voting results.

## Guide to make your own map

### Step 1: copy the example
Create a copy of `examples/AustriaExample.html`. Open the copy in any editor (could be as simple as Notepad).

### Step 2: setting variables
Starting at line 18, you find the following content:

~~~~
//Set the country that is displayed
country = 'at';

//For some countries (DE, NL), a more detailed map is also available. If you want to use it, put this variable to true.
detailedMap = false;

//CSV column names of the political parties
parties = ['SPÖ','ÖVP','FPÖ','NEOS','PILZ','GRÜNE','GILT','KPÖ'];


//CSV column name of the age groups
agegroups = [
    'Under 15', '15-65', '65 and over'
];
~~~~

Set variable `country` to the right country code. `detailedMap` should generally be set to false, except if a more detailed map is available for your country. Currently, that is only for Netherlands, Germany and Norway.

### Step 3: adding your own CSV data
Find element `<textarea id="csv" style="display:none;"></textarea>`. Replace its contents with your own CSV data. Make sure the column of the region name is called `name`.
