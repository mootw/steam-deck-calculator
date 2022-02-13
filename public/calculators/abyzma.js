
function abyzma(parameters, data) {
 
	const minQ1 = (1645812000000)
	const maxQ1 = (1648749600000)
	const Q1Result = Math.floor(Math.random() * (maxQ1 - minQ1 + 1)) + minQ1;
	
	const minQ2 = (1648836000000)
	const maxQ2 = (1656612000000)
	const Q2Result = Math.floor(Math.random() * (maxQ2 - minQ2 + 1)) + minQ2;
	
	const minAQ2 = (1656698400000)
	const maxAQ2 = (2209057200000)
	const AQ2Result = Math.floor(Math.random() * (maxAQ2 - minAQ2 + 1)) + minAQ2;
	

    const millisInDay = 1000 * 60 * 60 * 24;

    if (parameters.order_avail == "Q1") {
        return new Date(Q1Result);
    }
    if (parameters.order_avail == "Q2") {
        return new Date(Q2Result);
    }
	if (parameters.order_avail == "After Q2"){
		return new Date(AQ2Result);
	}
    throw "bad state";
}