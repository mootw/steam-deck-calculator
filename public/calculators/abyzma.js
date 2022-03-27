
function abyzma(parameters, data) {
 
	const minQ1 = (1646676000000)
	const maxQ1 = (1648749600000)
	const Q1Result = Math.floor(Math.random() * (maxQ1 - minQ1 + 1)) + minQ1;
	
	const minQ2 = (1648836000000)
	const maxQ2 = (1656612000000)
	const Q2Result = Math.floor(Math.random() * (maxQ2 - minQ2 + 1)) + minQ2;
	
	const minQ3 = (1656698400000)
	const maxQ3 = (1664553600000)
	const Q3Result = Math.floor(Math.random() * (maxQ3 - minQ3 + 1)) + minQ3;

	const minAQ3 = (1664640000000)
	const maxAQ3 = (3382365600000)
	const AQ3Result = Math.floor(Math.random() * (maxAQ3 - minAQ3 + 1)) + minAQ3;
	

    const millisInDay = 1000 * 60 * 60 * 24;

    if (parameters.order_avail == "Q1") {
        return new Date(Q1Result);
    }
    if (parameters.order_avail == "Q2") {
        return new Date(Q2Result);
    }
	if (parameters.order_avail == "Q3")
	{
		return new Date(Q3Result)
	}
	if (parameters.order_avail == "After Q3"){
		return new Date(AQ3Result);
	}
    throw "no thanks";
}