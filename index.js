// Variabelen scatterplot
// Bronnen:
// https://github.com/d3/d3-scale/blob/master/README.md#schemeCategory10
// https://bl.ocks.org/mbostock/3887118 by Mike Bostock https://github.com/mbostock
// https://bl.ocks.org/mbostock/3885304 by Mike Bostock https://github.com/mbostock
// https://medium.com/@c_behrens/enter-update-exit-6cafc6014c36 by Christian Behrens https://medium.com/@c_behrens
// 
// 
// Benoem de margins/ daarna benoem ik de width en de height.
var marginScatter = {top: 30, right: 30, bottom: 30, left: 50},
    widthScatter = 500 - marginScatter.left - marginScatter.right,
    heightScatter = 1500 - marginScatter.top - marginScatter.bottom;

// Defineer de scales en de range van de x en y as
var xScatter = d3.scaleLinear()
    .range([0, widthScatter]);
var yScatter = d3.scaleLinear()
    .range([heightScatter, 0]);

// ik gebruik de color scheme van d3 https://github.com/d3/d3-scale/blob/master/README.md#schemeCategory20
var color = d3.scaleOrdinal(d3.schemeCategory20);
// defineer waar de axis komt te staan!
var xAxisScatter = d3.axisRight(xScatter);
// defineer waar de y axis komt te staan (alleen je gaat ze niet zien in het eind product)
var yAxisScatter = d3.axisLeft(yScatter);

// dotted selecteert de svg en geef daar de attributes voor width en height
var dotted = d3.select('.scatter')
    .attr('width', widthScatter + marginScatter.left + marginScatter.right)
    .attr('height', heightScatter + marginScatter.top + marginScatter.bottom);

// variabelen bar
// begin variabelen voor de barchart
// ik gebruik hier svg1 en vel aanduiding met 1. De reden hier voor is dat ik mijzelf niet wou verwarren tijdens het process.
// door svg normaal te gebruiken. 1 duidt hier voornamelijk dat ik dit als eerste heb gemaakt.
var svg1 = d3.select('.bars'),
    margin1 = {top: 20, right: 20, bottom: 30, left: 40},
    width1 = +svg1.attr('width') - margin1.left - margin1.right,
    height1 = +svg1.attr('height') - margin1.top - margin1.bottom;

/* 
hier geef ik de x en y as met daar in de scale en de range die straks bepaald hoe de datum(x) en totale tweets(y) afrond,
en ruimte geeft.
*/
var x1 = d3.scaleBand().rangeRound([0, width1]).padding(0.1),
    y1 = d3.scaleLinear().rangeRound([height1, 0]);

/* 
  Hier groepeer in de svg om vervolgens daar al mijn bars in te plaatsen.
*/
var g1 = svg1.append('g')
    .attr('transform', 'translate(' + margin1.left + ',' + margin1.top + ')');


// Data inladen
d3.text('tweets.csv', onload);

function onload(err, tweets) {
	if (err) throw err;
	
  /* 
   Hier geef ik variabelen aan de variabelen voor het verwijderen van de header gebruik ik substring. om tussen de variabelen
   deleteHeader en deleteEndDate te houden en de rest te verwijderen.
   Ik parse de tijd en daarna parse ik de rows. De rows parse ik naar csv omdat ik uiteindelijk het zelf wou nesten en benoemen.
*/
	var deleteHeader = tweets.indexOf('"918239532981669888');
	var deleteEndDate = tweets.indexOf('-');
	var deleteFooter = tweets.indexOf('"604004880');
	var deleteBeginDate = tweets.indexOf('"20');
	tweets = tweets.substring(deleteHeader, deleteFooter);
	var parseTime = d3.timeParse('%Y-%m-%d');
	var data = d3.csvParseRows(tweets, map);
	var dataBar = d3.csvParseRows(tweets, mapBar);

	// ik nest hier met d3.nest() ik maak hier een eigen 'nest' voor de datum zodat ik daaruit de juiste data kan toekennen.
  // Bij het juiste jaartal. 
 	 dataBar = d3.nest()
    .key(function(d) {
      return d.date; 
    })
    .entries(dataBar).map(function (aSort) {
      return {
        date: aSort.key,
        values: aSort.values
      };
    });

// de data die ik bij data en dataBar toevoegd met deze functie(s) komt omdat ik voor de scatterplot niet een geneste data nodig had.
// Ik denk dat door tijd ik dit misschien anders had kunnen oplossen. Alleen mijn visualisatie had dit liever zo  ¯\_(ツ)_/¯
// Iedergeval wat de functie doet is de data mappen aan de zelf benoemde key.
	function mapBar(d) {
		return {
			tweetId: d[0],
			date: d[3].split(' ')[0].split('-')[0],
      usedate: parseTime(d[3].split(' ')[0]),
			content: d[5],
			characters: d[5].length,
			retweet: d[6],
			completeURL: d[9]
		}
	}

  //  ☝️

	function map(d) {
		return {
			tweetId: d[0],
			date: parseTime(d[3].split(' ')[0]),
      usedate: parseTime(d[3].split(' ')[0]),
			deviceApp: d[4],
			content: d[5],
			characters: d[5].length,
			retweet: d[6],
			retweetFrom: d[7],
			completeURL: d[9]
		}
	}

// schrijf ik de domeinen van de x en y as voor de scatterplot chart
  xScatter.domain(d3.extent(data, function(d) { 
    return d.usedate; 
  }));
  yScatter.domain(d3.extent(data, function(d) { 
    return d.characters; 
  })).nice();

// Hier schrijf ik de domeinen voor de bar chart
  x1.domain(dataBar.map(function(d) {
    return d.date
  }));
  y1.domain([0, d3.max(dataBar, function(d) {
    return d.values.length;
  })]).nice();

/*
  ik pak de group die ik heb gemaakt en ik aak een groep aan met de class .axis.axis--x voor de xaxis.
  hiermee roep ik de x1 variabelen om de xaxis te tekenen.
 */
g1.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height1 + ')')
      .call(d3.axisBottom(x1));

