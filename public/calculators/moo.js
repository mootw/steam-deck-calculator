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

//Calculate number of orders until now

//Since the source data is biased, the calculator will be most accurate for dates near the initial pre-order

function moo(parameters, data) {
  //July 16
  const preorder_date = new Date(1626454800000);
  //Feb 25
  const launchDate = new Date(1645812000000);

  const minsSincePreorder = (Date.now() - preorder_date.getTime()) / 1000 / 60;

  // const user_order_date = new Date(parameters.rtReserveTime * 1000);
  const user_order_mins = (parameters.rtReserveTime - 1626454800)/60;

  //TODO Remove data from  the set with a chance based on how close the lauch the data point was.
  //This will help reduce sampling bias when scaling the data.

  var us256 = 28000 / etimateOrderQuantityScalar(data.biasSample(), "US", "256", 60);
  var us512 = 55000 / etimateOrderQuantityScalar(data.biasSample(), "US", "512", 60);
  var eu256 = 5000 / etimateOrderQuantityScalar(data.biasSample(), "EU", "256", 60)
  var eu512 = 9600 / etimateOrderQuantityScalar(data.biasSample(), "EU", "512", 60);
  var uk512 = 7000 / etimateOrderQuantityScalar(data.biasSample(), "UK", "512", 60);

  //Calculate how much to scale the sample data-set.
  var averageScalar = (us256 + us512 + eu256 + eu512 + uk512) / 5;

  //Filter by order queue
  let newData = data.whereModelIs(parameters.model).whereRegionIs(parameters.region).biasSample();

  let order_quantity = [];
  let last_quantity = 0;
  for(let i = 0; i < minsSincePreorder; i++) {
    order_quantity.push(2); //Default to 2 order per minute as a minimum. Based on the steamdb steam deck quanitiy estimates.
    let timestamp = 1626454800 + ((i+1) * 60);
    let last_timestamp = 1626454800 + (i * 60);

    loop: for(const item of newData.responses) {
      if(item.rtReserveTime >= last_timestamp && item.rtReserveTime < timestamp) {
        order_quantity[i] = order_quantity[i] + averageScalar;
      }
    }
    //Do some data smoothing to get more realistic numbers.
    //Moving average.
    if(order_quantity[i] < last_quantity) {
      order_quantity[i] = (order_quantity[i] + last_quantity + last_quantity) / 3;
    }

    last_quantity = order_quantity[i];
  }

  // count = 0;
  // for(const order of order_quantity) {
  //   count += order;
  // }
  // throw count;

  // str = '';
  // for(let i = 0; i < 720; i++) {
  //   str += `<div style="background-color: red; height: 10px; width: ${order_quantity[i]/100}em;"></div> ${order_quantity[i]}<br>`;
  // }
  // throw str;

  //Calculate estimated decks in each quarter that valve plans to ship; filtered by model number
  let deliveriesQ1 = getOrdersThatAreInTimeFrame(newData, "Q1") * averageScalar;
  let deliveriesQ2 = getOrdersThatAreInTimeFrame(newData, "Q2") * averageScalar;
  let deliveriesAfter = getOrdersThatAreInTimeFrame(newData, "After Q2") * averageScalar;

  //throw `${deliveriesQ1} ${deliveriesQ2}`;

  //This is not a fantasic way to do it but it works.
  let decksPerDayQ1 = deliveriesQ1 / valveZones.Q1;
  let decksPerDayQ2 = deliveriesQ2 / valveZones.Q2;

  //throw `${decksPerDayQ1} ${decksPerDayQ2}`;

  //Calculate total throughput for each point in time.
  const daysSincePreorder = Math.ceil(minsSincePreorder / 1440) + 250;
  let valveThroughputDaily = Array(daysSincePreorder);
  valveThroughputDaily.fill(decksPerDayQ1, 0, valveZones.Q1);
  // valveThroughputDaily.fill(decksPerDayQ2, valveZones.Q1, valveZones.Q2);
  
  //Simulate ramping production after the start of Q2.
  //The simulator slowly diverged from valves esimate for Late Q2 dates
  //I suspect this is because valve anticipates ramping production.
  //Add X decks per day each day. Linear ramping.
  for(let i = valveZones.Q1; i < daysSincePreorder; i++) {
    valveThroughputDaily[i] = decksPerDayQ2 + (5 * i);
  }

  //Gets total number of units that are in line before the user.
  const user_order_position = ordersBetweenMins(order_quantity, 0, Math.round(user_order_mins));
  //throw user_order_position;

  let counter = 0;
  for(let i = 0; i < valveThroughputDaily.length; i++) {
    counter+= valveThroughputDaily[i];
    if(counter > user_order_position) {
      //the day was found!
      // throw i;
      return new Date(launchDate.getTime() + 1 + (i * 86400 * 1000));
    }
  }

  throw "Too far in the future... You will be waiting a long time.";
  
}


//Calculates the number of orders between 2 sets of minutes
function ordersBetweenMins (totals, start, end) {
  let count = 0;
  for (let i = start; i < end; i++) {
    count += totals[i];
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