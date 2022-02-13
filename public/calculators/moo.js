//Moo's method for calculating
//Should return a Date object.

//Magic numbers
//Taken from @thexpaw on twitter
//1:29 mins after tweeted. But data is likely about 20-30 mins stale
//NA512 = 55k
//NA256 = 28k
//EU512 = 9.6k
//EU256 = 5k
//UK512 = 7k

//Mins in each duration
const valveZones = {
  "Q1": 34,
  "Q2": 91
}

const demandRatios = {
  "64": 1,
  "256": 3,
  "512": 5,
  "SUM": 9 //sum of the other 3
}


//July 16
const preorder_date = new Date(1626454800000);
//Feb 25
const launchDate = new Date(1645812000000);

//Wont update unless u refresh page oh well..
const minsSincePreorder = (Date.now() - preorder_date.getTime()) / 1000 / 60;

//Since the source data is biased, the calculator will be most accurate for dates near the initial pre-order
async function moo(parameters, data) {

  // const user_order_date = new Date(parameters.rtReserveTime * 1000);
  const user_order_mins = (parameters.rtReserveTime - 1626454800)/60;

  //TODO Remove data from  the set with a chance based on how close the lauch the data point was.
  //This will help reduce sampling bias when scaling the data.

  //@penguain
  var us64 = 10000 / etimateOrderQuantityScalar(data, "US", "64", 60);
  //@thexpaw
  var us256 = 28000 / etimateOrderQuantityScalar(data, "US", "256", 60);
  var us512 = 55000 / etimateOrderQuantityScalar(data, "US", "512", 60);
  var eu256 = 5000 / etimateOrderQuantityScalar(data, "EU", "256", 60)
  var eu512 = 9600 / etimateOrderQuantityScalar(data, "EU", "512", 60);
  var uk512 = 7000 / etimateOrderQuantityScalar(data, "UK", "512", 60);

  //Calculate how much to scale the sample data-set.
  var averageScalar = (us256 + us512 + eu256 + eu512 + uk512 + us64) / 6;
  
  // throw averageScalar;

  var demandScalar = demandRatios[parameters.model]/demandRatios.SUM;
  //var demandScalar = 1;

  //Filter by order queue
  let newData = data.whereModelIs(parameters.model).whereRegionIs(parameters.region);
  //let newData = data;

  trends_data = await getGoogleTrendsData();

  let order_quantity = [];
  let last_quantity = 0;
  for(let i = 0; i < minsSincePreorder; i++) {
    order_quantity.push(0);
    let timestamp = 1626454800 + ((i+1) * 60);
    let last_timestamp = 1626454800 + (i * 60);

    loop: for(const item of newData.responses) {
      if(item.rtReserveTime >= last_timestamp && item.rtReserveTime < timestamp) {
        order_quantity[i] = order_quantity[i] + averageScalar;
      }
    }

    //Add in trends data.. This is truely magic numbers.
    
    order_quantity[i] = order_quantity[i] + (trends_data[i] * demandScalar); 

    //Do some data smoothing to get more realistic numbers.
    //Moving average.
    if(order_quantity[i] < last_quantity) {
      order_quantity[i] = (order_quantity[i] + last_quantity) / 2;
    }

    last_quantity = order_quantity[i];
  }

  //order_quantity = await getGoogleTrendsData();

  count = 0;
  for(const order of order_quantity) {
    count += order;
  }
  console.log(count);

  // str = '';
  // for(let i = 0; i < 3040; i+=1) {
  //   str += `<div style="background-color: red; height: 5px; width: ${order_quantity[i]/300}em;"></div> ${order_quantity[i]}<br>`;
  // }
  // throw str;

  //Calculate estimated decks in each quarter that valve plans to ship; filtered by model number
  let deliveriesQ1 = getOrdersThatAreInTimeFrame(newData, "Q1") * averageScalar;
  let deliveriesQ2 = getOrdersThatAreInTimeFrame(newData, "Q2") * averageScalar;
  let deliveriesAfter = getOrdersThatAreInTimeFrame(newData, "After Q2") * averageScalar;

  // throw `${deliveriesQ1} ${deliveriesQ2}`;

  //This is not a fantasic way to do it but it works.
  let decksPerDayQ1 = deliveriesQ1 / valveZones.Q1;
  let decksPerDayQ2 = deliveriesQ2 / valveZones.Q2;

  // throw `${decksPerDayQ1} ${decksPerDayQ2}`;

  //Calculate total throughput for each point in time.
  const daysToCalculate = 1234;
  let valveThroughputDaily = Array(daysToCalculate);
  valveThroughputDaily.fill(decksPerDayQ1, 0, valveZones.Q1);
  // valveThroughputDaily.fill(decksPerDayQ2, valveZones.Q1, valveZones.Q2);
  
  //Simulate ramping production after the start of Q2.
  //The simulator slowly diverged from valves esimate for Late Q2 dates
  //I suspect this is because valve anticipates ramping production.
  //Add X decks per day each day. Linear ramping.
  for(let i = valveZones.Q1; i < daysToCalculate; i++) {
    valveThroughputDaily[i] = decksPerDayQ2 + (3 * i);
  }

  //Gets total number of units that are in line before the user.
  const user_order_position = ordersBetweenMins(order_quantity, 0, user_order_mins);
  //throw user_order_position;

  let counter = 0;
  for(let i = 0; i < valveThroughputDaily.length; i++) {
    counter+= valveThroughputDaily[i];
    if(counter > user_order_position) {
      //the day was found!
      //throw i;
      return new Date(launchDate.getTime() + 1 + (i * 86400 * 1000));
    }
  }

  throw "Too far in the future... You will be waiting a long time unless valve can seriously pump production";
  
}