/*
  ik pak de group die ik heb gemaakt en ik maak een groep aan met de class .axis.axis--y voor de xaxis.
  hiermee roep ik de y1 variabelen om de yaxis te tekenen. Daarna maken we een label aan die de text krijgt van Total tweets.
  Die 
 */
  g1.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y1).ticks(10))
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('All tweets');

/*
  Ik maak hier de bars aan en append ik de rectengles. Daarna kleuren we hem licht blauw. Daarna vullen we de x1 as met de datum.
  Daarna vullen de y1 as met de nests. Dit is als volgt date: '2011' values {[...]} <- Hierin zitten allemaal losse rows met waardes.
  Ik tel nu alle rows en plaatst dat als totalen in de y as , want elke record telt voor 1 tweet.  
 */
  g1.selectAll('.bar')
    .data(dataBar)
    .enter().append('rect')
      .attr('class', 'bar')
      .style('fill','lightblue')
      .attr('x', function(d) { return x1(d.date); })
      .attr('y', function(d) { return y1(d.values.length); })
      .attr('width', x1.bandwidth())
      .attr('height', function(d) { return height1 - y1(d.values.length); })
      .on('click', update);

// Nu voor wat interactie: Ik maak hier een functie aan genaamd update, want we gaan de scatterplot (die er nog niet is)
// in leven brengen.
  function update(data) {
// Hier maak ik een variabelen met de values van data.values wat ik praktisch hierboven doe met d.values. Het ding is..
// als ik dit niet zou doen. Zou de .data() functie niet helemaal lekker werken. Plus de scatterplot werkt niet hetzelfde als
// de barchart want we willen de totale tweets tegenover de characters.
    var fixedData = data.values;

    console.log(fixedData);
// ik slecteer alvast de dots en vult die met de data
    var selection = dotted.selectAll('.dot')
        .data(fixedData);
/*

  Hier ga ik in die selectie en voeg ik een circle toe en maak een class dot aan. Vervolgens voeg ik de grote van de radius toe.
  en gebruik ik de .usedata die ik heb aangemaakt door de datum met de split() los te maken van de tijd. en de te plaatsen
  op de x as. Op de Y as kijken we naar hoeveel characters er in de tweets zitten (dit heb ik gedaan door de (key)content zijn value te checken hoe lang die is. 
  Daarna gebruik ik de d3 kleuren en plaats ik daarin mijn d.characters om de bolletjes direct te kunnen opvullen.
  Daarna maken we een click functie die vervolgens de class showtweet selecteert en dan de text laat zien van d.content (dus de tweet)
 */
    selection.enter()
      .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', function(d) { 
         return xScatter(d.usedate); 
        })
        .attr('cy', function(d) { 
          return yScatter(d.characters); 
      })
        .style('fill', function(d) { 
          return color(d.characters); 
        })
        .on('click', function (d) {
          return d3.select('.showTweet')
          .select('a')
          .attr('href', 'https://twitter.com/_Vintelligent/status/'+ d.tweetId)
          .text(d.content);
          update();
        });
// de variabelen selection die de dots selecteert. Dit verwijdert de data en plaatst de nieuwe data in.
// omdat ik met circles werk gaat d3 tellen hoeveel bolletjes er zijn en kijkt of het eraf moet halen of erbij moet plaatsen.
      selection.exit().remove();
  }
}