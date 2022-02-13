/*Original python script credit
u/jplayzgamezevrnonsub
Big thank you to jimmosio for helping to get the calculator and filtration code working

THE DATES PROVIDED BY THIS CALCULATOR SHOULD NOT BE EXPECTED TO BE ACCURATE
THIS CALCULATOR WAS MADE AS A FUN GIMMICK, NOT SOMETHING YOU SHOULD BE TAKING AS FACT!

#If anybody is here to improve and or fix this code, feel free to credit youself. However some quick notes, please keep the original credits. 
They are deserved and removing them would be doing a disservice to me and the other people involved in this project.
Secondly, I know this code is probably a mess, but I'm trying my best, 
I'm only 15 and working with what I know. Feel free to critisize it all you like, 
but at least make what you say constructive. Lastly, if you make any fixes, and don't mind losing out of the fame a little. 
Let me know what to change and I will implement it into the main fork, (you will be credited, of course). 
I will also try to keep the data used by this code semi-up to date, so if you ever fork this try and do the same for the best results.
*/

//Should return a Date object.
function gecked(parameters, data) {
    if (parameters.order_avail == "After Q2") {
        throw "this calculator does not work for after q2 dates";
    }

    //Filter data to only include this region and model.
    const filtered = data.whereModelIs(parameters.model).whereRegionIs(parameters.region);

    const daysInQuarter = parameters.order_avail === "Q1" ? 34 : parameters.quarter_avail == "Q2" ? 91 : 61;
    const ans = daysInQuarter / filtered.responses.length;

    let userQueuePos = 0;

    let x = 0;
    let confirm = 0;
    while (confirm == 0) {
        if (parameters.rtReserveTime < filtered.responses[x].rtReserveTime && confirm == 0) {
            userQueuePos = x;
            confirm = 1;
        }
        x += 1;
    }

    userDate = daysInQuarter / filtered.responses.length;
    userDate = Math.ceil(ans * (userQueuePos + 1));

    const launchDate = new Date(1645812000000);
    const april = new Date(1648789200 * 1000);
    const millisInDay = 1000 * 60 * 60 * 24;

    if (parameters.order_avail == "Q1") {
        return new Date(launchDate.getTime() + (userDate * millisInDay));
    }
    if (parameters.order_avail == "Q2") {
        return new Date(april.getTime() + ((userDate) * millisInDay));
    }
    throw "bad state";
}