//Calculates the number of orders between 2 sets of minutes
//Runs at 1/60th scale for second level calculation
function ordersBetweenMins (totals, start, end) {
  let count = 0;
  for (let i = start; i < end; i+=1/60) {
    count += totals[Math.floor(i)]/60;
  }
  return count;
}

function etimateOrderQuantityScalar (data, region, model, minutes) {
  let newData = data.whereModelIs(model).whereRegionIs(region);
  let order_quantity = [];
  for(let i = 0; i < minutes+2; i++) {
    order_quantity.push(0); //Default to one order per minute as a minimum
    let timestamp = 1626454800 + ((i+1) * 60);
    let last_timestamp = 1626454800 + (i * 60);
    for(const item of newData.responses) {
      if(item.rtReserveTime >= last_timestamp && item.rtReserveTime < timestamp) {
        order_quantity[i]++;
      }
    }
  }

  count = 0;
  for(let i = 0; i < minutes; i++) {
    count += order_quantity[i];
  }
  return count;
}


//Get number of orders that valve estimates will be in as Q1, Q2, etc..
function getOrdersThatAreInTimeFrame (data, timeframe) {
  count = 0;
  for(const item of data.responses) {
    if(item.latestValveUpdate == timeframe) {
      count++;
    }
  }
  return count;
}



//Returns per day after pre-orders started the google trends data with some filtering to smooth it out.
//It is all magic numbers at this point....
//TODO scale this data for each model... Right now it is not.
async function getGoogleTrendsData () {

  const data = await (await fetch('2-12-22-google-trends-steam-deck.csv')).text();
  const parsed = parseCSV(data);

  let mins = Array(Math.ceil(minsSincePreorder));

  let processedData = [];
  for(const item of parsed) {
    if(!isNaN(item[1]) && item[1] != "") {
      processedData.push(
        {
          date: new Date(item[0]),
          value: +item[1],
        }
      );
    }
  }

  console.log(processedData[5].value);

  //Iterate through the minutes since launch
  for(let x = 0; x < mins.length; x++) {
    const minTime = new Date(preorder_date.getTime() + (60 * 1000 * x));

    //Iterate through the trends data
    for(let i = 0; i < processedData.length - 1; i++) {
      const currentDuration = processedData[i].date;
      const nextDuration = processedData[i+1].date;
      const value = processedData[i].value;
      const nextValue = processedData[i+1].value;
      
      //Mins between this and next datapoint
      const range = nextDuration.getTime() - currentDuration.getTime();
      //0 = near current value; 1 = near next value.
      const score = (minTime.getTime() - currentDuration.getTime())/range;
      //Calculate how far this point is along that range calculate a weighted average.
      const weightedAverage = (((1 - score) * value) + (nextValue * score)) / 2;

      if(minTime.getTime() >= currentDuration.getTime() && minTime.getTime() < nextDuration.getTime()) {
        //This minute is within this time
        mins[x] = weightedAverage / 2;
      }
    }
    if(mins[x] == undefined) {
      mins[x] = mins[x-1];
    }

  }

  return mins;
}