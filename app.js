(function() {

  return {
      defaultState: 'loading',
      requests: {
            getSuspendedTickets: function(query){
                return {
                    url: "/api/v2/suspended_tickets.json",
                    type: "GET",
                    dataType: "json"
                };
            },
            getSuspendedTicketsByPage: function(query, x){
                return {
                    url: "/api/v2/suspended_tickets.json?page=" + x,
                    type: "GET",
                    dataType: "json"
                };
            },
      },
    events: {
      'app.activated':'doSomething'
    },

    doSomething: function() {
        //get suspended tickets.
        console.dir("test");
        this.ajax('getSuspendedTickets')
            .done(function(data) {
                if (data.count === 0){this.switchTo('suspendtypes');return;} //TODO: Add layout for nothing found
				var size = Math.ceil(data.count/100);
				var results = (size == 1) ? new Array(0) : new Array(size-2);
				results.push(data.results);
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true */
				    this.ajax('getSuspendedTicketsByPage', i+1)
				        .done(function(restdata){
				            results.push(restdata.results);
				        });
				}
            });
        //scan through results and find the different causes of suspension. Update the dropdow fields
        //allow user to select causes of suspension.
        //Add submit button to recover these tickets.
        console.dir(results);
        this.switchTo('suspendtypes');
    }
  };

}());